import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  Linking
} from 'react-native';

// Configuration GROQ
const GROQ_API_KEY = 'MON_API_GROQ';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL_NAME = 'llama-3.3-70b-versatile';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

export default function IASecour({ navigation }: { navigation: any }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Bonjour ! Je suis l'assistant d'urgence YangoCare. Décrivez-moi la situation pour obtenir immédiatement les gestes de premiers secours.",
      sender: 'ai'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const systemPrompt = `Tu es un assistant virtuel expert en premiers secours pour l'application YangoCare. Ton rôle est d'analyser la situation décrite par l'utilisateur pour donner les gestes de premiers secours de premier niveau.
  1. Si la situation montre une urgence critique (inconscience, hémorragie sévère, étouffement, arrêt cardiaque), commence TOUJOURS par : "⚠️ EN CAS D'URGENCE VITALE, CONTACTEZ IMMEDIATEMENT LES SECOURS (119 au Cameroun) !".
  2. Donne les instructions de secours étape par étape sous forme de liste à puces claire.
  3. Utilise un ton calme, direct et rassurant. Pas de jargon médical complexe.
  Réponds en français de manière concise.`;

  const makeEmergencyCall = () => {
    Linking.openURL('tel:119');
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    setMessages(prev => [...prev, { id: Date.now().toString(), text: textToSend, sender: 'user' }]);
    setInputText('');
    setIsLoading(true);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    const requestBody = {
      model: MODEL_NAME,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: textToSend }
      ],
      temperature: 0.2,
      max_tokens: 800
    };

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error.message);

      const aiResponseText = data?.choices?.[0]?.message?.content;
      if (!aiResponseText) throw new Error("Réponse vide");

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: aiResponseText.trim(), sender: 'ai' }]);
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: 'err',
        text: "⚠️ Problème de connexion. En cas d'urgence réelle, appelez directement les secours.",
        sender: 'ai'
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#E53E3E" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        {/* Header Moderne avec bouton Retour et SOS */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>

            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Assistant Secours</Text>
              <Text style={styles.headerSubtitle}>YangoCare Assistance IA</Text>
            </View>

            <TouchableOpacity
              style={styles.sosButton}
              onPress={makeEmergencyCall}
            >
              <Text style={styles.sosText}>SOS</Text>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={[
              styles.messageBubble,
              item.sender === 'user' ? styles.userBubble : styles.aiBubble
            ]}>
              <Text style={[
                styles.messageText,
                item.sender === 'user' ? styles.userText : styles.aiText
              ]}>
                {item.text}
              </Text>
            </View>
          )}
          contentContainerStyle={styles.chatContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#E53E3E" size="small" />
            <Text style={styles.loadingText}>L'IA analyse la situation...</Text>
          </View>
        )}

        <View style={styles.inputArea}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Décrivez l'urgence ici..."
              placeholderTextColor="#A0AEC0"
              value={inputText}
              onChangeText={setInputText}
              multiline
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendDisabled]}
              onPress={() => handleSend(inputText)}
              disabled={isLoading || !inputText.trim()}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.sendIcon}>➔</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#E53E3E' },
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  header: {
    backgroundColor: '#E53E3E',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: Platform.OS === 'android' ? 10 : 0,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  headerTextContainer: { flex: 1, alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  headerSubtitle: { color: '#FED7D7', fontSize: 11, opacity: 0.9 },
  sosButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  sosText: { color: '#E53E3E', fontWeight: 'bold', fontSize: 14 },
  chatContainer: { padding: 20, paddingBottom: 20 },
  messageBubble: {
    padding: 15,
    borderRadius: 20,
    marginVertical: 8,
    maxWidth: '85%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  userBubble: {
    backgroundColor: '#E53E3E',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#FFF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  messageText: { fontSize: 16, lineHeight: 22 },
  userText: { color: '#FFF' },
  aiText: { color: '#2D3748' },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', paddingLeft: 25, marginBottom: 10 },
  loadingText: { marginLeft: 10, color: '#718096', fontSize: 14, fontStyle: 'italic' },
  inputArea: {
    padding: 15,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0'
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 5,
    alignItems: 'center'
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
    maxHeight: 100,
    paddingVertical: 10
  },
  sendButton: {
    backgroundColor: '#E53E3E',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10
  },
  sendDisabled: { backgroundColor: '#CBD5E0' },
  sendIcon: { color: '#FFF', fontSize: 20, fontWeight: 'bold' }
});