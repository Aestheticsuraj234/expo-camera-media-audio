import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Platform, Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { LESSONS } from '@/constants/lessons';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const theme = useTheme();

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}>
      <ThemedView style={styles.header}>
        <ThemedText type="subtitle">Device APIs</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          Hands-on lessons for camera, audio, media library, location, and more.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.list}>
        {LESSONS.map((lesson) => (
          <Link key={lesson.id} href={lesson.route} asChild>
            <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
              <ThemedView type="backgroundElement" style={styles.cardInner}>
                <ThemedView style={styles.cardTop}>
                  <ThemedText type="smallBold">{lesson.title}</ThemedText>
                  <ThemedText type="code">{lesson.packageName}</ThemedText>
                </ThemedView>
                <ThemedText type="small" themeColor="textSecondary">
                  {lesson.description}
                </ThemedText>
                <ThemedView style={styles.cardFooter}>
                  <ThemedText type="linkPrimary">Open lesson</ThemedText>
                  <SymbolView
                    tintColor={theme.text}
                    name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                    size={12}
                  />
                </ThemedView>
              </ThemedView>
            </Pressable>
          </Link>
        ))}
      </ThemedView>

      {Platform.OS === 'web' && <WebBadge />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: BottomTabInset + Spacing.six,
  },
  header: {
    maxWidth: MaxContentWidth,
    width: '100%',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    paddingBottom: Spacing.three,
    gap: Spacing.two,
  },
  subtitle: {
    lineHeight: 22,
  },
  list: {
    maxWidth: MaxContentWidth,
    width: '100%',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  card: {
    borderRadius: Spacing.three,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardInner: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  cardTop: {
    gap: Spacing.one,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginTop: Spacing.one,
  },
});
