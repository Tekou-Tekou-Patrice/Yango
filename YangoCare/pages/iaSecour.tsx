import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';

// TA VRAIE CLÉ GEMINI EXTRAITE DE TA CAPTURE D'ÉCRAN
const GEMINI_API_KEY = 'AIzaSyAhqX1vTu5AmWT6dNagh8WFmqnZnArLXEY';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

export default function IASecours() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Bonjour ! Je suis l'assistant d'urgence YangoCare. Décrivez-moi la situation (ex: brûlure, étouffement, malaise) pour obtenir les gestes de premiers secours.",
      sender: 'ai'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const systemPrompt = `Tu es un assistant virtuel expert en premiers secours pour l'application YangoCare. Ton rôle est d'aider l'utilisateur face à une situation d'urgence ou une question de santé de premier niveau.
  1. Si la situation semble critique, commence TOUJOURS par : "⚠️ EN CAS D'URGENCE VITALE, CONTACTEZ IMMEDIATEMENT LES SECOURS (112 / 15 ou le 119 au Cameroun) !".
  2. Donne des instructions claires, étape par étape, sous forme de liste à puces.
  3. Utilise un ton calme et direct.
  Réponds en français de manière concise.`;

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    const userMsg: Message = { id: Date.now().toString(), text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    const requestBody = {
      contents: [{
        parts: [{ text: `${systemPrompt}\n\nUtilisateur: ${userMsg.text}` }]
      }]
    };

    try {
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      const aiResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Je n'ai pas pu analyser la situation.";

      const aiMsg: Message = { id: (Date.now() + 1).toString(), text: aiResponseText.trim(), sender: 'ai' };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.log("Erreur Gemini: ", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "L'assistant Gemini bloque la connexion depuis l'application mobile. Pour votre sécurité, contactez le 112 ou le 15.",
        sender: 'ai'
      };
      setMessages(prev => [...prev, errorMsg]);
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
            <Text style={[styles.messageText, item.sender === 'user' ? styles.userText : styles.aiText]}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={styles.chatContainer}
      />
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Ex: Que faire face à une brûlure ?" placeholderTextColor="#718096" value={inputText} onChangeText={setInputText} multiline editable={!isLoading} />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={isLoading}>
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
  input: { flex: 1, backgroundColor: '#EDF2F7', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100, color: '#2D3748' },
  sendButton: { marginLeft: 10, backgroundColor: '#E53E3E', borderRadius: 24, paddingVertical: 12, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center', minWidth: 80 },
  sendButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 }
});