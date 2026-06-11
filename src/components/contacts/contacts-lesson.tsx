import * as Contacts from 'expo-contacts';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LessonNotes } from '@/components/lesson-notes/lesson-notes';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

function formatContactName(contact: Contacts.Contact) {
  const parts = [contact.firstName, contact.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : contact.name ?? 'Unnamed contact';
}

export function ContactsLesson() {
  const insets = useSafeAreaInsets();
  const [permission, setPermission] = useState<Contacts.ContactsPermissionResponse | null>(null);
  const [hasContacts, setHasContacts] = useState<boolean | null>(null);
  const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contacts.Contact | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    Contacts.getPermissionsAsync().then(setPermission);
  }, []);

  const requestPermission = async () => {
    const result = await Contacts.requestPermissionsAsync();
    setPermission(result);
    return result.granted;
  };

  const ensurePermission = async () => {
    if (permission?.granted) {
      return true;
    }
    return requestPermission();
  };

  const loadContacts = async () => {
    const granted = await ensurePermission();
    if (!granted) {
      Alert.alert('Permission required', 'Contacts access is needed to read the address book.');
      return;
    }

    setIsLoading(true);
    try {
      const exists = await Contacts.hasContactsAsync();
      setHasContacts(exists);

      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Emails,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Company,
        ],
        pageSize: 12,
        sort: Contacts.SortTypes.FirstName,
      });

      setContacts(data);
      setStatusMessage(`Loaded ${data.length} contacts.`);
    } catch (error) {
      Alert.alert('Load failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const openNativePicker = async () => {
    try {
      const contact = await Contacts.presentContactPickerAsync();
      if (!contact) {
        setStatusMessage('Contact picker canceled.');
        return;
      }

      setSelectedContact(contact);
      setStatusMessage(`Selected ${formatContactName(contact)} from the native picker.`);
    } catch (error) {
      Alert.alert('Picker failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const inspectContact = async (contact: Contacts.Contact) => {
    if (!contact.id) {
      setSelectedContact(contact);
      return;
    }

    try {
      const detailed = await Contacts.getContactByIdAsync(contact.id, [
        Contacts.Fields.Emails,
        Contacts.Fields.PhoneNumbers,
        Contacts.Fields.Company,
      ]);
      setSelectedContact(detailed ?? contact);
      setStatusMessage(`Loaded details for ${formatContactName(detailed ?? contact)}.`);
    } catch {
      setSelectedContact(contact);
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
        <ThemedText type="subtitle">Contacts</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.permissionCopy}>
          Grant contacts access to list address book entries, inspect details, and use the native
          contact picker.
        </ThemedText>
        <Pressable
          onPress={requestPermission}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
          <ThemedText style={styles.primaryButtonLabel}>Grant contacts access</ThemedText>
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
          <ThemedText type="subtitle">Contacts</ThemedText>
          <ThemedText type="code">expo-contacts</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.intro}>
            Read contacts, inspect phone/email fields, and pick a contact with the native UI.
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Device has contacts: {hasContacts === null ? 'Unknown' : hasContacts ? 'Yes' : 'No'}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <View style={styles.buttonRow}>
            <Pressable disabled={isLoading} onPress={loadContacts} style={styles.actionButton}>
              <ThemedText type="smallBold">{isLoading ? 'Loading…' : 'Load contacts'}</ThemedText>
            </Pressable>
            <Pressable onPress={openNativePicker} style={styles.actionButton}>
              <ThemedText type="smallBold">Native picker</ThemedText>
            </Pressable>
          </View>
        </ThemedView>

        {contacts.length > 0 && (
          <ThemedView style={styles.section}>
            <ThemedText type="smallBold">Contacts</ThemedText>
            {contacts.map((contact) => (
              <Pressable
                key={contact.id ?? formatContactName(contact)}
                onPress={() => inspectContact(contact)}
                style={styles.contactRow}>
                <ThemedText type="smallBold">{formatContactName(contact)}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {contact.phoneNumbers?.[0]?.number ?? 'No phone'} ·{' '}
                  {contact.emails?.[0]?.email ?? 'No email'}
                </ThemedText>
              </Pressable>
            ))}
          </ThemedView>
        )}

        {selectedContact && (
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">Selected contact</ThemedText>
            <ThemedText type="small" selectable>
              {formatContactName(selectedContact)}
            </ThemedText>
            <ThemedText type="small" selectable themeColor="textSecondary">
              Company: {selectedContact.company ?? '—'}
            </ThemedText>
            <ThemedText type="small" selectable themeColor="textSecondary">
              Phone: {selectedContact.phoneNumbers?.map((item) => item.number).join(', ') || '—'}
            </ThemedText>
            <ThemedText type="small" selectable themeColor="textSecondary">
              Email: {selectedContact.emails?.map((item) => item.email).join(', ') || '—'}
            </ThemedText>
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
          <LessonNotes lessonId="contacts" />
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { gap: Spacing.three },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.four },
  permissionScreen: { alignItems: 'stretch', gap: Spacing.three, paddingHorizontal: Spacing.four },
  permissionCopy: { lineHeight: 22 },
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
  contactRow: {
    paddingVertical: Spacing.two,
    gap: Spacing.one,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(120,120,128,0.25)',
  },
  primaryButton: {
    backgroundColor: '#208AEF',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  primaryButtonLabel: { color: '#ffffff', fontWeight: '700' },
  buttonPressed: { opacity: 0.85 },
});
