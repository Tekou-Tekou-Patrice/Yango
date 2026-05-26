import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';

// Configuration GROQ - Version Texte Stable & Validée
const GROQ_API_KEY = 'CLE_A_METTRE_EN_LOCAL';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL_NAME = 'llama-3.3-70b-versatile'; // Ton modèle de production validé

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

export default function IASecour() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Bonjour ! Je suis l'assistant d'urgence YangoCare. Décrivez-moi la situation (brûlure, blessure, étouffement, etc.) pour obtenir immédiatement les gestes de premiers secours.",
      sender: 'ai'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const systemPrompt = `Tu es un assistant virtuel expert en premiers secours pour l'application YangoCare. Ton rôle est d'analyser la situation décrite par l'utilisateur pour donner les gestes de premiers secours de premier niveau.
  1. Si la situation montre une urgence critique (inconscience, hémorragie sévère, étouffement, arrêt cardiaque), commence TOUJOURS par : "⚠️ EN CAS D'URGENCE VITALE, CONTACTEZ IMMEDIATEMENT LES SECOURS (112 / 15 ou le 119 au Cameroun) !".
  2. Donne les instructions de secours étape par étape sous forme de liste à puces claire.
  3. Utilise un ton calme, direct et rassurant. Pas de jargon médical complexe.
  Réponds en français de manière concise.`;

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

      if (data.error) {
        throw new Error(data.error.message);
      }

      const aiResponseText = data?.choices?.[0]?.message?.content;
      if (!aiResponseText) throw new Error("Réponse vide du serveur.");

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: aiResponseText.trim(), sender: 'ai' }]);

    } catch (error: any) {
      console.error("Erreur Groq: ", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: `⚠️ Erreur Technique Assistant : ${error.message || error.toString()}`,
        sender: 'ai'
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚨 Guide de Premiers Secours IA</Text>
        <Text style={styles.headerSubtitle}>YangoCare Assistance</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
            <Text style={[styles.messageText, item.sender === 'user' ? styles.userText : styles.aiText]}>
              {item.text}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.chatContainer}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Décrivez la situation d'urgence..."
          placeholderTextColor="#718096"
          value={inputText}
          onChangeText={setInputText}
          multiline
          editable={!isLoading}
        />

        <TouchableOpacity style={styles.sendButton} onPress={() => handleSend(inputText)} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.sendButtonText}>Envoyer</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { backgroundColor: '#E53E3E', padding: 20, paddingTop: 50, alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  headerSubtitle: { color: '#FED7D7', fontSize: 13, marginTop: 2 },
  chatContainer: { padding: 15 },
  messageBubble: { padding: 14, borderRadius: 18, marginVertical: 6, maxWidth: '85%' },
  userBubble: { backgroundColor: '#E53E3E', alignSelf: 'flex-end', borderBottomRightRadius: 0 },
  aiBubble: { backgroundColor: '#FFF', alignSelf: 'flex-start', borderBottomLeftRadius: 0, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  messageText: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#FFF' },
  aiText: { color: '#2D3748' },
  inputContainer: { flexDirection: 'row', padding: 12, backgroundColor: '#FFF', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  input: { flex: 1, backgroundColor: '#EDF2F7', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100, color: '#2D3748', marginRight: 8 },
  sendButton: { backgroundColor: '#E53E3E', borderRadius: 24, paddingVertical: 12, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center', minWidth: 70 },
  sendButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 }
});