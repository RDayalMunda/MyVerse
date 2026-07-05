import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type GalleryImage = {
  uri: string;
  label?: string;
};

type FullscreenImageViewerProps = {
  visible: boolean;
  images: GalleryImage[];
  initialIndex?: number;
  onClose: () => void;
};

export function FullscreenImageViewer({
  visible,
  images,
  initialIndex = 0,
  onClose,
}: FullscreenImageViewerProps) {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<GalleryImage>>(null);
  const [pageWidth, setPageWidth] = useState(Dimensions.get('window').width);
  const [pageHeight, setPageHeight] = useState(
    () => Dimensions.get('window').height * 0.7,
  );
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const index = Math.min(Math.max(initialIndex, 0), Math.max(images.length - 1, 0));
    setActiveIndex(index);
    requestAnimationFrame(() => {
      if (images.length > 0) {
        listRef.current?.scrollToIndex({ index, animated: false });
      }
    });
  }, [visible, initialIndex, images.length]);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / pageWidth);
      setActiveIndex(index);
    },
    [pageWidth],
  );

  function goToIndex(index: number) {
    if (index < 0 || index >= images.length) {
      return;
    }
    listRef.current?.scrollToIndex({ index, animated: true });
    setActiveIndex(index);
  }

  function renderItem({ item }: ListRenderItemInfo<GalleryImage>) {
    return (
      <View style={[styles.page, { width: pageWidth, height: pageHeight }]}>
        <Image
          source={{ uri: item.uri }}
          style={{ width: pageWidth, height: pageHeight }}
          contentFit="contain"
          transition={200}
        />
      </View>
    );
  }

  const currentLabel = images[activeIndex]?.label;
  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < images.length - 1;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={styles.backdrop}
        onLayout={(event) => {
          const width = event.nativeEvent.layout.width;
          if (width > 0) {
            setPageWidth(width);
          }
        }}
      >
        <View
          style={[
            styles.header,
            { paddingTop: insets.top + 8, paddingHorizontal: 16 },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close image viewer"
            onPress={onClose}
            style={styles.iconButton}
          >
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </Pressable>
          {images.length > 1 ? (
            <Text style={styles.counter}>
              {activeIndex + 1} / {images.length}
            </Text>
          ) : (
            <View style={styles.headerSpacer} />
          )}
          <View style={styles.headerSpacer} />
        </View>

        {images.length > 0 ? (
          <View
            style={styles.listWrap}
            onLayout={(event) => {
              const height = event.nativeEvent.layout.height;
              if (height > 0) {
                setPageHeight(height);
              }
            }}
          >
            <FlatList
              ref={listRef}
              style={[styles.list, { height: pageHeight }]}
              data={images}
              extraData={{ pageWidth, pageHeight }}
              keyExtractor={(item, index) => `${item.uri}-${index}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              onScroll={onScroll}
              scrollEventThrottle={16}
              renderItem={renderItem}
              getItemLayout={(_, index) => ({
                length: pageWidth,
                offset: pageWidth * index,
                index,
              })}
              onScrollToIndexFailed={(info) => {
                requestAnimationFrame(() => {
                  listRef.current?.scrollToOffset({
                    offset: info.averageItemLength * info.index,
                    animated: false,
                  });
                });
              }}
            />
          </View>
        ) : null}

        {images.length > 1 ? (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous image"
              disabled={!canGoPrev}
              onPress={() => goToIndex(activeIndex - 1)}
              style={[
                styles.navButton,
                styles.navPrev,
                { opacity: canGoPrev ? 1 : 0.35 },
              ]}
            >
              <Ionicons name="chevron-back" size={32} color="#FFFFFF" />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next image"
              disabled={!canGoNext}
              onPress={() => goToIndex(activeIndex + 1)}
              style={[
                styles.navButton,
                styles.navNext,
                { opacity: canGoNext ? 1 : 0.35 },
              ]}
            >
              <Ionicons name="chevron-forward" size={32} color="#FFFFFF" />
            </Pressable>
          </>
        ) : null}

        {currentLabel ? (
          <View
            style={[
              styles.footer,
              { paddingBottom: insets.bottom + 16, paddingHorizontal: 16 },
            ]}
          >
            <Text style={styles.caption}>{currentLabel}</Text>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

export function useImageGallery() {
  const [visible, setVisible] = useState(false);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [initialIndex, setInitialIndex] = useState(0);

  function openGallery(nextImages: GalleryImage[], startIndex = 0) {
    if (nextImages.length === 0) {
      return;
    }
    setImages(nextImages);
    setInitialIndex(startIndex);
    setVisible(true);
  }

  function closeGallery() {
    setVisible(false);
  }

  return {
    openGallery,
    galleryProps: {
      visible,
      images,
      initialIndex,
      onClose: closeGallery,
    },
  };
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  listWrap: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  headerSpacer: {
    width: 44,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counter: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  page: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -24,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  navPrev: {
    left: 8,
  },
  navNext: {
    right: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  caption: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
