export type Lesson = {
  id: string;
  title: string;
  packageName: string;
  description: string;
  route: `/camera`;
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
];
