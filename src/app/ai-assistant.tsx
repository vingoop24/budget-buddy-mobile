import { Link } from "expo-router";
import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const API_URL = "http://127.0.0.1:8000";

type Message = {
  role: "user" | "ai";
  text: string;
};

export default function AIAssistantScreen() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const askAI = async () => {
  if (!question.trim()) return;

  setLoading(true);
  const userQuestion = question;
  setQuestion("");

  setMessages((prev) => [
    ...prev,
    { role: "user", text: userQuestion },
    { role: "ai", text: "Thinking..." },
  ]);

  const res = await fetch(`${API_URL}/ai-assistant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: userQuestion }),
  });

  const data = await res.json();

  setMessages((prev) => [
    ...prev.slice(0, -1),
    { role: "ai", text: data.response },
  ]);

  setLoading(false);
};

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>AI Assistant 🤖</Text>
      <Text style={styles.subtitle}>
        Ask about your budget, spending, or receipts.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Ask: How is my budget?"
        placeholderTextColor="#9CA3AF"
        value={question}
        onChangeText={setQuestion}
      />

      <TouchableOpacity style={styles.button} onPress={askAI}>
    <Text style={styles.buttonText}>
    {loading ? "Thinking..." : "Ask AI"}
    </Text>
      </TouchableOpacity>

      {messages.map((message, index) => (
        <View
          key={index}
          style={message.role === "user" ? styles.userBubble : styles.aiBubble}
        >
          <Text style={styles.messageText}>{message.text}</Text>
        </View>
      ))}

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
  input: {
    backgroundColor: "#1F2937",
    color: "white",
    padding: 18,
    borderRadius: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
  },
  backButton: {
    backgroundColor: "#374151",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  userBubble: {
    backgroundColor: "#2563EB",
    padding: 15,
    borderRadius: 14,
    marginTop: 16,
    marginLeft: 40,
  },
  aiBubble: {
    backgroundColor: "#1F2937",
    padding: 15,
    borderRadius: 14,
    marginTop: 12,
    marginRight: 40,
  },
  messageText: { color: "white", fontSize: 16 },
});