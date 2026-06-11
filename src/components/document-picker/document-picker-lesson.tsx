import { File } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LessonNotes } from '@/components/lesson-notes/lesson-notes';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

type PickMode = 'any' | 'image' | 'pdf';

const MODES: { id: PickMode; label: string; type: string | string[] }[] = [
  { id: 'any', label: 'Any file', type: '*/*' },
  { id: 'image', label: 'Images', type: 'image/*' },
  { id: 'pdf', label: 'PDF', type: 'application/pdf' },
];

function formatBytes(size?: number) {
  if (!size && size !== 0) {
    return 'Unknown size';
  }
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentPickerLesson() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<PickMode>('any');
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [pickedFiles, setPickedFiles] = useState<DocumentPicker.DocumentPickerAsset[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const pickDocuments = async () => {
    const selectedMode = MODES.find((item) => item.id === mode) ?? MODES[0];

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: selectedMode.type,
        multiple: allowMultiple,
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setStatusMessage('Document picker canceled.');
        return;
      }

      setPickedFiles(result.assets);
      setPreview(null);
      setStatusMessage(`Picked ${result.assets.length} file(s).`);

      const first = result.assets[0];
      if (first?.uri) {
        await readPreview(first);
      }
    } catch (error) {
      Alert.alert('Pick failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const readPreview = async (asset: DocumentPicker.DocumentPickerAsset) => {
    try {
      const file = new File(asset.uri);
      const info = file.info();
      const isText =
        asset.mimeType?.startsWith('text/') ||
        asset.name.endsWith('.txt') ||
        asset.name.endsWith('.json') ||
        asset.name.endsWith('.md');

      if (isText && info.exists) {
        const text = await file.text();
        setPreview(text.slice(0, 240));
        return;
      }

      setPreview(
        `Readable via expo-file-system\nName: ${asset.name}\nSize: ${formatBytes(asset.size)}\nExists: ${info.exists ? 'yes' : 'no'}`,
      );
    } catch {
      setPreview(`Saved at ${asset.uri}`);
    }
  };

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.four }]}>
        <ThemedView style={[styles.header, { paddingTop: insets.top + Spacing.three }]}>
          <ThemedText type="subtitle">Document Picker</ThemedText>
          <ThemedText type="code">expo-document-picker</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.intro}>
            Open the system file picker, filter by MIME type, copy files to cache, and read them with
            expo-file-system.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="smallBold">File type</ThemedText>
          <View style={styles.optionRow}>
            {MODES.map((item) => {
              const selected = mode === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setMode(item.id)}
                  style={[styles.optionButton, selected && styles.optionButtonSelected]}>
                  <ThemedText type="small" themeColor={selected ? 'text' : 'textSecondary'}>
                    {item.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </ThemedView>

        <ThemedView style={styles.section}>
          <Pressable
            onPress={() => setAllowMultiple((current) => !current)}
            style={[styles.toggleButton, allowMultiple && styles.toggleButtonSelected]}>
            <ThemedText type="smallBold">
              Multiple selection: {allowMultiple ? 'On' : 'Off'}
            </ThemedText>
          </Pressable>
          <Pressable onPress={pickDocuments} style={styles.primaryButton}>
            <ThemedText style={styles.primaryButtonLabel}>Pick document(s)</ThemedText>
          </Pressable>
        </ThemedView>

        {pickedFiles.length > 0 && (
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">Picked files</ThemedText>
            {pickedFiles.map((asset) => (
              <Pressable key={asset.uri} onPress={() => readPreview(asset)} style={styles.fileRow}>
                <ThemedText type="smallBold">{asset.name}</ThemedText>
                <ThemedText type="small" selectable themeColor="textSecondary">
                  {asset.mimeType ?? 'unknown type'} · {formatBytes(asset.size)}
                </ThemedText>
                <ThemedText type="code" selectable>
                  {asset.uri}
                </ThemedText>
              </Pressable>
            ))}
          </ThemedView>
        )}

        {preview && (
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">Preview</ThemedText>
            <ThemedText type="small" selectable themeColor="textSecondary">
              {preview}
            </ThemedText>
          </ThemedView>
        )}

        {statusMessage && (
          <ThemedView type="backgroundElement" style={styles.banner}>
            <ThemedText type="small" selectable>
              {statusMessage}
            </ThemedText>
          </ThemedView>
        )}

        <ThemedView style={styles.section}>
          <LessonNotes lessonId="document-picker" />
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { gap: Spacing.three },
  header: { paddingHorizontal: Spacing.four, gap: Spacing.two },
  intro: { lineHeight: 22 },
  backButton: { alignSelf: 'flex-start' },
  section: { paddingHorizontal: Spacing.four, gap: Spacing.two },
  card: { marginHorizontal: Spacing.four, padding: Spacing.four, borderRadius: Spacing.three, gap: Spacing.three },
  banner: { marginHorizontal: Spacing.four, padding: Spacing.three, borderRadius: Spacing.three },
  optionRow: { flexDirection: 'row', gap: Spacing.two },
  optionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    backgroundColor: 'rgba(120,120,128,0.12)',
  },
  optionButtonSelected: { backgroundColor: 'rgba(32,138,239,0.18)' },
  toggleButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    backgroundColor: 'rgba(120,120,128,0.12)',
    alignSelf: 'flex-start',
  },
  toggleButtonSelected: { backgroundColor: 'rgba(32,138,239,0.18)' },
  primaryButton: {
    backgroundColor: '#208AEF',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  primaryButtonLabel: { color: '#ffffff', fontWeight: '700' },
  fileRow: { gap: Spacing.one },
});
