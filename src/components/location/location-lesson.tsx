import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useIsFocused } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

type AccuracyOption = {
  id: 'balanced' | 'high' | 'low';
  label: string;
  accuracy: Location.Accuracy;
};

const ACCURACY_OPTIONS: AccuracyOption[] = [
  { id: 'balanced', label: 'Balanced', accuracy: Location.Accuracy.Balanced },
  { id: 'high', label: 'High', accuracy: Location.Accuracy.High },
  { id: 'low', label: 'Low', accuracy: Location.Accuracy.Low },
];

function formatCoords(latitude: number, longitude: number) {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

function formatAddress(address: Location.LocationGeocodedAddress) {
  return [address.name, address.street, address.city, address.region, address.country]
    .filter(Boolean)
    .join(', ');
}

export function LocationLesson() {
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const watchSubscription = useRef<Location.LocationSubscription | null>(null);

  const [permission, requestPermission] = Location.useForegroundPermissions();
  const [accuracy, setAccuracy] = useState<AccuracyOption['id']>('balanced');
  const [servicesEnabled, setServicesEnabled] = useState<boolean | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [lastKnownLocation, setLastKnownLocation] = useState<Location.LocationObject | null>(null);
  const [watchLocation, setWatchLocation] = useState<Location.LocationObject | null>(null);
  const [heading, setHeading] = useState<Location.LocationHeadingObject | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const selectedAccuracy =
    ACCURACY_OPTIONS.find((option) => option.id === accuracy)?.accuracy ??
    Location.Accuracy.Balanced;

  useEffect(() => {
    Location.hasServicesEnabledAsync().then(setServicesEnabled);
  }, []);

  useEffect(() => {
    return () => {
      watchSubscription.current?.remove();
      watchSubscription.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isFocused && isWatching) {
      stopWatching();
    }
  }, [isFocused, isWatching]);

  const ensurePermission = async () => {
    if (permission?.granted) {
      return true;
    }

    const result = await requestPermission();
    return result.granted;
  };

  const refreshServicesStatus = async () => {
    const enabled = await Location.hasServicesEnabledAsync();
    setServicesEnabled(enabled);
    setStatusMessage(enabled ? 'Location services are enabled.' : 'Location services are turned off.');
  };

  const fetchCurrentLocation = async () => {
    const granted = await ensurePermission();
    if (!granted) {
      Alert.alert('Permission required', 'Foreground location access is needed.');
      return;
    }

    setIsLoading(true);
    try {
      await Haptics.selectionAsync();
      const location = await Location.getCurrentPositionAsync({
        accuracy: selectedAccuracy,
      });
      setCurrentLocation(location);
      setStatusMessage(`Current fix: ${formatCoords(location.coords.latitude, location.coords.longitude)}`);
      await reverseGeocode(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      Alert.alert('Location failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLastKnownLocation = async () => {
    const granted = await ensurePermission();
    if (!granted) {
      Alert.alert('Permission required', 'Foreground location access is needed.');
      return;
    }

    setIsLoading(true);
    try {
      const location = await Location.getLastKnownPositionAsync({
        maxAge: 60_000,
        requiredAccuracy: selectedAccuracy,
      });
      setLastKnownLocation(location);
      setStatusMessage(
        location
          ? `Last known: ${formatCoords(location.coords.latitude, location.coords.longitude)}`
          : 'No recent cached location available.',
      );
    } catch (error) {
      Alert.alert('Last known failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      setAddress(results[0] ? formatAddress(results[0]) : 'No address found for these coordinates.');
    } catch {
      setAddress('Reverse geocoding unavailable for this location.');
    }
  };

  const fetchHeading = async () => {
    const granted = await ensurePermission();
    if (!granted) {
      Alert.alert('Permission required', 'Foreground location access is needed.');
      return;
    }

    try {
      const result = await Location.getHeadingAsync();
      setHeading(result);
      setStatusMessage(`Heading: ${Math.round(result.trueHeading ?? result.magHeading)}°`);
    } catch (error) {
      Alert.alert('Heading failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const startWatching = async () => {
    const granted = await ensurePermission();
    if (!granted) {
      Alert.alert('Permission required', 'Foreground location access is needed.');
      return;
    }

    if (watchSubscription.current) {
      return;
    }

    try {
      watchSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: selectedAccuracy,
          timeInterval: 2000,
          distanceInterval: 5,
        },
        (location) => {
          setWatchLocation(location);
          setStatusMessage(`Live update: ${formatCoords(location.coords.latitude, location.coords.longitude)}`);
        },
      );
      setIsWatching(true);
      setStatusMessage('Watching location updates…');
    } catch (error) {
      Alert.alert('Watch failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const stopWatching = () => {
    watchSubscription.current?.remove();
    watchSubscription.current = null;
    setIsWatching(false);
    setStatusMessage('Stopped watching location updates.');
  };

  const geocodeAddress = async () => {
    const granted = await ensurePermission();
    if (!granted) {
      Alert.alert('Permission required', 'Foreground location access is needed.');
      return;
    }

    try {
      const results = await Location.geocodeAsync('1600 Amphitheatre Parkway, Mountain View');
      if (results[0]) {
        setStatusMessage(
          `Geocoded address → ${formatCoords(results[0].latitude, results[0].longitude)}`,
        );
      } else {
        setStatusMessage('No geocode results returned.');
      }
    } catch (error) {
      Alert.alert('Geocode failed', error instanceof Error ? error.message : 'Unknown error');
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
        <ThemedText type="subtitle">Location</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.permissionCopy}>
          Grant foreground location access to read GPS coordinates, watch live updates, reverse
          geocode addresses, and read compass heading.
        </ThemedText>
        <Pressable
          onPress={requestPermission}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
          <ThemedText style={styles.primaryButtonLabel}>Grant location access</ThemedText>
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
          <ThemedText type="subtitle">Location</ThemedText>
          <ThemedText type="code">expo-location</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.intro}>
            Read the current position, cached location, live updates, heading, and geocoded addresses.
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Services: {servicesEnabled === null ? 'Checking…' : servicesEnabled ? 'On' : 'Off'}
          </ThemedText>
        </ThemedView>

        {servicesEnabled === false && (
          <ThemedView type="backgroundElement" style={styles.banner}>
            <ThemedText type="small" themeColor="textSecondary">
              Turn on location services in device settings. On emulators, set a mock location first.
            </ThemedText>
            <Pressable onPress={refreshServicesStatus} style={styles.inlineButton}>
              <ThemedText type="linkPrimary">Refresh status</ThemedText>
            </Pressable>
          </ThemedView>
        )}

        <ThemedView style={styles.section}>
          <ThemedText type="smallBold">Accuracy</ThemedText>
          <View style={styles.optionRow}>
            {ACCURACY_OPTIONS.map((option) => {
              const selected = accuracy === option.id;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => setAccuracy(option.id)}
                  style={[styles.optionButton, selected && styles.optionButtonSelected]}>
                  <ThemedText type="small" themeColor={selected ? 'text' : 'textSecondary'}>
                    {option.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="smallBold">One-time reads</ThemedText>
          <View style={styles.buttonRow}>
            <Pressable
              disabled={isLoading}
              onPress={fetchCurrentLocation}
              style={styles.actionButton}>
              <ThemedText type="smallBold">Current</ThemedText>
            </Pressable>
            <Pressable
              disabled={isLoading}
              onPress={fetchLastKnownLocation}
              style={styles.actionButton}>
              <ThemedText type="smallBold">Last known</ThemedText>
            </Pressable>
            <Pressable onPress={fetchHeading} style={styles.actionButton}>
              <ThemedText type="smallBold">Heading</ThemedText>
            </Pressable>
          </View>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="smallBold">Live updates</ThemedText>
          <ThemedView type="backgroundElement" style={styles.card}>
            <Pressable
              onPress={isWatching ? stopWatching : startWatching}
              style={[styles.primaryButton, isWatching && styles.stopButton]}>
              <ThemedText style={styles.primaryButtonLabel}>
                {isWatching ? 'Stop watching' : 'Start watching'}
              </ThemedText>
            </Pressable>
            {watchLocation && (
              <ThemedText type="small" selectable>
                {formatCoords(watchLocation.coords.latitude, watchLocation.coords.longitude)} · ±
                {Math.round(watchLocation.coords.accuracy ?? 0)}m
              </ThemedText>
            )}
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="smallBold">Geocoding</ThemedText>
          <ThemedView type="backgroundElement" style={styles.card}>
            <Pressable onPress={geocodeAddress} style={styles.actionButton}>
              <ThemedText type="smallBold">Geocode sample address</ThemedText>
            </Pressable>
            {currentLocation && (
              <ThemedText type="small" selectable themeColor="textSecondary">
                Reverse geocode runs automatically after fetching the current location.
              </ThemedText>
            )}
          </ThemedView>
        </ThemedView>

        {(currentLocation || lastKnownLocation || heading || address) && (
          <ThemedView type="backgroundElement" style={styles.resultsCard}>
            {currentLocation && (
              <>
                <ThemedText type="smallBold">Current position</ThemedText>
                <ThemedText type="small" selectable>
                  {formatCoords(currentLocation.coords.latitude, currentLocation.coords.longitude)}
                </ThemedText>
                <ThemedText type="small" selectable themeColor="textSecondary">
                  Accuracy ±{Math.round(currentLocation.coords.accuracy ?? 0)}m · Alt{' '}
                  {Math.round(currentLocation.coords.altitude ?? 0)}m · Speed{' '}
                  {Math.round(currentLocation.coords.speed ?? 0)} m/s
                </ThemedText>
              </>
            )}
            {lastKnownLocation && (
              <>
                <ThemedText type="smallBold">Last known</ThemedText>
                <ThemedText type="small" selectable>
                  {formatCoords(
                    lastKnownLocation.coords.latitude,
                    lastKnownLocation.coords.longitude,
                  )}
                </ThemedText>
              </>
            )}
            {heading && (
              <>
                <ThemedText type="smallBold">Heading</ThemedText>
                <ThemedText type="small" selectable>
                  True {Math.round(heading.trueHeading ?? 0)}° · Magnetic{' '}
                  {Math.round(heading.magHeading)}°
                </ThemedText>
              </>
            )}
            {address && (
              <>
                <ThemedText type="smallBold">Address</ThemedText>
                <ThemedText type="small" selectable themeColor="textSecondary">
                  {address}
                </ThemedText>
              </>
            )}
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
          <LessonNotes lessonId="location" />
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
  banner: {
    marginHorizontal: Spacing.four,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  resultsCard: {
    marginHorizontal: Spacing.four,
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  inlineButton: {
    alignSelf: 'flex-start',
  },
  optionRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  optionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    backgroundColor: 'rgba(120,120,128,0.12)',
  },
  optionButtonSelected: {
    backgroundColor: 'rgba(32,138,239,0.18)',
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
  primaryButton: {
    backgroundColor: '#208AEF',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: '#ff3b30',
  },
  primaryButtonLabel: {
    color: '#ffffff',
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.85,
  },
});
