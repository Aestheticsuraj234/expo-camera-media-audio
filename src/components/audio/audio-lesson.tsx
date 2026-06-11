import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LessonNotes } from '@/components/lesson-notes/lesson-notes';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

const SAMPLE_AUDIO =
  'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3';

type RecordingPresetId = 'high' | 'low';

const PRESETS: { id: RecordingPresetId; label: string }[] = [
  { id: 'high', label: 'High quality' },
  { id: 'low', label: 'Low quality' },
];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function AudioLesson() {
  const insets = useSafeAreaInsets();
  const [micGranted, setMicGranted] = useState<boolean | null>(null);
  const [preset, setPreset] = useState<RecordingPresetId>('high');
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activeSource, setActiveSource] = useState<'sample' | 'recording'>('sample');

  const player = useAudioPlayer(SAMPLE_AUDIO, { downloadFirst: true });
  const playerStatus = useAudioPlayerStatus(player);

  const recorder = useAudioRecorder(
    preset === 'high' ? RecordingPresets.HIGH_QUALITY : RecordingPresets.LOW_QUALITY,
  );
  const recorderState = useAudioRecorderState(recorder);

  useEffect(() => {
    (async () => {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      setMicGranted(permission.granted);

      if (permission.granted) {
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      }
    })();
  }, []);

  const requestMicPermission = async () => {
    const permission = await AudioModule.requestRecordingPermissionsAsync();
    setMicGranted(permission.granted);

    if (permission.granted) {
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
      return true;
    }

    Alert.alert(
      'Microphone required',
      'Recording needs microphone permission. Enable it in system settings and try again.',
    );
    return false;
  };

  const togglePlayback = async () => {
    await Haptics.selectionAsync();

    if (playerStatus.playing) {
      player.pause();
      return;
    }

    player.play();
  };

  const replaySample = async () => {
    await Haptics.selectionAsync();
    setActiveSource('sample');
    player.replace(SAMPLE_AUDIO);
    await player.seekTo(0);
    player.play();
    setStatusMessage('Playing sample clip.');
  };

  const playRecording = async () => {
    if (!recordingUri) {
      Alert.alert('No recording yet', 'Record audio first, then play it back.');
      return;
    }

    await Haptics.selectionAsync();
    setActiveSource('recording');
    player.replace(recordingUri);
    player.play();
    setStatusMessage('Playing your recording.');
  };

  const startRecording = async () => {
    const granted = micGranted ? true : await requestMicPermission();
    if (!granted) {
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await recorder.prepareToRecordAsync();
      recorder.record();
      setStatusMessage('Recording… speak into the microphone.');
    } catch (error) {
      Alert.alert('Recording failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const stopRecording = async () => {
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (uri) {
        setRecordingUri(uri);
        setStatusMessage('Recording saved. Tap Play recording to hear it.');
        if (Platform.OS === 'ios') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      Alert.alert('Stop failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const toggleRecording = () => {
    if (recorderState.isRecording) {
      stopRecording();
      return;
    }
    startRecording();
  };

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.four }]}>
        <ThemedView style={[styles.header, { paddingTop: insets.top + Spacing.three }]}>
          <ThemedText type="subtitle">Audio</ThemedText>
          <ThemedText type="code">expo-audio</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.intro}>
            Play remote audio, record from the microphone, and replay your clip with the same player
            API.
          </ThemedText>
        </ThemedView>

        {micGranted === false && (
          <ThemedView type="backgroundElement" style={styles.banner}>
            <ThemedText type="small" themeColor="textSecondary">
              Microphone permission is required for recording.
            </ThemedText>
            <Pressable onPress={requestMicPermission} style={styles.inlineButton}>
              <ThemedText type="linkPrimary">Grant microphone access</ThemedText>
            </Pressable>
          </ThemedView>
        )}

        <ThemedView style={styles.section}>
          <ThemedText type="smallBold">Playback</ThemedText>
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="small" themeColor="textSecondary">
              Source: {activeSource === 'sample' ? 'Sample MP3' : 'Your recording'}
            </ThemedText>
            <ThemedText type="small">
              {playerStatus.playing ? 'Playing' : 'Paused'} · {formatTime(playerStatus.currentTime)}{' '}
              / {formatTime(playerStatus.duration)}
            </ThemedText>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width:
                      playerStatus.duration > 0
                        ? `${Math.min(100, (playerStatus.currentTime / playerStatus.duration) * 100)}%`
                        : '0%',
                  },
                ]}
              />
            </View>
            <View style={styles.buttonRow}>
              <Pressable onPress={togglePlayback} style={styles.actionButton}>
                <ThemedText type="smallBold">{playerStatus.playing ? 'Pause' : 'Play'}</ThemedText>
              </Pressable>
              <Pressable onPress={replaySample} style={styles.actionButton}>
                <ThemedText type="smallBold">Sample</ThemedText>
              </Pressable>
              <Pressable
                onPress={playRecording}
                style={[styles.actionButton, !recordingUri && styles.actionButtonDisabled]}>
                <ThemedText type="smallBold">Your clip</ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="smallBold">Recording</ThemedText>
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="small" themeColor="textSecondary">
              Preset
            </ThemedText>
            <View style={styles.presetRow}>
              {PRESETS.map((item) => {
                const selected = preset === item.id;
                return (
                  <Pressable
                    key={item.id}
                    disabled={recorderState.isRecording}
                    onPress={() => setPreset(item.id)}
                    style={[styles.presetButton, selected && styles.presetButtonSelected]}>
                    <ThemedText type="small" themeColor={selected ? 'text' : 'textSecondary'}>
                      {item.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>

            <ThemedText type="small">
              {recorderState.isRecording ? 'Recording…' : 'Ready'} ·{' '}
              {formatTime(recorderState.durationMillis / 1000)}
            </ThemedText>

            <Pressable
              onPress={toggleRecording}
              style={[
                styles.recordButton,
                recorderState.isRecording && styles.recordButtonActive,
              ]}>
              <ThemedText style={styles.recordButtonLabel}>
                {recorderState.isRecording ? 'Stop recording' : 'Start recording'}
              </ThemedText>
            </Pressable>

            {recordingUri && (
              <ThemedText type="small" selectable themeColor="textSecondary">
                URI: {recordingUri}
              </ThemedText>
            )}
          </ThemedView>
        </ThemedView>

        {statusMessage && (
          <ThemedView type="backgroundElement" style={styles.banner}>
            <ThemedText type="small" selectable>
              {statusMessage}
            </ThemedText>
          </ThemedView>
        )}

        <ThemedView style={styles.section}>
          <LessonNotes lessonId="audio" />
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
  banner: {
    marginHorizontal: Spacing.four,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  inlineButton: {
    alignSelf: 'flex-start',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(120,120,128,0.2)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#208AEF',
    borderRadius: 3,
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
  actionButtonDisabled: {
    opacity: 0.45,
  },
  presetRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  presetButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    backgroundColor: 'rgba(120,120,128,0.12)',
  },
  presetButtonSelected: {
    backgroundColor: 'rgba(32,138,239,0.18)',
  },
  recordButton: {
    backgroundColor: '#208AEF',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  recordButtonActive: {
    backgroundColor: '#ff3b30',
  },
  recordButtonLabel: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
