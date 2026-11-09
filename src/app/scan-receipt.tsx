import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { ExpenseForm, type Prefill } from '@/components/expense-form';
import { Button, Card, ErrorBanner, Screen } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { alertAfterSave } from '@/lib/alerts';
import { api } from '@/lib/api';
import { notify } from '@/lib/confirm';
import type { ScannedReceipt } from '@/lib/types';

type Picked = { uri: string; mimeType?: string };

/**
 * Scan flow: pick/take a photo -> the API reads it (nothing saved yet) ->
 * the user reviews and corrects the fields -> Save creates the expense and
 * attaches the image via the scan's receipt_token.
 */
export default function ScanReceiptScreen() {
  const [image, setImage] = useState<Picked | null>(null);
  const [scan, setScan] = useState<ScannedReceipt | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const categories = useApi('categories', api.categories);

  const handleResult = (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled) return;
    const asset = result.assets[0];
    setImage({ uri: asset.uri, mimeType: asset.mimeType ?? undefined });
    setScan(null);
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

  const read = async () => {
    if (!image) return;
    setScanning(true);
    setError(null);
    try {
      setScan(await api.scanReceipt(image.uri, image.mimeType));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read the receipt');
    } finally {
      setScanning(false);
    }
  };

  const startOver = () => {
    setImage(null);
    setScan(null);
    setError(null);
  };

  // ---------- Step 2: review ----------
  if (scan && image) {
    // Leave unreadable fields blank so the form makes the user fill them in.
    const prefill: Prefill = {
      merchant: scan.missing.includes('merchant') ? undefined : scan.merchant,
      amount: scan.missing.includes('amount') ? undefined : scan.amount,
      currency: scan.currency,
      category: scan.category,
      date: scan.date,
    };
    const flaggedCount = scan.missing.length;

    return (
      <Screen topInset={false}>
        <Stack.Screen options={{ title: 'Review Receipt' }} />
        <Image source={{ uri: image.uri }} style={styles.thumb} contentFit="contain" accessibilityLabel="Scanned receipt" />

        <Card style={styles.notice}>
          <Text style={styles.noticeTitle}>
            {flaggedCount === 0 ? '✅ Everything was read. Check the details before saving.' : `⚠️ ${flaggedCount} field${flaggedCount === 1 ? '' : 's'} need${flaggedCount === 1 ? 's' : ''} checking. They're highlighted below.`}
          </Text>
          <Text style={styles.noticeText}>
            {scan.source === 'ai'
              ? 'Read with AI.'
              : 'Read with basic text recognition. Add an OpenAI key to the server for better results.'}{' '}
            Nothing is saved until you tap Save.
          </Text>
        </Card>

        <ExpenseForm
          prefill={prefill}
          flagged={scan.missing}
          categories={categories.data ?? []}
          defaultCurrency={scan.currency}
          submitLabel="Save expense"
          onSubmit={async (input) => {
            try {
              await api.createExpense({ ...input, receipt_token: scan.receipt_token });
              router.back();
              alertAfterSave(input);
            } catch (err) {
              notify('Could not save', err instanceof Error ? err.message : String(err));
            }
          }}
        />
        <Button label="Scan a different receipt" variant="secondary" onPress={startOver} style={{ marginTop: Spacing.md }} />
      </Screen>
    );
  }

  // ---------- Step 1: choose an image ----------
  return (
    <Screen topInset={false}>
      <Text style={styles.subtitle}>
        Take or choose a photo of a receipt. Budget Buddy reads it and lets you check the details before
        anything is saved.
      </Text>

      <View style={styles.row}>
        {Platform.OS !== 'web' ? (
          <Button label="📷 Take photo" onPress={takePhoto} style={{ flex: 1 }} disabled={scanning} />
        ) : null}
        <Button
          label={image ? '🖼 Choose another' : '🖼 Choose image'}
          variant="secondary"
          onPress={pickFromLibrary}
          style={{ flex: 1 }}
          disabled={scanning}
        />
      </View>

      {image ? (
        <Image source={{ uri: image.uri }} style={styles.preview} contentFit="contain" accessibilityLabel="Selected receipt" />
      ) : null}

      {error ? <ErrorBanner message={error} onRetry={image ? read : undefined} /> : null}

      {image ? (
        <Button label={scanning ? 'Reading receipt…' : 'Read receipt'} variant="success" onPress={read} loading={scanning} />
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
  thumb: {
    width: '100%',
    height: 220,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
    backgroundColor: '#000',
  },
  notice: { padding: Spacing.lg, marginBottom: Spacing.xl },
  noticeTitle: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  noticeText: { color: Colors.textSecondary, fontSize: 13, marginTop: Spacing.xs, lineHeight: 18 },
});
