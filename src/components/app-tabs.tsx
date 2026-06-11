import { NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { useColorScheme } from 'react-native';

import { LESSON_CATEGORIES } from '@/constants/lessons';
import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      {LESSON_CATEGORIES.map((category) => (
        <NativeTabs.Trigger
          key={category.id}
          name={category.id}
          disableTransparentOnScrollEdge={category.id === 'capture'}>
          <NativeTabs.Trigger.Icon
            sf={category.tabIcon.sf as never}
            md={category.tabIcon.md as never}
          />
          <NativeTabs.Trigger.Label>{category.tabLabel}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
