#!/usr/bin/env node
/**
 * MyVerse local Android release APK builder.
 *
 * Usage:
 *   node scripts/build-android.mjs              # full build
 *   node scripts/build-android.mjs --setup      # one-time machine setup wizard
 *   node scripts/build-android.mjs --clean      # regenerate android/ via prebuild
 *   node scripts/build-android.mjs --skip-prebuild
 *   node scripts/build-android.mjs --bundle     # AAB + bundletool universal APK
 *   node scripts/build-android.mjs --help
 *
 * See docs/BUILD_ANDROID.md for the full guide.
 */

import { spawnSync } from 'child_process';
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { createInterface } from 'readline';
import { dirname, join, resolve, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const BUILD_ENV_PATH = join(ROOT, 'android.build.env');
const BUILD_ENV_EXAMPLE = join(ROOT, 'android.build.env.example');
const ANDROID_DIR = join(ROOT, 'android');
const SIGNING_MARKER = 'MYVERSE_RELEASE_SIGNING';

const args = process.argv.slice(2);
const flags = {
  setup: args.includes('--setup'),
  clean: args.includes('--clean'),
  skipPrebuild: args.includes('--skip-prebuild'),
  bundle: args.includes('--bundle'),
  help: args.includes('--help') || args.includes('-h'),
};

function log(step, message) {
  console.log(`\n[${step}] ${message}`);
}

function fail(message) {
  console.error(`\n✗ ${message}`);
  console.error('  See docs/BUILD_ANDROID.md for help.\n');
  process.exit(1);
}

function run(cmd, cmdArgs, options = {}) {
  const { cwd = ROOT, env = process.env, label = cmd } = options;
  console.log(`  → ${label} ${cmdArgs.join(' ')}`);
  const result = spawnSync(cmd, cmdArgs, {
    cwd,
    env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    fail(`Command failed: ${label}`);
  }
}

function parseEnvFile(content) {
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function loadBuildEnv() {
  if (!existsSync(BUILD_ENV_PATH)) {
    fail(
      `Missing ${relative(ROOT, BUILD_ENV_PATH)}.\n  Complete docs/BUILD_ANDROID.md steps 1–5, then run: npm run build:apk:setup`,
    );
  }
  return parseEnvFile(readFileSync(BUILD_ENV_PATH, 'utf8'));
}

function saveBuildEnv(env) {
  const lines = readFileSync(BUILD_ENV_EXAMPLE, 'utf8').split('\n');
  const out = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return line;
    const eq = trimmed.indexOf('=');
    if (eq === -1) return line;
    const key = trimmed.slice(0, eq).trim();
    if (key in env) {
      return `${key}=${env[key]}`;
    }
    return line;
  });
  writeFileSync(BUILD_ENV_PATH, out.join('\n'), 'utf8');
}

async function prompt(question, defaultValue = '') {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const suffix = defaultValue ? ` [${defaultValue}]` : '';
  return new Promise((resolvePrompt) => {
    rl.question(`${question}${suffix}: `, (answer) => {
      rl.close();
      resolvePrompt(answer.trim() || defaultValue);
    });
  });
}

async function promptSecret(question) {
  if (!process.stdin.isTTY) {
    fail(`${question} — set in android.build.env or run interactively.`);
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolvePrompt) => {
    rl.question(`${question}: `, (answer) => {
      rl.close();
      resolvePrompt(answer);
    });
  });
}

function detectJavaHome() {
  if (process.env.JAVA_HOME) return process.env.JAVA_HOME;
  const candidates = [
    'C:\\Program Files\\Eclipse Adoptium',
    'C:\\Program Files\\Java',
    '/Library/Java/JavaVirtualMachines',
  ];
  for (const base of candidates) {
    if (!existsSync(base)) continue;
    try {
      for (const entry of readdirSync(base)) {
        const full = join(base, entry);
        if (process.platform === 'win32') {
          const bin = join(full, 'bin', 'java.exe');
          if (existsSync(bin)) return full;
        } else if (entry.endsWith('.jdk')) {
          const home = join(full, 'Contents', 'Home');
          if (existsSync(join(home, 'bin', 'java'))) return home;
        }
      }
    } catch {
      /* ignore */
    }
  }
  return '';
}

function detectAndroidHome() {
  if (process.env.ANDROID_HOME) return process.env.ANDROID_HOME;
  if (process.env.ANDROID_SDK_ROOT) return process.env.ANDROID_SDK_ROOT;
  const home = process.env.USERPROFILE || process.env.HOME || '';
  const candidates = [
    join(home, 'AppData', 'Local', 'Android', 'Sdk'),
    join(home, 'Library', 'Android', 'sdk'),
    join(home, 'Android', 'Sdk'),
  ];
  return candidates.find((p) => existsSync(p)) ?? '';
}

async function ensureProductionEnv() {
  const prodPath = join(ROOT, '.env.production');
  if (existsSync(prodPath)) {
    console.log('  ✓ .env.production exists');
    return;
  }
  const prodExample = join(ROOT, '.env.production.example');
  if (!existsSync(prodExample)) return;

  console.log('\n  Step 5 — Production API URL (.env.production)');
  console.log('  Release APKs bake in EXPO_PUBLIC_API_URL at build time.');
  console.log('  See docs/BUILD_ANDROID.md → Step 5\n');
  const copyProd = await prompt('Copy .env.production.example → .env.production? (Y/n)', 'Y');
  if (copyProd.toLowerCase() !== 'n') {
    copyFileSync(prodExample, prodPath);
    console.log('  ✓ Created .env.production');
  } else {
    console.log('  ⚠ Create .env.production before building — see docs/BUILD_ANDROID.md Step 5');
  }
}

async function ensureKeystore(keystorePath, keystoreAlias) {
  const absKeystore = resolve(ROOT, keystorePath);
  if (existsSync(absKeystore)) {
    console.log(`  ✓ Keystore found: ${keystorePath}`);
    return;
  }

  console.log('\n  Step 4 — Release keystore (REQUIRED before building)');
  console.log('  A keystore is a .keystore FILE that signs your APK.');
  console.log('  You need one before npm run build:apk will work.');
  console.log('  See docs/BUILD_ANDROID.md → Step 4 for full details.\n');
  console.log('  keytool will ask for:');
  console.log('    - Keystore password (save it — needed every build)');
  console.log('    - Your name / org (any values OK for testing)');
  console.log('    - Key password (press Enter to match keystore password)\n');
  console.log('  Manual command:');
  console.log(
    `  keytool -genkeypair -v -keystore "${absKeystore}" -alias ${keystoreAlias} -keyalg RSA -keysize 2048 -validity 10000\n`,
  );

  const generate = await prompt('Create keystore now with keytool? (Y/n)', 'Y');
  if (generate.toLowerCase() === 'n') {
    console.log('\n  ⚠ Create the keystore before running npm run build:apk');
    console.log('  See docs/BUILD_ANDROID.md → Step 4\n');
    return;
  }

  mkdirSync(dirname(absKeystore), { recursive: true });
  run('keytool', [
    '-genkeypair',
    '-v',
    '-keystore',
    absKeystore,
    '-alias',
    keystoreAlias,
    '-keyalg',
    'RSA',
    '-keysize',
    '2048',
    '-validity',
    '10000',
  ]);
  console.log('\n  ✓ Keystore created. Remember your password and alias!');
}

async function runSetup() {
  log('setup', 'MyVerse Android build — one-time machine setup');

  console.log(`
  ┌─────────────────────────────────────────────────────────────┐
  │  Complete these BEFORE this wizard (docs/BUILD_ANDROID.md) │
  ├─────────────────────────────────────────────────────────────┤
  │  1. npm install                                             │
  │  2. Install JDK 17        → JAVA_HOME                       │
  │  3. Install Android Studio → ANDROID_HOME (SDK path)        │
  │  4. Create release keystore → .keystore file (required)   │
  │  5. Copy .env.production.example → .env.production        │
  └─────────────────────────────────────────────────────────────┘
  `);

  if (!existsSync(BUILD_ENV_EXAMPLE)) {
    fail(`Missing template: ${relative(ROOT, BUILD_ENV_EXAMPLE)}`);
  }

  let existing = {};
  if (existsSync(BUILD_ENV_PATH)) {
    existing = parseEnvFile(readFileSync(BUILD_ENV_PATH, 'utf8'));
    console.log('  Found existing android.build.env — press Enter to keep current values.\n');
  } else {
    copyFileSync(BUILD_ENV_EXAMPLE, BUILD_ENV_PATH);
    existing = parseEnvFile(readFileSync(BUILD_ENV_PATH, 'utf8'));
  }

  const defaultKeystore = existing.KEYSTORE_PATH || './keystore/myverse-release.keystore';
  const defaultAlias = existing.KEYSTORE_ALIAS || 'myverse';

  await ensureProductionEnv();
  await ensureKeystore(defaultKeystore, defaultAlias);

  console.log('\n  Step 6 — Machine paths (saved to android.build.env)');
  console.log('  Press Enter to accept [bracketed] defaults.\n');

  const javaHome = await prompt(
    'JAVA_HOME — JDK 17 folder (contains bin/java.exe)',
    existing.JAVA_HOME || detectJavaHome(),
  );
  const androidHome = await prompt(
    'ANDROID_HOME — Android SDK folder (contains platform-tools/)',
    existing.ANDROID_HOME || detectAndroidHome(),
  );
  const keystorePath = await prompt(
    'KEYSTORE_PATH — .keystore file from step 4',
    defaultKeystore,
  );
  const keystoreAlias = await prompt(
    'KEYSTORE_ALIAS — alias used in keytool',
    defaultAlias,
  );
  const outputDir = await prompt(
    'OUTPUT_DIR — where APK is copied',
    existing.OUTPUT_DIR || './dist',
  );

  const env = {
    ...existing,
    JAVA_HOME: javaHome,
    ANDROID_HOME: androidHome,
    KEYSTORE_PATH: keystorePath,
    KEYSTORE_ALIAS: keystoreAlias,
    OUTPUT_DIR: outputDir,
  };
  saveBuildEnv(env);

  const absKeystore = resolve(ROOT, keystorePath);
  if (!existsSync(absKeystore)) {
    fail(
      `Keystore still missing: ${keystorePath}\n  Complete docs/BUILD_ANDROID.md Step 4, then re-run setup.`,
    );
  }

  console.log('\n✓ Setup complete.');
  console.log('  Next: npm run build:apk');
  console.log('  (You will be asked for your keystore password during the build.)\n');
}

function checkJava(javaHome) {
  if (!javaHome || !existsSync(javaHome)) {
    fail(`JAVA_HOME not set or path missing. Run: npm run build:apk:setup`);
  }
  const javaBin =
    process.platform === 'win32'
      ? join(javaHome, 'bin', 'java.exe')
      : join(javaHome, 'bin', 'java');
  if (!existsSync(javaBin)) {
    fail(`java not found at ${javaBin}`);
  }
  const result = spawnSync(javaBin, ['-version'], { encoding: 'utf8' });
  const versionOutput = (result.stderr || result.stdout || '').toString();
  console.log(`  Java: ${versionOutput.split('\n')[0] ?? versionOutput}`);
  if (/version "2[1-9]/.test(versionOutput)) {
    console.warn('  ⚠ JDK 21+ may cause Gradle issues. JDK 17 is recommended.');
  }
}

function checkAndroidSdk(androidHome) {
  if (!androidHome || !existsSync(androidHome)) {
    fail(`ANDROID_HOME not set or path missing. Run: npm run build:apk:setup`);
  }
  const platformTools =
    process.platform === 'win32'
      ? join(androidHome, 'platform-tools', 'adb.exe')
      : join(androidHome, 'platform-tools', 'adb');
  if (!existsSync(platformTools)) {
    fail(`Android SDK platform-tools not found under ${androidHome}`);
  }
  console.log(`  ANDROID_HOME: ${androidHome}`);
}

function loadProductionEnv() {
  const prodPath = join(ROOT, '.env.production');
  const envPath = join(ROOT, '.env');
  let apiUrl = '';

  if (existsSync(prodPath)) {
    const parsed = parseEnvFile(readFileSync(prodPath, 'utf8'));
    apiUrl = parsed.EXPO_PUBLIC_API_URL ?? '';
    if (apiUrl) {
      process.env.EXPO_PUBLIC_API_URL = apiUrl;
      console.log(`  Using .env.production → EXPO_PUBLIC_API_URL=${apiUrl}`);
    }
  } else if (existsSync(envPath)) {
    const parsed = parseEnvFile(readFileSync(envPath, 'utf8'));
    apiUrl = parsed.EXPO_PUBLIC_API_URL ?? '';
    if (apiUrl) {
      process.env.EXPO_PUBLIC_API_URL = apiUrl;
      console.log(`  Using .env → EXPO_PUBLIC_API_URL=${apiUrl}`);
    }
  }

  if (!apiUrl) {
    console.log('  No EXPO_PUBLIC_API_URL in .env.production — using app default from config.ts');
  } else if (/localhost|127\.0\.0\.1/.test(apiUrl)) {
    console.warn('  ⚠ API URL contains localhost — release APK will not reach your dev server.');
    console.warn('    Copy .env.production.example → .env.production for production builds.');
  }
}

function getAppVersion() {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  return pkg.version ?? '1.0.0';
}

function runPrebuild(clean) {
  const prebuildArgs = ['expo', 'prebuild', '--platform', 'android'];
  if (clean) prebuildArgs.push('--clean');
  run('npx', prebuildArgs, { label: 'prebuild' });
}

function writeKeystoreProperties(buildEnv, storePassword, keyPassword) {
  const keystorePath = resolve(ROOT, buildEnv.KEYSTORE_PATH);
  if (!existsSync(keystorePath)) {
    fail(
      `Keystore not found: ${buildEnv.KEYSTORE_PATH}\n  Create it first — docs/BUILD_ANDROID.md Step 4:\n  keytool -genkeypair -v -keystore keystore\\myverse-release.keystore -alias myverse -keyalg RSA -keysize 2048 -validity 10000`,
    );
  }

  const storeFileRelative = relative(join(ANDROID_DIR, 'app'), keystorePath).replace(/\\/g, '/');
  const props = [
    `storeFile=${storeFileRelative}`,
    `storePassword=${storePassword}`,
    `keyAlias=${buildEnv.KEYSTORE_ALIAS}`,
    `keyPassword=${keyPassword}`,
    '',
  ].join('\n');

  writeFileSync(join(ANDROID_DIR, 'keystore.properties'), props, 'utf8');
  console.log('  Wrote android/keystore.properties');
}

function patchAndroidSigning() {
  const buildGradlePath = join(ANDROID_DIR, 'app', 'build.gradle');
  if (!existsSync(buildGradlePath)) {
    fail('android/app/build.gradle not found — run prebuild first');
  }

  let content = readFileSync(buildGradlePath, 'utf8');

  const signingBlock = `
// ${SIGNING_MARKER} — injected by scripts/build-android.mjs (do not edit manually)
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
`;

  const signingConfigsPatch = `
        release {
            if (keystorePropertiesFile.exists()) {
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }`;

  if (!content.includes(SIGNING_MARKER)) {
    content = content.replace(/^android\s*\{/m, `android {${signingBlock}`);
    content = content.replace(
      /(signingConfigs\s*\{\s*\n\s*debug\s*\{[\s\S]*?\n\s*\})/m,
      `$1${signingConfigsPatch}`,
    );
    content = content.replace(
      /(release\s*\{[\s\S]*?)signingConfig signingConfigs\.debug/m,
      `$1signingConfig keystorePropertiesFile.exists() ? signingConfigs.release : signingConfigs.debug`,
    );
    writeFileSync(buildGradlePath, content, 'utf8');
    console.log('  Patched android/app/build.gradle for release signing');
  } else {
    console.log('  android/app/build.gradle already patched for release signing');
  }
}

async function resolvePasswords(buildEnv) {
  let storePassword = buildEnv.KEYSTORE_PASSWORD ?? '';
  let keyPassword = buildEnv.KEY_PASSWORD ?? storePassword;

  if (!storePassword) {
    storePassword = await promptSecret('Keystore password');
  }
  if (!keyPassword) {
    keyPassword = await promptSecret('Key password (Enter if same as keystore)');
    if (!keyPassword) keyPassword = storePassword;
  }
  return { storePassword, keyPassword };
}

function gradleEnv(buildEnv) {
  return {
    ...process.env,
    JAVA_HOME: buildEnv.JAVA_HOME,
    ANDROID_HOME: buildEnv.ANDROID_HOME,
    ANDROID_SDK_ROOT: buildEnv.ANDROID_HOME,
  };
}

function gradlewCommand() {
  return process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
}

function buildApkDirect(buildEnv) {
  const gradle = gradlewCommand();
  run(
    gradle,
    [':app:assembleRelease'],
    { cwd: ANDROID_DIR, env: gradleEnv(buildEnv), label: 'gradle' },
  );
  return join(ANDROID_DIR, 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
}

function buildAab(buildEnv) {
  const gradle = gradlewCommand();
  run(
    gradle,
    [':app:bundleRelease'],
    { cwd: ANDROID_DIR, env: gradleEnv(buildEnv), label: 'gradle' },
  );
  return join(ANDROID_DIR, 'app', 'build', 'outputs', 'bundle', 'release', 'app-release.aab');
}

function extractUniversalApkFromApks(apksPath, outputApk) {
  const outDir = join(dirname(apksPath), '_apks_extract');
  mkdirSync(outDir, { recursive: true });

  if (process.platform === 'win32') {
    const zipPath = `${apksPath}.zip`;
    copyFileSync(apksPath, zipPath);
    run('powershell', [
      '-Command',
      `Expand-Archive -Path '${zipPath}' -DestinationPath '${outDir}' -Force`,
    ]);
  } else {
    run('unzip', ['-o', apksPath, '-d', outDir]);
  }

  const universal = join(outDir, 'universal.apk');
  if (!existsSync(universal)) fail('universal.apk not found after extracting .apks');
  copyFileSync(universal, outputApk);
}

function buildApkViaBundletool(buildEnv, storePassword, keyPassword) {
  const bundletoolJar = resolve(ROOT, buildEnv.BUNDLETOOL_JAR || './tools/bundletool-all.jar');
  if (!existsSync(bundletoolJar)) {
    fail(
      `Bundletool JAR not found: ${bundletoolJar}\n  Download from https://github.com/google/bundletool/releases\n  Set BUNDLETOOL_JAR in android.build.env`,
    );
  }

  const aabPath = buildAab(buildEnv);
  const apksPath = join(dirname(aabPath), 'myverse-universal.apks');
  const keystorePath = resolve(ROOT, buildEnv.KEYSTORE_PATH);

  run('java', [
    '-jar',
    bundletoolJar,
    'build-apks',
    `--bundle=${aabPath}`,
    `--output=${apksPath}`,
    '--mode=universal',
    `--ks=${keystorePath}`,
    `--ks-key-alias=${buildEnv.KEYSTORE_ALIAS}`,
    `--ks-pass=pass:${storePassword}`,
    `--key-pass=pass:${keyPassword}`,
  ]);

  const tempApk = join(dirname(apksPath), 'universal.apk');
  extractUniversalApkFromApks(apksPath, tempApk);
  return tempApk;
}

function copyToDist(sourceApk, buildEnv) {
  const version = getAppVersion();
  const outputDir = resolve(ROOT, buildEnv.OUTPUT_DIR || './dist');
  mkdirSync(outputDir, { recursive: true });
  const dest = join(outputDir, `myverse-${version}.apk`);
  cpSync(sourceApk, dest);
  return dest;
}

function printHelp() {
  console.log(`
MyVerse Android APK builder

Read docs/BUILD_ANDROID.md "From zero to APK" before your first build.

Commands:
  npm run build:apk:setup   Steps 1–5 first, then save machine paths
  npm run build:apk         Build release APK → dist/

Options:
  --setup          Run setup wizard only
  --clean          Regenerate android/ folder (expo prebuild --clean)
  --skip-prebuild  Skip prebuild when android/ already exists
  --bundle         Build via AAB + bundletool (needs BUNDLETOOL_JAR)
  --help           Show this help

Documentation: docs/BUILD_ANDROID.md
`);
}

async function main() {
  if (flags.help) {
    printHelp();
    return;
  }

  if (flags.setup) {
    await runSetup();
    return;
  }

  console.log('\n═══════════════════════════════════════════');
  console.log('  MyVerse — local Android release APK build');
  console.log('═══════════════════════════════════════════');

  log('1/6', 'Loading android.build.env');
  const buildEnv = loadBuildEnv();

  log('2/6', 'Checking JDK and Android SDK');
  checkJava(buildEnv.JAVA_HOME);
  checkAndroidSdk(buildEnv.ANDROID_HOME);

  log('3/6', 'Loading production environment');
  loadProductionEnv();

  log('4/6', 'Preparing native android/ project');
  const androidExists = existsSync(ANDROID_DIR);
  if (flags.skipPrebuild && !androidExists) {
    fail('android/ missing but --skip-prebuild was passed');
  }
  if (!flags.skipPrebuild) {
    if (!androidExists || flags.clean) {
      console.log(
        flags.clean
          ? '  Regenerating android/ (expo prebuild --clean)'
          : '  android/ not found — running expo prebuild',
      );
      runPrebuild(flags.clean);
    } else {
      console.log('  android/ exists — skipping prebuild (use --clean to regenerate)');
    }
  } else {
    console.log('  Skipping prebuild (--skip-prebuild)');
  }

  log('5/6', 'Configuring release signing');
  const { storePassword, keyPassword } = await resolvePasswords(buildEnv);
  writeKeystoreProperties(buildEnv, storePassword, keyPassword);
  patchAndroidSigning();

  log('6/6', flags.bundle ? 'Building AAB + universal APK (bundletool)' : 'Building release APK (Gradle)');
  const builtApk = flags.bundle
    ? buildApkViaBundletool(buildEnv, storePassword, keyPassword)
    : buildApkDirect(buildEnv);

  if (!existsSync(builtApk)) {
    fail(`Expected APK not found: ${builtApk}`);
  }

  const dest = copyToDist(builtApk, buildEnv);
  console.log('\n✓ Build complete');
  console.log(`  APK: ${dest}`);
  console.log('\n  Install on a connected device:');
  const adb =
    process.platform === 'win32'
      ? join(buildEnv.ANDROID_HOME, 'platform-tools', 'adb.exe')
      : join(buildEnv.ANDROID_HOME, 'platform-tools', 'adb');
  console.log(`  "${adb}" install -r "${dest}"\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
