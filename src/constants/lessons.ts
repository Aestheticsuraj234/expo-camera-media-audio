export type LessonCategoryId = 'capture' | 'device' | 'data';

export type LessonTabIcon = {
  sf: string;
  md: string;
};

export type LessonCategory = {
  id: LessonCategoryId;
  title: string;
  description: string;
  tabLabel: string;
  tabIcon: LessonTabIcon;
};

export type LessonRoute =
  | '/capture/camera'
  | '/capture/audio'
  | '/capture/media-library'
  | '/device/location'
  | '/device/network'
  | '/device/battery'
  | '/device/haptics'
  | '/data/document-picker'
  | '/data/contacts';

export type Lesson = {
  id: string;
  categoryId: LessonCategoryId;
  title: string;
  packageName: string;
  description: string;
  route: LessonRoute;
};

export const LESSON_CATEGORIES: LessonCategory[] = [
  {
    id: 'capture',
    title: 'Capture & Media',
    description: 'Camera, audio recording, and media library access.',
    tabLabel: 'Capture',
    tabIcon: { sf: 'camera.fill', md: 'photo_camera' },
  },
  {
    id: 'device',
    title: 'Device & System',
    description: 'Location, network, battery, and haptic feedback.',
    tabLabel: 'Device',
    tabIcon: { sf: 'iphone', md: 'smartphone' },
  },
  {
    id: 'data',
    title: 'Files & Contacts',
    description: 'Document picker and address book APIs.',
    tabLabel: 'Data',
    tabIcon: { sf: 'folder.fill', md: 'folder' },
  },
];

export const LESSONS: Lesson[] = [
  {
    id: 'camera',
    categoryId: 'capture',
    title: 'Expo Camera',
    packageName: 'expo-camera',
    description:
      'Live preview, permissions, flip camera, photos, video, flash, torch, zoom, and QR scanning.',
    route: '/capture/camera',
  },
  {
    id: 'audio',
    categoryId: 'capture',
    title: 'Audio Recording & Playback',
    packageName: 'expo-audio',
    description:
      'Play remote audio, record with presets, monitor playback status, and replay your clip.',
    route: '/capture/audio',
  },
  {
    id: 'media-library',
    categoryId: 'capture',
    title: 'Media Library',
    packageName: 'expo-media-library',
    description:
      'Browse albums and assets, filter photos/videos, inspect metadata, save files, and manage limited access.',
    route: '/capture/media-library',
  },
  {
    id: 'location',
    categoryId: 'device',
    title: 'Location',
    packageName: 'expo-location',
    description:
      'Foreground permissions, current and cached GPS, live watch updates, heading, and geocoding.',
    route: '/device/location',
  },
  {
    id: 'network',
    categoryId: 'device',
    title: 'Network State',
    packageName: 'expo-network',
    description:
      'Connection type, internet reachability, IP address, change listeners, and airplane mode.',
    route: '/device/network',
  },
  {
    id: 'battery',
    categoryId: 'device',
    title: 'Battery Status',
    packageName: 'expo-battery',
    description:
      'Battery level, charging state, low power mode, power state, and live battery events.',
    route: '/device/battery',
  },
  {
    id: 'haptics',
    categoryId: 'device',
    title: 'Haptics',
    packageName: 'expo-haptics',
    description:
      'Selection, notification, and impact feedback plus Android-native haptic constants.',
    route: '/device/haptics',
  },
  {
    id: 'document-picker',
    categoryId: 'data',
    title: 'Document Picker',
    packageName: 'expo-document-picker',
    description:
      'Pick files by MIME type, allow multiple selection, cache copies, and read with expo-file-system.',
    route: '/data/document-picker',
  },
  {
    id: 'contacts',
    categoryId: 'data',
    title: 'Contacts Access',
    packageName: 'expo-contacts',
    description:
      'Request permissions, list contacts, inspect details, and pick a contact natively.',
    route: '/data/contacts',
  },
];

export function getCategory(id: LessonCategoryId) {
  return LESSON_CATEGORIES.find((category) => category.id === id);
}

export function getLessonsByCategory(categoryId: LessonCategoryId) {
  return LESSONS.filter((lesson) => lesson.categoryId === categoryId);
}
