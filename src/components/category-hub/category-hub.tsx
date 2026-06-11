import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Platform, Pressable, ScrollView, StyleSheet } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import {
  getCategory,
  getLessonsByCategory,
  type LessonCategoryId,
} from '@/constants/lessons';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type CategoryHubProps = {
  categoryId: LessonCategoryId;
  showDeveloperNotes?: boolean;
};

export function CategoryHub({ categoryId, showDeveloperNotes = false }: CategoryHubProps) {
  const theme = useTheme();
  const category = getCategory(categoryId);
  const lessons = getLessonsByCategory(categoryId);

  if (!category) {
    return null;
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}>
      <ThemedView style={styles.header}>
        <ThemedText type="subtitle">{category.title}</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          {category.description}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.list}>
        {lessons.map((lesson) => (
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

      {showDeveloperNotes && (
        <ThemedView style={styles.notesSection}>
          <ThemedText type="smallBold">Developer notes</ThemedText>
          <Collapsible title="Development builds">
            <ThemedText type="small">
              Camera, microphone, contacts, and other native APIs need a development build after you
              add packages. Run{' '}
              <ThemedText type="code">eas build --profile development --platform android</ThemedText>{' '}
              when native modules change.
            </ThemedText>
          </Collapsible>
          <Collapsible title="Permissions">
            <ThemedText type="small">
              Runtime permissions are requested in code with hooks like{' '}
              <ThemedText type="code">useCameraPermissions()</ThemedText>. Manifest entries are
              configured in <ThemedText type="code">app.json</ThemedText> config plugins.
            </ThemedText>
          </Collapsible>
          <Collapsible title="Expo SDK 55">
            <ThemedText type="small">
              Read the versioned docs at{' '}
              <ThemedText type="code">https://docs.expo.dev/versions/v55.0.0/</ThemedText> before
              changing native packages.
            </ThemedText>
          </Collapsible>
        </ThemedView>
      )}

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
  notesSection: {
    maxWidth: MaxContentWidth,
    width: '100%',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    gap: Spacing.three,
  },
});
