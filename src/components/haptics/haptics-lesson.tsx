import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LessonNotes } from '@/components/lesson-notes/lesson-notes';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

const IMPACTS: { label: string; style: Haptics.ImpactFeedbackStyle }[] = [
  { label: 'Light', style: Haptics.ImpactFeedbackStyle.Light },
  { label: 'Medium', style: Haptics.ImpactFeedbackStyle.Medium },
  { label: 'Heavy', style: Haptics.ImpactFeedbackStyle.Heavy },
  { label: 'Rigid', style: Haptics.ImpactFeedbackStyle.Rigid },
  { label: 'Soft', style: Haptics.ImpactFeedbackStyle.Soft },
];

const NOTIFICATIONS: { label: string; type: Haptics.NotificationFeedbackType }[] = [
  { label: 'Success', type: Haptics.NotificationFeedbackType.Success },
  { label: 'Warning', type: Haptics.NotificationFeedbackType.Warning },
  { label: 'Error', type: Haptics.NotificationFeedbackType.Error },
];

export function HapticsLesson() {
  const insets = useSafeAreaInsets();
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);

  const trigger = async (label: string, action: () => Promise<void>) => {
    await action();
    setLastFeedback(label);
  };

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.four }]}>
        <ThemedView style={[styles.header, { paddingTop: insets.top + Spacing.three }]}>
          <ThemedText type="subtitle">Haptics</ThemedText>
          <ThemedText type="code">expo-haptics</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.intro}>
            Trigger selection, notification, and impact feedback. On Android you can also use native
            haptic constants.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="smallBold">Selection</ThemedText>
          <Pressable
            onPress={() => trigger('selectionAsync()', () => Haptics.selectionAsync())}
            style={styles.primaryButton}>
            <ThemedText style={styles.primaryButtonLabel}>selectionAsync()</ThemedText>
          </Pressable>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="smallBold">Notification feedback</ThemedText>
          <View style={styles.buttonRow}>
            {NOTIFICATIONS.map((item) => (
              <Pressable
                key={item.label}
                onPress={() =>
                  trigger(`notificationAsync(${item.label})`, () =>
                    Haptics.notificationAsync(item.type),
                  )
                }
                style={styles.actionButton}>
                <ThemedText type="smallBold">{item.label}</ThemedText>
              </Pressable>
            ))}
          </View>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="smallBold">Impact feedback</ThemedText>
          <View style={styles.buttonRow}>
            {IMPACTS.map((item) => (
              <Pressable
                key={item.label}
                onPress={() =>
                  trigger(`impactAsync(${item.label})`, () => Haptics.impactAsync(item.style))
                }
                style={styles.actionButton}>
                <ThemedText type="smallBold">{item.label}</ThemedText>
              </Pressable>
            ))}
          </View>
        </ThemedView>

        {Platform.OS === 'android' && (
          <ThemedView style={styles.section}>
            <ThemedText type="smallBold">Android haptics engine</ThemedText>
            <View style={styles.buttonRow}>
              <Pressable
                onPress={() =>
                  trigger('performAndroidHapticsAsync(Confirm)', () =>
                    Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Confirm),
                  )
                }
                style={styles.actionButton}>
                <ThemedText type="smallBold">Confirm</ThemedText>
              </Pressable>
              <Pressable
                onPress={() =>
                  trigger('performAndroidHapticsAsync(Reject)', () =>
                    Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Reject),
                  )
                }
                style={styles.actionButton}>
                <ThemedText type="smallBold">Reject</ThemedText>
              </Pressable>
              <Pressable
                onPress={() =>
                  trigger('performAndroidHapticsAsync(Toggle_On)', () =>
                    Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Toggle_On),
                  )
                }
                style={styles.actionButton}>
                <ThemedText type="smallBold">Toggle on</ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        )}

        {lastFeedback && (
          <ThemedView type="backgroundElement" style={styles.banner}>
            <ThemedText type="small" selectable>
              Last triggered: {lastFeedback}
            </ThemedText>
          </ThemedView>
        )}

        <ThemedView style={styles.section}>
          <LessonNotes lessonId="haptics" />
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
  banner: { marginHorizontal: Spacing.four, padding: Spacing.three, borderRadius: Spacing.three },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  actionButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    backgroundColor: 'rgba(32,138,239,0.15)',
  },
  primaryButton: {
    backgroundColor: '#208AEF',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  primaryButtonLabel: { color: '#ffffff', fontWeight: '700' },
});
