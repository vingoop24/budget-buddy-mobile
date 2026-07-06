import * as ImagePicker from "expo-image-picker";
import { Link } from "expo-router";
import { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const API_URL = "http://127.0.0.1:8000";

export default function ScanReceiptScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const pickReceipt = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const scanReceipt = async () => {
  if (!imageUri) return;

  setLoading(true);

  const formData = new FormData();

  const imageResponse = await fetch(imageUri);
  const blob = await imageResponse.blob();

  formData.append("receipt", blob, "receipt.jpg");

  try {
    const res = await fetch(`${API_URL}/scan-and-save-receipt`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    const expense = data.expense;

    setResult(
    `Saved successfully ✅\n\nMerchant: ${expense.merchant}\nAmount: ${expense.currency} ${expense.amount}\nCategory: ${expense.category}\nDate: ${expense.date}`
    );
  } catch (err) {
    console.log(err);
    setResult("Scan failed.");
  }

  setLoading(false);
};

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Scan Receipt 📸</Text>
      <Text style={styles.subtitle}>
        Upload a receipt and let AI extract the expense.
      </Text>

      <TouchableOpacity style={styles.button} onPress={pickReceipt}>
        <Text style={styles.buttonText}>Choose Receipt Image</Text>
      </TouchableOpacity>

      {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} /> : null}

      {imageUri ? (
        <TouchableOpacity style={styles.button} onPress={scanReceipt}>
          <Text style={styles.buttonText}>
            {loading ? "Scanning..." : "Scan with AI"}
          </Text>
        </TouchableOpacity>
      ) : null}

      {result ? (
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      ) : null}

      <Link href="/" asChild>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.buttonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111827", padding: 20 },
  title: { fontSize: 32, color: "white", fontWeight: "bold", marginTop: 50 },
  subtitle: { color: "#9CA3AF", marginBottom: 25, fontSize: 16 },
  button: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 15,
  },
  backButton: {
    backgroundColor: "#374151",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  preview: {
    width: "100%",
    height: 350,
    borderRadius: 14,
    marginTop: 20,
  },
  resultBox: {
    backgroundColor: "#1F2937",
    padding: 20,
    borderRadius: 14,
    marginTop: 20,
  },
  resultText: {
    color: "white",
  },
});