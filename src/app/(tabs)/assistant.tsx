import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Chip, styles as ui } from '@/components/ui';
import { Colors, MaxContentWidth, Radius, Spacing, WebTabBarInset } from '@/constants/theme';
import { api } from '@/lib/api';

type Message = { id: number; role: 'user' | 'ai' | 'error'; text: string };

const SUGGESTIONS = [
  'How is my budget this month?',
  'Where am I spending the most?',
  'How can I save $100 this month?',
];

export default function AssistantScreen() {
  const insets = useSafeAreaInsets();
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const nextId = useRef(0);

  const add = (role: Message['role'], text: string) =>
    setMessages((prev) => [...prev, { id: nextId.current++, role, text }]);

  const ask = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    setQuestion('');
    add('user', q);
    setLoading(true);
    try {
      const res = await api.askAssistant(q);
      add('ai', res.response);
    } catch (err) {
      add('error', err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + WebTabBarInset + Spacing.xl }]}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        keyboardShouldPersistTaps="handled">
        <View style={ui.inner}>
          <Text style={ui.title}>AI Assistant 🤖</Text>
          <Text style={[ui.subtitle, { marginBottom: Spacing.xl }]}>
            Ask about your budget and spending this month.
          </Text>

          {messages.length === 0 ? (
            <View style={styles.suggestions}>
              {SUGGESTIONS.map((s) => (
                <Chip key={s} label={s} onPress={() => ask(s)} />
              ))}
            </View>
          ) : null}

          {messages.map((m) => (
            <View
              key={m.id}
              style={[styles.bubble, m.role === 'user' ? styles.user : m.role === 'ai' ? styles.ai : styles.error]}>
              <Text style={styles.bubbleText} selectable>
                {m.text}
              </Text>
            </View>
          ))}
          {loading ? (
            <View style={[styles.bubble, styles.ai]}>
              <Text style={[styles.bubbleText, { color: Colors.textSecondary }]}>Thinking…</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.composer}>
        <View style={[ui.inner, styles.composerInner]}>
          <TextInput
            style={[ui.input, { flex: 1 }]}
            placeholder="Ask: How is my budget?"
            placeholderTextColor={Colors.textMuted}
            value={question}
            onChangeText={setQuestion}
            onSubmitEditing={() => ask(question)}
            returnKeyType="send"
            editable={!loading}
            accessibilityLabel="Question for the assistant"
          />
          <Button label="Ask" onPress={() => ask(question)} loading={loading} disabled={!question.trim()} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl, alignItems: 'center' },
  suggestions: { gap: Spacing.sm, alignItems: 'flex-start' },
  bubble: { padding: Spacing.lg, borderRadius: Radius.md, marginTop: Spacing.md, maxWidth: '85%' },
  user: { backgroundColor: Colors.primary, alignSelf: 'flex-end' },
  ai: { backgroundColor: Colors.surface, alignSelf: 'flex-start' },
  error: { backgroundColor: '#7F1D1D', alignSelf: 'flex-start' },
  bubbleText: { color: Colors.text, fontSize: 16, lineHeight: 22 },
  composer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    padding: Spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  composerInner: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', maxWidth: MaxContentWidth },
});
