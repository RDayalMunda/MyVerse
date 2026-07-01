import { type Href, router } from 'expo-router';

/** Clear modal/stack history and land on a root route after auth changes. */
export function resetNavigationTo(href: Href) {
  if (router.canDismiss()) {
    router.dismissAll();
  }
  router.replace(href);
}
