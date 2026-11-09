import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { Button, ErrorBanner, Screen } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { api } from '@/lib/api';

type Picked = { uri: string; mimeType?: string };

export default function ScanReceiptScreen() {
  const [image, setImage] = useState<Picked | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResult = (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled) return;
    const asset = result.assets[0];
    setImage({ uri: asset.uri, mimeType: asset.mimeType ?? undefined });
    setError(null);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError('Camera access is needed to photograph receipts. You can enable it in Settings.');
      return;
    }
    handleResult(await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 }));
  };

  const pickFromLibrary = async () => {
    handleResult(await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 }));
  };

  const scan = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const { expense } = await api.scanAndSaveReceipt(image.uri, image.mimeType);
      // Open the saved expense so the user can check and correct what was extracted.
      router.replace({ pathname: '/expense/[id]', params: { id: String(expense.id) } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen topInset={false}>
      <Text style={styles.subtitle}>
        Take or choose a photo of a receipt. Budget Buddy reads it, saves the expense, and opens it so
        you can double-check the details.
      </Text>

      <View style={styles.row}>
        {Platform.OS !== 'web' ? (
          <Button label="📷 Take photo" onPress={takePhoto} style={{ flex: 1 }} disabled={loading} />
        ) : null}
        <Button
          label="🖼 Choose image"
          variant="secondary"
          onPress={pickFromLibrary}
          style={{ flex: 1 }}
          disabled={loading}
        />
      </View>

      {image ? (
        <Image source={{ uri: image.uri }} style={styles.preview} contentFit="contain" accessibilityLabel="Selected receipt" />
      ) : null}

      {error ? <ErrorBanner message={error} /> : null}

      {image ? (
        <Button label={loading ? 'Reading receipt…' : 'Scan & save'} variant="success" onPress={scan} loading={loading} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { color: Colors.textSecondary, fontSize: 16, marginBottom: Spacing.xl, lineHeight: 22 },
  row: { flexDirection: 'row', gap: Spacing.md },
  preview: {
    width: '100%',
    height: 360,
    borderRadius: Radius.md,
    marginVertical: Spacing.xl,
    backgroundColor: '#000',
  },
});
