import React from 'react';
import { Platform } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

type LessonNotesProps = {
  lessonId: string;
};

function P({ children }: { children: React.ReactNode }) {
  return (
    <ThemedText type="small" style={{ lineHeight: 22 }}>
      {children}
    </ThemedText>
  );
}

function C({ children }: { children: string }) {
  return <ThemedText type="code">{children}</ThemedText>;
}

function NotesSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Collapsible title={title}>
      <ThemedView style={{ gap: Spacing.two }}>{children}</ThemedView>
    </Collapsible>
  );
}

function CameraNotes() {
  return (
    <>
      <P>
        Expo Camera wraps the device camera in a React Native view. You request permission, render a
        live preview, then capture photos, record video, or scan barcodes from the same component.
      </P>
      <NotesSection title="Overview — when to use expo-camera">
        <P>
          Use <C>expo-camera</C> when you need a live camera preview inside your app: profile photos,
          document scanning, QR check-in, or short video clips. For picking existing photos from the
          gallery, use <C>expo-image-picker</C> or <C>expo-media-library</C> instead.
        </P>
        <P>
          This lesson requires a development build. The camera is a native module and is not fully
          available in Expo Go for all configurations.
        </P>
      </NotesSection>
      <NotesSection title="Permissions — useCameraPermissions()">
        <P>
          Call <C>useCameraPermissions()</C> before rendering <C>CameraView</C>. The hook returns{' '}
          <C>permission</C> (status object) and <C>requestPermission</C> (prompts the system dialog).
        </P>
        <P>
          Video recording also needs microphone access. Use <C>useMicrophonePermissions()</C> and grant
          it before calling <C>recordAsync()</C>. Android requires <C>RECORD_AUDIO</C> in your native
          manifest via the config plugin.
        </P>
      </NotesSection>
      <NotesSection title="Preview — CameraView">
        <P>
          <C>CameraView</C> is the main component. Key props used in this lesson:
        </P>
        <P>
          <C>facing</C> — <C>back</C> or <C>front</C>. Flip with the Flip button.
        </P>
        <P>
          <C>mode</C> — <C>picture</C> or <C>video</C>. Controls whether capture buttons record
          stills or movies.
        </P>
        <P>
          <C>zoom</C> — a number from 0 to 1 (0 = widest, 1 = max optical/digital zoom on device).
        </P>
        <P>
          <C>mirror</C> — flip the front-camera preview horizontally so it feels like a selfie mirror.
        </P>
        <P>
          Only mount one active preview at a time. This lesson uses <C>useIsFocused()</C> to unmount
          the camera when you leave the screen, which releases the hardware for other apps.
        </P>
      </NotesSection>
      <NotesSection title="Photos — takePictureAsync()">
        <P>
          Keep a ref to <C>CameraView</C> and call <C>cameraRef.current?.takePictureAsync()</C> after{' '}
          <C>onCameraReady</C> fires. The returned object includes a local <C>uri</C> in app cache.
        </P>
        <P>
          Wait for the camera to be ready before capturing. Tapping too early can fail silently or throw.
          The lesson disables the shutter until <C>isCameraReady</C> is true.
        </P>
      </NotesSection>
      <NotesSection title="Video — recordAsync() / stopRecording()">
        <P>
          Switch to Video mode, confirm microphone permission, then call <C>recordAsync()</C> on the
          ref. Call <C>stopRecording()</C> to finish. The file URI is returned when recording stops.
        </P>
        <P>
          Recording keeps the camera busy. Avoid navigating away mid-recording without stopping first.
        </P>
      </NotesSection>
      <NotesSection title="Flash, torch & zoom">
        <P>
          <C>flash</C> — affects still captures only: <C>off</C>, <C>on</C>, or <C>auto</C>.
        </P>
        <P>
          <C>enableTorch</C> — keeps the LED on during preview (useful in low light). Separate from
          flash mode.
        </P>
        <P>
          <C>zoom</C> — adjust with +/− buttons. Values are normalized 0–1, not optical zoom multiples.
        </P>
      </NotesSection>
      <NotesSection title="Barcode scanning — onBarcodeScanned">
        <P>
          In Scan mode, pass <C>barcodeScannerSettings</C> with allowed types (QR, EAN-13, Code 128)
          and handle <C>onBarcodeScanned</C>. The callback receives <C>type</C> and <C>data</C>.
        </P>
        <P>
          Debounce or dedupe results — the scanner fires repeatedly while a code is in frame. This
          lesson ignores duplicate <C>data</C> values and triggers haptic feedback on iOS when a new
          code is read.
        </P>
      </NotesSection>
    </>
  );
}

function AudioNotes() {
  return (
    <>
      <P>
        Expo Audio replaces the old <C>expo-av</C> API. It provides hooks for playback and recording
        with a shared audio session model across iOS and Android.
      </P>
      <NotesSection title="Overview — playback vs recording">
        <P>
          Use <C>useAudioPlayer()</C> to play local files, bundled assets, or remote URLs. Use{' '}
          <C>useAudioRecorder()</C> to capture microphone input. Both can coexist, but the audio session
          must be configured so iOS allows recording while other audio is paused.
        </P>
      </NotesSection>
      <NotesSection title="Permissions — requestRecordingPermissionsAsync()">
        <P>
          Before recording, call <C>AudioModule.requestRecordingPermissionsAsync()</C>. Playback of
          remote URLs does not need microphone permission, but recording always does.
        </P>
        <P>
          Android needs <C>RECORD_AUDIO</C> in the native build. iOS shows a system dialog the first
          time you record.
        </P>
      </NotesSection>
      <NotesSection title="Audio session — setAudioModeAsync()">
        <P>
          Configure global behavior with <C>setAudioModeAsync()</C>. This lesson sets{' '}
          <C>playsInSilentMode: true</C> so sample playback works when the iPhone mute switch is on,
          and <C>allowsRecording: true</C> so the recorder can open the mic.
        </P>
        <P>
          Call this once when the screen mounts. Wrong session settings are a common cause of “silent”
          playback or failed recordings on iOS.
        </P>
      </NotesSection>
      <NotesSection title="Playback — useAudioPlayer()">
        <P>
          Pass a source URI or asset to <C>useAudioPlayer(source)</C>. Control playback with{' '}
          <C>play()</C>, <C>pause()</C>, <C>seekTo(seconds)</C>, and <C>replace(newSource)</C> to
          switch between the bundled sample MP3 and your recording.
        </P>
        <P>
          The player persists for the lifetime of the hook. Replacing the source is cheaper than
          creating a new player instance.
        </P>
      </NotesSection>
      <NotesSection title="Status — useAudioPlayerStatus()">
        <P>
          <C>useAudioPlayerStatus(player)</C> returns reactive fields: <C>playing</C>,{' '}
          <C>currentTime</C>, <C>duration</C>, and <C>didJustFinish</C>. Use these to drive progress
          bars and play/pause button labels without manual polling.
        </P>
      </NotesSection>
      <NotesSection title="Recording — useAudioRecorder()">
        <P>
          Create a recorder with a preset such as <C>RecordingPresets.HIGH_QUALITY</C>. The flow is:{' '}
          <C>prepareToRecordAsync()</C> → <C>record()</C> → <C>stop()</C>. After stopping, read the
          file from <C>recorder.uri</C>.
        </P>
        <P>
          Presets encode sample rate, bit rate, and format. Pick a lower-quality preset if file size
          matters more than fidelity.
        </P>
      </NotesSection>
      <NotesSection title="Recorder state — useAudioRecorderState()">
        <P>
          <C>useAudioRecorderState(recorder)</C> exposes <C>isRecording</C> and metering data. Use it
          to toggle UI and show recording duration without managing timers manually.
        </P>
      </NotesSection>
    </>
  );
}

function MediaLibraryNotes() {
  return (
    <>
      <P>
        Media Library reads the user&apos;s photo and video gallery. You can list albums, page through
        assets, inspect metadata, save new files, and handle iOS limited library access.
      </P>
      <NotesSection title="Overview — read vs write">
        <P>
          Read APIs (<C>getAssetsAsync</C>, <C>getAlbumsAsync</C>) need gallery permission. Write APIs
          (<C>saveToLibraryAsync</C>) save into the user&apos;s library — useful after your app captures
          a photo or exports a file.
        </P>
      </NotesSection>
      <NotesSection title="Permissions — usePermissions()">
        <P>
          <C>usePermissions()</C> returns status and a request function. On iOS 14+, users can grant{' '}
          <C>limited</C> access (selected photos only). Check <C>accessPrivileges</C> for{' '}
          <C>all</C>, <C>limited</C>, or <C>none</C>.
        </P>
        <P>
          Always handle the denied state gracefully. Never assume full library access after the first
          prompt.
        </P>
      </NotesSection>
      <NotesSection title="Albums — getAlbumsAsync()">
        <P>
          Returns user-created and smart albums (Recents, Favorites, Screenshots on iOS). Pass an album
          id to <C>getAssetsAsync({`{ album }`})</C> to filter the grid to one album.
        </P>
      </NotesSection>
      <NotesSection title="Assets — getAssetsAsync()">
        <P>
          Page results with <C>first</C> and <C>after</C> (cursor from the previous page). Filter with{' '}
          <C>mediaType</C> (photo, video, or both) and sort with <C>sortBy</C> (creation time default).
        </P>
        <P>
          This lesson loads 24 assets at a time and supports “Load more” pagination via the{' '}
          <C>endCursor</C> returned in the response.
        </P>
      </NotesSection>
      <NotesSection title="Metadata — getAssetInfoAsync()">
        <P>
          Returns filename, dimensions, duration (video), EXIF, and optionally GPS location embedded in
          the file. Location metadata on Android requires <C>ACCESS_MEDIA_LOCATION</C>.
        </P>
        <P>
          Enable it in <C>app.json</C> with the media-library plugin option{' '}
          <C>isAccessMediaLocationEnabled: true</C>, then rebuild. Without it, the lesson falls back
          to basic metadata (filename, size, dimensions).
        </P>
      </NotesSection>
      <NotesSection title="Save — saveToLibraryAsync()">
        <P>
          Copies a local file URI into the gallery. This lesson saves a bundled sample image. Pair this
          with camera captures or exported documents to let users keep files permanently.
        </P>
      </NotesSection>
      <NotesSection title="Limited access — presentPermissionsPickerAsync()">
        <P>
          When the user chose limited access, call this to open the system picker so they can add or
          remove visible items without leaving your app. Supported on iOS and Android 14+.
        </P>
      </NotesSection>
    </>
  );
}

function LocationNotes() {
  return (
    <>
      <P>
        Expo Location wraps GPS, geocoding, and compass APIs. This lesson focuses on foreground (while
        app is open) usage — background tracking needs extra permissions and OS-specific setup.
      </P>
      <NotesSection title="Overview — accuracy vs speed">
        <P>
          <C>getCurrentPositionAsync()</C> waits for a fresh GPS fix (slower, more accurate).{' '}
          <C>getLastKnownPositionAsync()</C> returns a cached fix immediately (faster, may be stale).
          Pick based on whether you need precision or responsiveness.
        </P>
      </NotesSection>
      <NotesSection title="Permissions — useForegroundPermissions()">
        <P>
          <C>useForegroundPermissions()</C> requests “When In Use” location access. The status object
          tells you if access is granted, denied, or undetermined.
        </P>
        <P>
          Background location (<C>useBackgroundPermissions()</C>) is a separate permission on iOS and
          requires declared usage strings and often App Store review justification.
        </P>
      </NotesSection>
      <NotesSection title="Current position — getCurrentPositionAsync()">
        <P>
          Pass <C>{`{ accuracy: Location.Accuracy.Balanced }`}</C> (or High, Low, etc.) to trade
          precision for battery and wait time. Indoors, fixes can take several seconds or fail entirely.
        </P>
      </NotesSection>
      <NotesSection title="Cached position — getLastKnownPositionAsync()">
        <P>
          Returns the last fix the OS cached — often good enough for “nearby” features. Returns null if
          no cache exists (fresh install, location disabled).
        </P>
      </NotesSection>
      <NotesSection title="Live updates — watchPositionAsync()">
        <P>
          Subscribe with <C>watchPositionAsync(options, callback)</C>. Control frequency via{' '}
          <C>timeInterval</C> (ms) and <C>distanceInterval</C> (meters). Always call{' '}
          <C>subscription.remove()</C> on unmount to stop GPS and save battery.
        </P>
        <P>
          This lesson toggles watch on/off and appends each update to a log so you can see the stream.
        </P>
      </NotesSection>
      <NotesSection title="Geocoding — geocodeAsync() / reverseGeocodeAsync()">
        <P>
          <C>geocodeAsync(address)</C> converts an address string to coordinates.{' '}
          <C>reverseGeocodeAsync(coords)</C> converts coordinates to street, city,
          region, and country fields.
        </P>
        <P>
          Results depend on Apple/Google geocoding databases. Multiple matches can be returned for
          ambiguous addresses.
        </P>
      </NotesSection>
      <NotesSection title="Heading — getHeadingAsync()">
        <P>
          Reads compass heading (degrees from north) via the device magnetometer. Useful for map
          rotation or AR-style direction UI. Accuracy varies near metal or magnetic interference.
        </P>
      </NotesSection>
      {Platform.OS === 'android' && (
        <NotesSection title="Android emulator tip">
          <P>
            Open Extended Controls → Location and set a mock coordinate. If fixes never arrive, disable
            “Improve Location Accuracy” in device settings or use a physical device for reliable GPS
            testing.
          </P>
        </NotesSection>
      )}
    </>
  );
}

function NetworkNotes() {
  return (
    <>
      <P>
        Expo Network tells you how the device is connected — Wi‑Fi, cellular, offline — and whether the
        internet is actually reachable (not just “has a network interface”).
      </P>
      <NotesSection title="Overview — connected vs reachable">
        <P>
          <C>isConnected</C> means a network interface is up (e.g. joined Wi‑Fi).{' '}
          <C>isInternetReachable</C> means the OS believes the internet is accessible — important for
          showing offline banners before failed API calls.
        </P>
      </NotesSection>
      <NotesSection title="Live updates — useNetworkState()">
        <P>
          React hook that re-renders when connectivity changes. Returns <C>type</C> (WIFI, CELLULAR,
          NONE, etc.), <C>isConnected</C>, and <C>isInternetReachable</C>. Best for UI that should
          update automatically (offline mode badge, sync queue pause).
        </P>
      </NotesSection>
      <NotesSection title="One-time read — getNetworkStateAsync()">
        <P>
          Same shape as the hook, but a single async call. Use before a network request when you do not
          need a subscription — e.g. “should I attempt upload now?”
        </P>
      </NotesSection>
      <NotesSection title="IP address — getIpAddressAsync()">
        <P>
          Returns the device&apos;s local IPv4 address on native. On web, Expo uses a public IP lookup
          service instead. Do not treat this as a stable device identifier — it changes per network.
        </P>
      </NotesSection>
      <NotesSection title="Change events — addNetworkStateListener()">
        <P>
          Imperative listener for non-React code (services, background tasks). Returns a subscription;
          call <C>remove()</C> when done. This lesson logs the last few events so you can see transitions
          (Wi‑Fi → cellular, online → offline).
        </P>
      </NotesSection>
      <NotesSection title="Airplane mode — isAirplaneModeEnabledAsync()">
        <P>
          Android-only. Returns whether airplane mode is on. Useful for explaining why both{' '}
          <C>isConnected</C> and <C>isInternetReachable</C> are false even when Wi‑Fi appears enabled
          in settings.
        </P>
      </NotesSection>
    </>
  );
}

function BatteryNotes() {
  return (
    <>
      <P>
        Expo Battery exposes charge level, charging state, and low-power mode. Useful for adapting UI,
        deferring heavy work, or warning users before long background tasks.
      </P>
      <NotesSection title="Overview — hooks vs async">
        <P>
          Use hooks (<C>useBatteryLevel</C>, etc.) inside React components for live UI. Use{' '}
          <C>getPowerStateAsync()</C> for one-off reads in utilities or before starting a large download.
        </P>
      </NotesSection>
      <NotesSection title="Hooks — useBatteryLevel() / useBatteryState()">
        <P>
          <C>useBatteryLevel()</C> returns 0–1 (multiply by 100 for percent).{' '}
          <C>useBatteryState()</C> returns <C>BatteryState.CHARGING</C>, <C>UNPLUGGED</C>,{' '}
          <C>FULL</C>, or <C>UNKNOWN</C>.
        </P>
      </NotesSection>
      <NotesSection title="Low power — useLowPowerMode()">
        <P>
          Boolean hook: true when iOS Low Power Mode or Android Battery Saver is active. Consider
          reducing animations, polling frequency, or background sync when this is on.
        </P>
      </NotesSection>
      <NotesSection title="Combined state — getPowerStateAsync()">
        <P>
          Single call returning <C>batteryLevel</C>, <C>batteryState</C>, and <C>lowPowerMode</C> together.
          Handy for logging or conditional logic without three separate reads.
        </P>
      </NotesSection>
      <NotesSection title="Listeners — addBatteryLevelListener()">
        <P>
          Fires when level changes. Also available: <C>addBatteryStateListener</C> and{' '}
          <C>addLowPowerModeListener</C>. Remove subscriptions on cleanup. This lesson shows live values
          from hooks plus a manual refresh button.
        </P>
      </NotesSection>
      {Platform.OS === 'android' && (
        <NotesSection title="Android — isBatteryOptimizationEnabledAsync()">
          <P>
            Checks whether your app is exempt from Doze/battery optimization. Background location,
            sync, and alarms may be delayed if optimization is enabled. Direct users to system settings
            if they need reliable background behavior.
          </P>
        </NotesSection>
      )}
    </>
  );
}

function HapticsNotes() {
  return (
    <>
      <P>
        Haptics provide tactile feedback for confirmations, errors, and subtle UI interactions. Expo
        Haptics maps common patterns to iOS Taptic Engine and Android vibration APIs.
      </P>
      <NotesSection title="Overview — when to haptic">
        <P>
          Use haptics sparingly for meaningful moments: successful scan, form error, toggle change. Overuse
          desensitizes users. Prefer built-in haptics on native controls (Switch, DateTimePicker) when
          available.
        </P>
      </NotesSection>
      <NotesSection title="Selection — selectionAsync()">
        <P>
          Lightest feedback — ideal for picker wheels, segmented controls, and list item selection. Maps
          to a short tick on iOS and a brief vibration on Android.
        </P>
      </NotesSection>
      <NotesSection title="Notifications — notificationAsync()">
        <P>
          Semantic patterns: <C>Success</C>, <C>Warning</C>, and <C>Error</C>. Use after async outcomes
          (payment succeeded, validation failed) rather than on every button press.
        </P>
      </NotesSection>
      <NotesSection title="Impacts — impactAsync()">
        <P>
          Physical “collision” feel with styles: <C>Light</C>, <C>Medium</C>, <C>Heavy</C>,{' '}
          <C>Rigid</C>, and <C>Soft</C>. Heavier styles suit impactful actions (drop, snap, threshold
          crossed).
        </P>
      </NotesSection>
      {Platform.OS === 'android' && (
        <NotesSection title="Android — performAndroidHapticsAsync()">
          <P>
            Uses Android&apos;s native haptic constants (clock tick, confirm, reject, etc.) for richer
            feedback than legacy vibration patterns. Prefer this over generic <C>Vibration</C> API on
            modern Android devices with linear actuators.
          </P>
        </NotesSection>
      )}
      {Platform.OS === 'ios' && (
        <NotesSection title="iOS note">
          <P>
            Haptics require a physical Taptic Engine (iPhone 7+). Simulators do not reproduce haptics —
            test on a real device.
          </P>
        </NotesSection>
      )}
    </>
  );
}

function DocumentPickerNotes() {
  return (
    <>
      <P>
        Document Picker opens the system file chooser so users can select documents, images, PDFs, or
        any MIME type you allow. Files can be copied to cache for immediate reading by your app.
      </P>
      <NotesSection title="Overview — picker vs camera">
        <P>
          Use the document picker when the user already has a file (PDF report, CSV export, image from
          Files app). Use <C>expo-camera</C> or <C>expo-image-picker</C> when you need to capture new
          media.
        </P>
      </NotesSection>
      <NotesSection title="Pick files — getDocumentAsync()">
        <P>
          Must be called from a user gesture (button press). Returns <C>{`{ canceled, assets }`}</C>.
          Each asset includes <C>uri</C>, <C>name</C>, <C>mimeType</C>, and <C>size</C>.
        </P>
        <P>
          On web, the picker uses a hidden file input — still requires a direct user action or browsers
          block it.
        </P>
      </NotesSection>
      <NotesSection title="MIME filters — type">
        <P>
          Restrict selectable files: <C>*/*</C> (any), <C>image/*</C>, <C>application/pdf</C>, or
          an array of types. Tighter filters reduce user confusion and rejected selections.
        </P>
      </NotesSection>
      <NotesSection title="Multiple selection — multiple">
        <P>
          Set <C>multiple: true</C> to allow picking several files at once. The result contains an array
          of assets. Toggle this in the lesson to compare single vs multi pick.
        </P>
      </NotesSection>
      <NotesSection title="Cache copy — copyToCacheDirectory">
        <P>
          When true (recommended), copies the file into app cache so <C>expo-file-system</C> can read it
          immediately. Some content URIs on Android are not directly readable without copying.
        </P>
      </NotesSection>
      <NotesSection title="Read files — expo-file-system File">
        <P>
          After picking, use <C>{`new File(asset.uri)`}</C> from <C>expo-file-system</C>. Call{' '}
          <C>info()</C> for size and existence, <C>text()</C> for text files, or <C>bytes()</C> for
          binary data. This lesson previews the first 240 characters of text files.
        </P>
      </NotesSection>
    </>
  );
}

function ContactsNotes() {
  return (
    <>
      <P>
        Expo Contacts reads the device address book, fetches individual records, and can present the
        native contact picker so users choose someone without granting full library access (iOS).
      </P>
      <NotesSection title="Overview — privacy">
        <P>
          Contacts are sensitive PII. Request access only when needed, fetch the minimum{' '}
          <C>fields</C>, and never upload contact lists without explicit user consent and disclosure.
        </P>
      </NotesSection>
      <NotesSection title="Permissions — requestPermissionsAsync()">
        <P>
          On Android, you must grant read (and optionally write) contacts permission before querying.{' '}
          <C>getPermissionsAsync()</C> checks current status; <C>requestPermissionsAsync()</C> shows
          the system dialog.
        </P>
        <P>
          Configure permission messages in <C>app.json</C> via the expo-contacts config plugin, then
          rebuild the development client.
        </P>
      </NotesSection>
      <NotesSection title="List contacts — getContactsAsync()">
        <P>
          Returns paginated results. Specify <C>fields</C> to limit data (names, phone numbers, emails).
          Use <C>pageSize</C> and <C>pageOffset</C> for paging, and <C>sort</C> for alphabetical order.
        </P>
        <P>
          This lesson loads 12 contacts sorted by first name. Tapping a row fetches full details.
        </P>
      </NotesSection>
      <NotesSection title="Details — getContactByIdAsync()">
        <P>
          Pass a contact id and field list to load one record with phones, emails, and company. Faster
          than re-querying the entire list when the user selects a single person.
        </P>
      </NotesSection>
      <NotesSection title="Native picker — presentContactPickerAsync()">
        <P>
          Opens the system contact UI. Returns the selected contact or null if canceled. On iOS, this
          can work without prior read permission — the user picks exactly one contact to share with your
          app.
        </P>
      </NotesSection>
      <NotesSection title="Availability — hasContactsAsync()">
        <P>
          Returns whether the device has any contacts saved. Useful for empty states before running a
          heavier <C>getContactsAsync</C> query on a fresh device or emulator.
        </P>
      </NotesSection>
    </>
  );
}

const NOTES: Record<string, () => React.JSX.Element> = {
  camera: CameraNotes,
  audio: AudioNotes,
  'media-library': MediaLibraryNotes,
  location: LocationNotes,
  network: NetworkNotes,
  battery: BatteryNotes,
  haptics: HapticsNotes,
  'document-picker': DocumentPickerNotes,
  contacts: ContactsNotes,
};

export function LessonNotes({ lessonId }: LessonNotesProps) {
  const Notes = NOTES[lessonId];

  if (!Notes) {
    return null;
  }

  return (
    <ThemedView style={{ gap: Spacing.three }}>
      <ThemedText type="smallBold">Lesson notes</ThemedText>
      <ThemedView style={{ gap: Spacing.two }}>
        <Notes />
      </ThemedView>
    </ThemedView>
  );
}
