import { Image } from 'expo-image';
import { useCallback, useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import {
  FullscreenImageViewer,
  useImageGallery,
  type GalleryImage,
} from '@/components/media/fullscreen-image-viewer';
import { useTheme } from '@/hooks/use-theme';
import { mediaUrl } from '@/lib/media-url';
import type { Section, SectionItem } from '@/types/project';

type PhotoshootSectionContentProps = {
  section: Section | null;
};

function sortImageItems(items: SectionItem[] | undefined): SectionItem[] {
  return [...(items ?? [])]
    .filter((item) => item.kind === 'IMAGE' && item.file?.url)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function PhotoshootSectionContent({
  section,
}: PhotoshootSectionContentProps) {
  const { colors } = useTheme();
  const [pageWidth, setPageWidth] = useState(
    Dimensions.get('window').width - 40,
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const { openGallery, galleryProps } = useImageGallery();

  const imageItems = sortImageItems(section?.items);

  const galleryImages = useMemo((): GalleryImage[] => {
    return imageItems.flatMap((item) => {
      const uri = mediaUrl(item.file?.url);
      if (!uri) {
        return [];
      }
      return [{ uri, label: item.label }];
    });
  }, [imageItems]);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / pageWidth);
      setActiveIndex(index);
    },
    [pageWidth],
  );

  if (!section) {
    return (
      <Text style={[styles.empty, { color: colors.textSecondary }]}>
        No sections available.
      </Text>
    );
  }

  if (imageItems.length === 0) {
    return (
      <View style={styles.container}>
        {section.description ? (
          <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
            {section.description}
          </Text>
        ) : null}
        <View
          style={[
            styles.emptyBox,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
        >
          <Text style={[styles.empty, { color: colors.textSecondary }]}>
            No photos in this session.
          </Text>
        </View>
      </View>
    );
  }

  function renderItem({ item, index }: ListRenderItemInfo<SectionItem>) {
    const uri = mediaUrl(item.file?.url);

    return (
      <View style={[styles.page, { width: pageWidth }]}>
        {uri ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open photo fullscreen"
            onPress={() => openGallery(galleryImages, index)}
          >
            <Image
              source={{ uri }}
              style={[styles.image, { backgroundColor: colors.surface }]}
              contentFit="contain"
              transition={200}
            />
          </Pressable>
        ) : null}
        {item.label ? (
          <Text style={[styles.caption, { color: colors.text }]}>
            {item.label}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View
      style={styles.container}
      onLayout={(event) => {
        const width = event.nativeEvent.layout.width;
        if (width > 0) {
          setPageWidth(width);
        }
      }}
    >
      {section.description ? (
        <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
          {section.description}
        </Text>
      ) : null}

      <FlatList
        data={imageItems}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={pageWidth}
        snapToAlignment="start"
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={renderItem}
        getItemLayout={(_, index) => ({
          length: pageWidth,
          offset: pageWidth * index,
          index,
        })}
      />

      <Text style={[styles.counter, { color: colors.textSecondary }]}>
        {activeIndex + 1} / {imageItems.length}
      </Text>

      <FullscreenImageViewer {...galleryProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    minHeight: 280,
  },
  sectionDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  page: {
    gap: 8,
  },
  image: {
    width: '100%',
    height: 360,
    borderRadius: 12,
  },
  caption: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  counter: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyBox: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 48,
    paddingHorizontal: 16,
  },
  empty: {
    fontSize: 15,
    textAlign: 'center',
  },
});
