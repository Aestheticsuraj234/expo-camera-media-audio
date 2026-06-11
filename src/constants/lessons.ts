export type LessonRoute =
  | '/camera'
  | '/audio'
  | '/media-library'
  | '/location'
  | '/network'
  | '/battery'
  | '/haptics'
  | '/document-picker'
  | '/contacts';

export type Lesson = {
  id: string;
  title: string;
  packageName: string;
  description: string;
  route: LessonRoute;
};

export const LESSONS: Lesson[] = [
  {
    id: 'camera',
    title: 'Expo Camera',
    packageName: 'expo-camera',
    description:
      'Live preview, permissions, flip camera, photos, video, flash, torch, zoom, and QR scanning.',
    route: '/camera',
  },
  {
    id: 'audio',
    title: 'Audio Recording & Playback',
    packageName: 'expo-audio',
    description:
      'Play remote audio, record with presets, monitor playback status, and replay your clip.',
    route: '/audio',
  },
  {
    id: 'media-library',
    title: 'Media Library',
    packageName: 'expo-media-library',
    description:
      'Browse albums and assets, filter photos/videos, inspect metadata, save files, and manage limited access.',
    route: '/media-library',
  },
  {
    id: 'location',
    title: 'Location',
    packageName: 'expo-location',
    description:
      'Foreground permissions, current and cached GPS, live watch updates, heading, and geocoding.',
    route: '/location',
  },
  {
    id: 'network',
    title: 'Network State',
    packageName: 'expo-network',
    description:
      'Connection type, internet reachability, IP address, change listeners, and airplane mode.',
    route: '/network',
  },
  {
    id: 'battery',
    title: 'Battery Status',
    packageName: 'expo-battery',
    description:
      'Battery level, charging state, low power mode, power state, and live battery events.',
    route: '/battery',
  },
  {
    id: 'haptics',
    title: 'Haptics',
    packageName: 'expo-haptics',
    description:
      'Selection, notification, and impact feedback plus Android-native haptic constants.',
    route: '/haptics',
  },
  {
    id: 'document-picker',
    title: 'Document Picker',
    packageName: 'expo-document-picker',
    description:
      'Pick files by MIME type, allow multiple selection, cache copies, and read with expo-file-system.',
    route: '/document-picker',
  },
  {
    id: 'contacts',
    title: 'Contacts Access',
    packageName: 'expo-contacts',
    description:
      'Request permissions, list contacts, inspect details, and pick a contact natively.',
    route: '/contacts',
  },
];
