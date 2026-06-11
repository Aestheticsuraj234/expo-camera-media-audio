import * as Network from 'expo-network';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Collapsible } from '@/components/ui/collapsible';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

function formatBool(value?: boolean) {
  if (value === undefined) {
    return 'Unknown';
  }
  return value ? 'Yes' : 'No';
}

export function NetworkLesson() {
  const insets = useSafeAreaInsets();
  const liveState = Network.useNetworkState();
  const [ipAddress, setIpAddress] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<Network.NetworkState | null>(null);
  const [airplaneMode, setAirplaneMode] = useState<boolean | null>(null);
  const [events, setEvents] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const subscription = Network.addNetworkStateListener((state) => {
      setEvents((current) =>
        [`${state.type ?? 'UNKNOWN'} · connected ${formatBool(state.isConnected)}`, ...current].slice(
          0,
          5,
        ),
      );
    });

    return () => subscription.remove();
  }, []);

  const refreshSnapshot = async () => {
    const state = await Network.getNetworkStateAsync();
    setSnapshot(state);
    setStatusMessage('Fetched a one-time network snapshot.');
  };

  const refreshIp = async () => {
    try {
      const ip = await Network.getIpAddressAsync();
      setIpAddress(ip);
      setStatusMessage(ip === '0.0.0.0' ? 'IP address unavailable.' : `Device IP: ${ip}`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Could not read IP address.');
    }
  };

  const refreshAirplaneMode = async () => {
    if (Platform.OS !== 'android') {
      setStatusMessage('Airplane mode check is Android-only.');
      return;
    }

    const enabled = await Network.isAirplaneModeEnabledAsync();
    setAirplaneMode(enabled);
    setStatusMessage(enabled ? 'Airplane mode is on.' : 'Airplane mode is off.');
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
          <ThemedText type="subtitle">Network</ThemedText>
          <ThemedText type="code">expo-network</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.intro}>
            Monitor connection type, connectivity, IP address, and network change events.
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">Live state — useNetworkState()</ThemedText>
          <ThemedText type="small">Type: {liveState.type ?? 'UNKNOWN'}</ThemedText>
          <ThemedText type="small">Connected: {formatBool(liveState.isConnected)}</ThemedText>
          <ThemedText type="small">
            Internet reachable: {formatBool(liveState.isInternetReachable)}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="smallBold">Actions</ThemedText>
          <View style={styles.buttonRow}>
            <Pressable onPress={refreshSnapshot} style={styles.actionButton}>
              <ThemedText type="smallBold">Snapshot</ThemedText>
            </Pressable>
            <Pressable onPress={refreshIp} style={styles.actionButton}>
              <ThemedText type="smallBold">IP address</ThemedText>
            </Pressable>
            <Pressable onPress={refreshAirplaneMode} style={styles.actionButton}>
              <ThemedText type="smallBold">Airplane</ThemedText>
            </Pressable>
          </View>
        </ThemedView>

        {(snapshot || ipAddress || airplaneMode !== null) && (
          <ThemedView type="backgroundElement" style={styles.card}>
            {snapshot && (
              <ThemedText type="small" selectable>
                Snapshot: {snapshot.type} · connected {formatBool(snapshot.isConnected)} · internet{' '}
                {formatBool(snapshot.isInternetReachable)}
              </ThemedText>
            )}
            {ipAddress && (
              <ThemedText type="small" selectable>
                IP: {ipAddress}
              </ThemedText>
            )}
            {airplaneMode !== null && Platform.OS === 'android' && (
              <ThemedText type="small" selectable>
                Airplane mode: {airplaneMode ? 'On' : 'Off'}
              </ThemedText>
            )}
          </ThemedView>
        )}

        {events.length > 0 && (
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">Recent listener events</ThemedText>
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
          <Collapsible title="Live updates — useNetworkState()">
            <ThemedText type="small">
              React hook that tracks <ThemedText type="code">type</ThemedText>,{' '}
              <ThemedText type="code">isConnected</ThemedText>, and{' '}
              <ThemedText type="code">isInternetReachable</ThemedText>.
            </ThemedText>
          </Collapsible>
          <Collapsible title="One-time read — getNetworkStateAsync()">
            <ThemedText type="small">
              Poll the current network state when you only need a snapshot.
            </ThemedText>
          </Collapsible>
          <Collapsible title="IP address — getIpAddressAsync()">
            <ThemedText type="small">
              Returns the device IPv4 address. On web this uses a public IP lookup service.
            </ThemedText>
          </Collapsible>
          <Collapsible title="Change events — addNetworkStateListener()">
            <ThemedText type="small">
              Subscribe to network changes and remove the subscription on unmount.
            </ThemedText>
          </Collapsible>
          <Collapsible title="Airplane mode — isAirplaneModeEnabledAsync()">
            <ThemedText type="small">Android-only helper for airplane mode status.</ThemedText>
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
