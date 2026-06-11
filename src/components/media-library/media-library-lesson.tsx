import { Asset } from 'expo-asset';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import * as MediaLibrary from 'expo-media-library';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LessonNotes } from '@/components/lesson-notes/lesson-notes';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

type MediaFilter = 'all' | 'photo' | 'video';

const FILTERS: { id: MediaFilter; label: string; type: MediaLibrary.MediaTypeValue }[] = [
  { id: 'all', label: 'All', type: MediaLibrary.MediaType.all },
  { id: 'photo', label: 'Photos', type: MediaLibrary.MediaType.photo },
  { id: 'video', label: 'Videos', type: MediaLibrary.MediaType.video },
];

function formatAccess(accessPrivileges?: string) {
  if (!accessPrivileges) {
    return 'Unknown';
  }

  return accessPrivileges.charAt(0).toUpperCase() + accessPrivileges.slice(1);
}

export function MediaLibraryLesson() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = MediaLibrary.usePermissions();
  const [filter, setFilter] = useState<MediaFilter>('all');
  const [albums, setAlbums] = useState<MediaLibrary.Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<MediaLibrary.Album | null>(null);
  const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<MediaLibrary.AssetInfo | null>(null);
  const [endCursor, setEndCursor] = useState<string | undefined>();
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const ensureReadPermission = useCallback(async () => {
    if (permission?.granted) {
      return true;
    }

    const result = await requestPermission();
    return result.granted;
  }, [permission?.granted, requestPermission]);

  const loadAlbums = async () => {
    const granted = await ensureReadPermission();
    if (!granted) {
      Alert.alert('Permission required', 'Media library access is needed to browse albums.');
      return;
    }

    const fetchedAlbums = await MediaLibrary.getAlbumsAsync({ includeSmartAlbums: true });
    setAlbums(fetchedAlbums.slice(0, 8));
    setStatusMessage(`Loaded ${fetchedAlbums.length} albums.`);
  };

  const loadAssets = useCallback(
    async (append = false) => {
      const granted = await ensureReadPermission();
      if (!granted) {
        Alert.alert('Permission required', 'Media library access is needed to browse assets.');
        return;
      }

      setIsLoading(true);

      try {
        const mediaType = FILTERS.find((item) => item.id === filter)?.type ?? MediaLibrary.MediaType.all;
        const page = await MediaLibrary.getAssetsAsync({
          first: 12,
          after: append ? endCursor : undefined,
          album: selectedAlbum ?? undefined,
          mediaType,
          sortBy: [[MediaLibrary.SortBy.creationTime, false]],
        });

        setAssets((current) => (append ? [...current, ...page.assets] : page.assets));
        setEndCursor(page.endCursor);
        setHasNextPage(page.hasNextPage);
        setStatusMessage(
          append
            ? `Loaded ${page.assets.length} more assets.`
            : `Showing ${page.assets.length} recent assets.`,
        );
      } catch (error) {
        Alert.alert('Load failed', error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    },
    [endCursor, filter, ensureReadPermission, selectedAlbum],
  );

  const inspectAsset = async (asset: MediaLibrary.Asset) => {
    try {
      await Haptics.selectionAsync();
      const info = await MediaLibrary.getAssetInfoAsync(asset, { shouldDownloadFromNetwork: true });
      setSelectedAsset(info);
      setStatusMessage(`Selected ${info.filename ?? 'asset'} (${info.mediaType}).`);
    } catch {
      setSelectedAsset({
        ...asset,
        localUri: asset.uri,
      });
      setStatusMessage(
        Platform.OS === 'android'
          ? `Showing basic metadata for ${asset.filename}. Rebuild the app and grant media location access for full EXIF details.`
          : `Showing basic metadata for ${asset.filename}.`,
      );
    }
  };

  const saveSampleImage = async () => {
    try {
      const writePermission = await MediaLibrary.requestPermissionsAsync(true);
      if (!writePermission.granted) {
        Alert.alert('Save permission required', 'Allow photo library access to save images.');
        return;
      }

      const sample = Asset.fromModule(require('@/assets/images/expo-logo.png'));
      await sample.downloadAsync();

      if (!sample.localUri) {
        throw new Error('Could not resolve a local file path for the sample image.');
      }

      await MediaLibrary.saveToLibraryAsync(sample.localUri);
      setStatusMessage('Sample image saved to your gallery.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await loadAssets(false);
    } catch (error) {
      Alert.alert('Save failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const openLimitedPicker = async () => {
    try {
      await MediaLibrary.presentPermissionsPickerAsync();
      setStatusMessage('If access was limited, you can adjust selected photos in the system picker.');
      await loadAssets(false);
    } catch (error) {
      Alert.alert(
        'Picker unavailable',
        error instanceof Error ? error.message : 'This control is only available on iOS and Android 14+.',
      );
    }
  };

  if (!permission) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView style={[styles.centered, styles.permissionScreen, { paddingTop: insets.top }]}>
        <ThemedText type="subtitle">Media Library</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.permissionCopy}>
          Grant access to browse photos and videos, inspect asset metadata, and save files to the
          gallery.
        </ThemedText>
        <Pressable
          onPress={requestPermission}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
          <ThemedText style={styles.primaryButtonLabel}>Grant media library access</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.four }]}>
        <ThemedView style={[styles.header, { paddingTop: insets.top + Spacing.three }]}>
          <ThemedText type="subtitle">Media Library</ThemedText>
          <ThemedText type="code">expo-media-library</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.intro}>
            Browse albums and assets, read metadata, save a sample image, and manage limited photo
            access.
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Access level: {formatAccess(permission.accessPrivileges)}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="smallBold">Browse</ThemedText>
          <View style={styles.buttonRow}>
            <Pressable onPress={loadAlbums} style={styles.actionButton}>
              <ThemedText type="smallBold">Load albums</ThemedText>
            </Pressable>
            <Pressable onPress={() => loadAssets(false)} style={styles.actionButton}>
              <ThemedText type="smallBold">Load assets</ThemedText>
            </Pressable>
            <Pressable onPress={openLimitedPicker} style={styles.actionButton}>
              <ThemedText type="smallBold">Manage access</ThemedText>
            </Pressable>
          </View>

          <View style={styles.filterRow}>
            {FILTERS.map((item) => {
              const selected = filter === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    setFilter(item.id);
                    setAssets([]);
                    setEndCursor(undefined);
                    setHasNextPage(false);
                  }}
                  style={[styles.filterButton, selected && styles.filterButtonSelected]}>
                  <ThemedText type="small" themeColor={selected ? 'text' : 'textSecondary'}>
                    {item.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          {albums.length > 0 && (
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText type="smallBold">Albums</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.albumRow}>
                <Pressable
                  onPress={() => setSelectedAlbum(null)}
                  style={[styles.albumChip, selectedAlbum === null && styles.albumChipSelected]}>
                  <ThemedText type="small">Recent</ThemedText>
                </Pressable>
                {albums.map((album) => (
                  <Pressable
                    key={album.id}
                    onPress={() => setSelectedAlbum(album)}
                    style={[styles.albumChip, selectedAlbum?.id === album.id && styles.albumChipSelected]}>
                    <ThemedText type="small">{album.title}</ThemedText>
                  </Pressable>
                ))}
              </ScrollView>
            </ThemedView>
          )}
        </ThemedView>

        {assets.length > 0 && (
          <ThemedView style={styles.section}>
            <ThemedText type="smallBold">Assets</ThemedText>
            <View style={styles.grid}>
              {assets.map((asset) => (
                <Pressable key={asset.id} onPress={() => inspectAsset(asset)} style={styles.gridItem}>
                  <Image source={{ uri: asset.uri }} style={styles.thumbnail} contentFit="cover" />
                  {asset.mediaType === MediaLibrary.MediaType.video && (
                    <View style={styles.videoBadge}>
                      <ThemedText style={styles.videoBadgeText}>Video</ThemedText>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
            {hasNextPage && (
              <Pressable
                disabled={isLoading}
                onPress={() => loadAssets(true)}
                style={[styles.actionButton, styles.loadMoreButton]}>
                <ThemedText type="smallBold">{isLoading ? 'Loading…' : 'Load more'}</ThemedText>
              </Pressable>
            )}
          </ThemedView>
        )}

        {selectedAsset && (
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">Selected asset</ThemedText>
            <Image
              source={{ uri: selectedAsset.uri }}
              style={styles.selectedPreview}
              contentFit="cover"
            />
            <ThemedText type="small" selectable>
              {selectedAsset.filename ?? 'Untitled'} · {selectedAsset.mediaType}
            </ThemedText>
            <ThemedText type="small" selectable themeColor="textSecondary">
              {selectedAsset.width}×{selectedAsset.height}
              {selectedAsset.duration ? ` · ${Math.round(selectedAsset.duration)}s` : ''}
            </ThemedText>
          </ThemedView>
        )}

        <ThemedView style={styles.section}>
          <ThemedText type="smallBold">Save</ThemedText>
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="small" themeColor="textSecondary">
              Save a bundled app image into the device gallery with{' '}
              <ThemedText type="code">saveToLibraryAsync()</ThemedText>.
            </ThemedText>
            <Pressable onPress={saveSampleImage} style={styles.primaryButton}>
              <ThemedText style={styles.primaryButtonLabel}>Save sample image</ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>

        {statusMessage && (
          <ThemedView type="backgroundElement" style={styles.statusCard}>
            <ThemedText type="small" selectable>
              {statusMessage}
            </ThemedText>
          </ThemedView>
        )}

        <ThemedView style={styles.section}>
          <LessonNotes lessonId="media-library" />
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    gap: Spacing.three,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  permissionScreen: {
    alignItems: 'stretch',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  permissionCopy: {
    lineHeight: 22,
  },
  header: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  intro: {
    lineHeight: 22,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  section: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  card: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.three,
  },
  statusCard: {
    marginHorizontal: Spacing.four,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  actionButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    backgroundColor: 'rgba(32,138,239,0.15)',
  },
  loadMoreButton: {
    alignSelf: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  filterButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    backgroundColor: 'rgba(120,120,128,0.12)',
  },
  filterButtonSelected: {
    backgroundColor: 'rgba(32,138,239,0.18)',
  },
  albumRow: {
    gap: Spacing.two,
  },
  albumChip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
    backgroundColor: 'rgba(120,120,128,0.12)',
  },
  albumChipSelected: {
    backgroundColor: 'rgba(32,138,239,0.18)',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  gridItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: Spacing.two,
    overflow: 'hidden',
    backgroundColor: 'rgba(120,120,128,0.12)',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  videoBadge: {
    position: 'absolute',
    bottom: Spacing.one,
    right: Spacing.one,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: Spacing.one,
    paddingHorizontal: Spacing.one,
    paddingVertical: 2,
  },
  videoBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  selectedPreview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Spacing.three,
  },
  primaryButton: {
    backgroundColor: '#208AEF',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  primaryButtonLabel: {
    color: '#ffffff',
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.85,
  },
});
