import * as Battery from 'expo-battery';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Collapsible } from '@/components/ui/collapsible';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

function batteryStateLabel(state: Battery.BatteryState) {
  switch (state) {
    case Battery.BatteryState.CHARGING:
      return 'Charging';
    case Battery.BatteryState.FULL:
      return 'Full';
    case Battery.BatteryState.UNPLUGGED:
      return 'Unplugged';
    default:
      return 'Unknown';
  }
}

function formatPercent(level: number) {
  if (level < 0) {
    return 'Unavailable';
  }
  return `${Math.round(level * 100)}%`;
}

export function BatteryLesson() {
  const insets = useSafeAreaInsets();
  const level = Battery.useBatteryLevel();
  const state = Battery.useBatteryState();
  const lowPowerMode = Battery.useLowPowerMode();
  const powerState = Battery.usePowerState();

  const [available, setAvailable] = useState<boolean | null>(null);
  const [optimizationEnabled, setOptimizationEnabled] = useState<boolean | null>(null);
  const [events, setEvents] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    Battery.isAvailableAsync().then(setAvailable);

    const levelSub = Battery.addBatteryLevelListener(({ batteryLevel }) => {
      setEvents((current) =>
        [`Level changed: ${formatPercent(batteryLevel)}`, ...current].slice(0, 4),
      );
    });
    const stateSub = Battery.addBatteryStateListener(({ batteryState }) => {
      setEvents((current) =>
        [`State changed: ${batteryStateLabel(batteryState)}`, ...current].slice(0, 4),
      );
    });
    const powerSub = Battery.addLowPowerModeListener(({ lowPowerMode: enabled }) => {
      setEvents((current) =>
        [`Low power mode: ${enabled ? 'On' : 'Off'}`, ...current].slice(0, 4),
      );
    });

    return () => {
      levelSub.remove();
      stateSub.remove();
      powerSub.remove();
    };
  }, []);

  const refreshPowerState = async () => {
    const result = await Battery.getPowerStateAsync();
    setStatusMessage(
      `Power state: ${formatPercent(result.batteryLevel)} · ${batteryStateLabel(result.batteryState)} · low power ${result.lowPowerMode ? 'on' : 'off'}`,
    );
  };

  const refreshOptimization = async () => {
    if (Platform.OS !== 'android') {
      setStatusMessage('Battery optimization check is Android-only.');
      return;
    }

    const enabled = await Battery.isBatteryOptimizationEnabledAsync();
    setOptimizationEnabled(enabled);
    setStatusMessage(
      enabled ? 'Battery optimization is enabled for this app.' : 'Battery optimization is disabled.',
    );
  };

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.four }]}>
        <ThemedView style={[styles.header, { paddingTop: insets.top + Spacing.three }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ThemedText type="linkPrimary">Back</ThemedText>
          </Pressable>
          <ThemedText type="subtitle">Battery</ThemedText>
          <ThemedText type="code">expo-battery</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.intro}>
            Read battery level, charging state, low power mode, and subscribe to power changes.
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            API available: {available === null ? 'Checking…' : available ? 'Yes' : 'No (simulator/web)'}
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">Live hooks</ThemedText>
          <ThemedText type="small">Level: {formatPercent(level)}</ThemedText>
          <ThemedText type="small">State: {batteryStateLabel(state)}</ThemedText>
          <ThemedText type="small">Low power mode: {lowPowerMode ? 'On' : 'Off'}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            usePowerState(): {formatPercent(powerState.batteryLevel)} ·{' '}
            {batteryStateLabel(powerState.batteryState)}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <View style={styles.buttonRow}>
            <Pressable onPress={refreshPowerState} style={styles.actionButton}>
              <ThemedText type="smallBold">Refresh power state</ThemedText>
            </Pressable>
            <Pressable onPress={refreshOptimization} style={styles.actionButton}>
              <ThemedText type="smallBold">Optimization</ThemedText>
            </Pressable>
          </View>
        </ThemedView>

        {optimizationEnabled !== null && Platform.OS === 'android' && (
          <ThemedView type="backgroundElement" style={styles.banner}>
            <ThemedText type="small" selectable>
              Battery optimization: {optimizationEnabled ? 'Enabled' : 'Disabled'}
            </ThemedText>
          </ThemedView>
        )}

        {events.length > 0 && (
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">Recent events</ThemedText>
            {events.map((event) => (
              <ThemedText key={event} type="small" selectable themeColor="textSecondary">
                {event}
              </ThemedText>
            ))}
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
          <ThemedText type="smallBold">What this lesson covers</ThemedText>
          <Collapsible title="Hooks — useBatteryLevel() / useBatteryState()">
            <ThemedText type="small">
              Subscribe to live battery level and charging state in React components.
            </ThemedText>
          </Collapsible>
          <Collapsible title="Low power — useLowPowerMode()">
            <ThemedText type="small">
              Detect iOS Low Power Mode or Android Power Saver from a boolean hook.
            </ThemedText>
          </Collapsible>
          <Collapsible title="Combined state — getPowerStateAsync()">
            <ThemedText type="small">
              Fetch level, charging state, and low power mode in one async call.
            </ThemedText>
          </Collapsible>
          <Collapsible title="Listeners — addBatteryLevelListener()">
            <ThemedText type="small">
              React to battery level, charging state, and low power mode changes over time.
            </ThemedText>
          </Collapsible>
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
  card: { marginHorizontal: Spacing.four, padding: Spacing.four, borderRadius: Spacing.three, gap: Spacing.two },
  banner: { marginHorizontal: Spacing.four, padding: Spacing.three, borderRadius: Spacing.three },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  actionButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    backgroundColor: 'rgba(32,138,239,0.15)',
  },
});
