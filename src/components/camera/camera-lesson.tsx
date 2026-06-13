import {
  CameraView,
  type BarcodeScanningResult,
  type CameraMode,
  type CameraType,
  type FlashMode,
  useCameraPermissions,
  useMicrophonePermissions,
} from 'expo-camera';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import * as MediaLibrary from 'expo-media-library';
import { useIsFocused } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
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

type LessonMode = CameraMode | 'scan';

const FLASH_MODES: FlashMode[] = ['off', 'on', 'auto'];
const MODES: { id: LessonMode; label: string }[] = [
  { id: 'picture', label: 'Photo' },
  { id: 'video', label: 'Video' },
  { id: 'scan', label: 'Scan' },
];

function formatFlash(mode: FlashMode) {
  return mode.charAt(0).toUpperCase() + mode.slice(1);
}

export function CameraLesson() {
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [torch, setTorch] = useState(false);
  const [zoom, setZoom] = useState(0);
  const [mode, setMode] = useState<LessonMode>('picture');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<BarcodeScanningResult | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSavingToGallery, setIsSavingToGallery] = useState(false);

  const cameraMode: CameraMode = mode === 'scan' ? 'picture' : mode;
  const isScanMode = mode === 'scan';

  const handleBarcodeScanned = useCallback((result: BarcodeScanningResult) => {
    setScanResult((current) => {
      if (current?.data === result.data) {
        return current;
      }
      setStatusMessage(`Scanned ${result.type}: ${result.data}`);
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      return result;
    });
  }, []);

  const cycleFlash = () => {
    setFlash((current) => FLASH_MODES[(FLASH_MODES.indexOf(current) + 1) % FLASH_MODES.length]);
  };

  const toggleFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
    setTorch(false);
  };

  const adjustZoom = (delta: number) => {
    setZoom((current) => Math.min(1, Math.max(0, Number((current + delta).toFixed(2)))));
  };

  const takePhoto = async () => {
    if (!cameraRef.current || !isCameraReady) {
      Alert.alert('Camera not ready', 'Wait for the preview before taking a photo.');
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (photo?.uri) {
        setPhotoUri(photo.uri);
        setVideoUri(null);
        setStatusMessage('Photo saved to app cache.');
      }
    } catch (error) {
      Alert.alert('Photo failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const ensureMicrophonePermission = async () => {
    if (micPermission?.granted) {
      return true;
    }

    const result = await requestMicPermission();
    return result.granted;
  };

  const toggleRecording = async () => {
    if (!cameraRef.current || !isCameraReady) {
      Alert.alert('Camera not ready', 'Wait for the preview before recording.');
      return;
    }

    if (isRecording) {
      cameraRef.current.stopRecording();
      return;
    }

    const micGranted = await ensureMicrophonePermission();
    if (!micGranted) {
      Alert.alert(
        'Microphone required',
        'Video recording with audio needs microphone permission. Grant it in system settings or tap Record again to retry.',
      );
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setIsRecording(true);
      setStatusMessage('Recording…');
      const video = await cameraRef.current.recordAsync({ maxDuration: 15 });
      setVideoUri(video?.uri ?? null);
      setPhotoUri(null);
      setStatusMessage(video?.uri ? 'Video saved to app cache.' : 'Recording stopped.');
    } catch (error) {
      Alert.alert('Recording failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsRecording(false);
    }
  };

  const handleCapture = () => {
    if (mode === 'picture') {
      takePhoto();
      return;
    }
    if (mode === 'video') {
      toggleRecording();
    }
  };

  const saveCaptureToGallery = async () => {
    const uri = photoUri ?? videoUri;
    if (!uri) {
      return;
    }

    setIsSavingToGallery(true);

    try {
      const { granted } = await MediaLibrary.requestPermissionsAsync(true);
      if (!granted) {
        Alert.alert(
          'Permission required',
          'Allow photo library access to save captures to your gallery.',
        );
        return;
      }

      await MediaLibrary.saveToLibraryAsync(uri);
      setStatusMessage(photoUri ? 'Photo saved to your gallery.' : 'Video saved to your gallery.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('Save failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSavingToGallery(false);
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
        <ThemedText type="subtitle" style={styles.permissionTitle}>
          Camera access
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.permissionCopy}>
          Expo Camera needs permission before showing a live preview, taking photos, recording
          video, or scanning QR codes.
        </ThemedText>
        <Pressable
          onPress={requestPermission}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
          <ThemedText style={styles.primaryButtonLabel}>Grant camera permission</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.four }]}>
        <View style={[styles.previewShell, { marginTop: insets.top }]}>
          {isFocused && (
            <CameraView
              ref={cameraRef}
              style={styles.preview}
              facing={facing}
              flash={flash}
              enableTorch={torch}
              zoom={zoom}
              mode={cameraMode}
              mirror={facing === 'front'}
              barcodeScannerSettings={
                isScanMode ? { barcodeTypes: ['qr', 'ean13', 'code128'] } : undefined
              }
              onBarcodeScanned={isScanMode ? handleBarcodeScanned : undefined}
              onCameraReady={() => setIsCameraReady(true)}
              onMountError={({ message }) => setStatusMessage(message)}
            />
          )}

          <View style={styles.previewOverlay}>
            <View style={styles.overlayRow}>
              <Pressable onPress={cycleFlash} style={styles.overlayChip}>
                <ThemedText style={styles.overlayChipText}>Flash: {formatFlash(flash)}</ThemedText>
              </Pressable>
              <Pressable
                onPress={() => setTorch((current) => !current)}
                style={[styles.overlayChip, torch && styles.overlayChipActive]}>
                <ThemedText style={styles.overlayChipText}>Torch {torch ? 'On' : 'Off'}</ThemedText>
              </Pressable>
            </View>
          </View>

          {isScanMode && (
            <View style={styles.scanFrame}>
              <ThemedText style={styles.scanHint}>Point at a QR or barcode</ThemedText>
            </View>
          )}
        </View>

        <ThemedView style={styles.section}>
          <ThemedText type="smallBold">Mode</ThemedText>
          <View style={styles.modeRow}>
            {MODES.map((item) => {
              const selected = mode === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    setMode(item.id);
                    setScanResult(null);
                    setStatusMessage(null);
                    if (item.id === 'video') {
                      requestMicPermission();
                    }
                  }}
                  style={[styles.modeButton, selected && styles.modeButtonSelected]}>
                  <ThemedText type="small" themeColor={selected ? 'text' : 'textSecondary'}>
                    {item.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="smallBold">Controls</ThemedText>
          <View style={styles.controlsRow}>
            <Pressable onPress={toggleFacing} style={styles.controlButton}>
              <ThemedText type="small">Flip</ThemedText>
            </Pressable>

            <Pressable
              onPress={handleCapture}
              style={[
                styles.captureButton,
                mode === 'video' && isRecording && styles.captureButtonRecording,
              ]}>
              <ThemedText style={styles.captureLabel}>
                {mode === 'picture' ? 'Photo' : mode === 'video' ? (isRecording ? 'Stop' : 'Record') : 'Scanning'}
              </ThemedText>
            </Pressable>

            <View style={styles.zoomControls}>
              <Pressable onPress={() => adjustZoom(-0.1)} style={styles.controlButton}>
                <ThemedText type="small">−</ThemedText>
              </Pressable>
              <ThemedText type="code">Zoom {(zoom * 100).toFixed(0)}%</ThemedText>
              <Pressable onPress={() => adjustZoom(0.1)} style={styles.controlButton}>
                <ThemedText type="small">+</ThemedText>
              </Pressable>
            </View>
          </View>
        </ThemedView>

        {mode === 'video' && micPermission && !micPermission.granted && (
          <ThemedView type="backgroundElement" style={styles.statusCard}>
            <ThemedText type="small" themeColor="textSecondary">
              Microphone permission is required for video with audio. Tap Record to request access.
            </ThemedText>
          </ThemedView>
        )}

        {(statusMessage || scanResult) && (
          <ThemedView type="backgroundElement" style={styles.statusCard}>
            {statusMessage && (
              <ThemedText type="small" selectable>
                {statusMessage}
              </ThemedText>
            )}
            {scanResult && (
              <ThemedText type="small" selectable themeColor="textSecondary">
                {scanResult.type}: {scanResult.data}
              </ThemedText>
            )}
          </ThemedView>
        )}

        {(photoUri || videoUri) && (
          <ThemedView style={styles.section}>
            <ThemedText type="smallBold">Last capture</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Captures are stored in app cache first. Save to gallery to keep them in Photos.
            </ThemedText>
            {photoUri && <Image source={{ uri: photoUri }} style={styles.capturePreview} contentFit="cover" />}
            {videoUri && (
              <ThemedText type="small" selectable themeColor="textSecondary">
                Video URI: {videoUri}
              </ThemedText>
            )}
            <Pressable
              disabled={isSavingToGallery}
              onPress={saveCaptureToGallery}
              style={({ pressed }) => [
                styles.galleryButton,
                pressed && styles.buttonPressed,
                isSavingToGallery && styles.galleryButtonDisabled,
              ]}>
              <ThemedText style={styles.galleryButtonLabel}>
                {isSavingToGallery ? 'Saving…' : 'Save to gallery'}
              </ThemedText>
            </Pressable>
          </ThemedView>
        )}

        <ThemedView style={styles.section}>
          <LessonNotes lessonId="camera" />
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
  permissionTitle: {
    marginTop: Spacing.two,
  },
  permissionCopy: {
    lineHeight: 22,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  primaryButton: {
    backgroundColor: '#208AEF',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  primaryButtonLabel: {
    color: '#ffffff',
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  previewShell: {
    backgroundColor: '#000000',
    minHeight: 360,
  },
  preview: {
    width: '100%',
    aspectRatio: 3 / 4,
  },
  previewOverlay: {
    position: 'absolute',
    top: Spacing.three,
    left: Spacing.three,
    right: Spacing.three,
    gap: Spacing.two,
  },
  overlayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  overlayChip: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: Spacing.five,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  overlayChipActive: {
    backgroundColor: 'rgba(32,138,239,0.85)',
  },
  overlayChipText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  scanFrame: {
    position: 'absolute',
    left: Spacing.five,
    right: Spacing.five,
    top: '30%',
    bottom: '30%',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
    borderRadius: Spacing.three,
    justifyContent: 'flex-end',
    padding: Spacing.two,
  },
  scanHint: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  modeRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  modeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    backgroundColor: 'rgba(120,120,128,0.12)',
  },
  modeButtonSelected: {
    backgroundColor: 'rgba(32,138,239,0.18)',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  controlButton: {
    minWidth: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    backgroundColor: 'rgba(120,120,128,0.12)',
  },
  captureButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#ffffff',
    borderWidth: 4,
    borderColor: '#208AEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonRecording: {
    backgroundColor: '#ff3b30',
    borderColor: '#ff3b30',
  },
  captureLabel: {
    color: '#111111',
    fontWeight: '700',
    fontSize: 12,
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  statusCard: {
    marginHorizontal: Spacing.four,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
  capturePreview: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: Spacing.three,
  },
  galleryButton: {
    backgroundColor: '#208AEF',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  galleryButtonDisabled: {
    opacity: 0.6,
  },
  galleryButtonLabel: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
