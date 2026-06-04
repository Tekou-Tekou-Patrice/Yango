import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default function Chat({ route, navigation }: { route: any, navigation: any }) {
  const { rideId, otherName } = route.params;
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const currentUser = auth().currentUser;

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('rides')
      .doc(rideId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .onSnapshot(querySnapshot => {
        if (querySnapshot) {
          const msgs = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setMessages(msgs);
        }
      });

    return () => unsubscribe();
  }, [rideId]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const textToSend = inputText;
    setInputText('');

    await firestore()
      .collection('rides')
      .doc(rideId)
      .collection('messages')
      .add({
        text: textToSend,
        senderId: currentUser?.uid,
        senderName: currentUser?.displayName || 'Chauffeur',
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
  };

  const renderItem = ({ item }: { item: any }) => {
    const isMine = item.senderId === currentUser?.uid;
    return (
      <View style={[styles.messageBubble, isMine ? styles.myBubble : styles.otherBubble]}>
        <Text style={[styles.messageText, isMine ? styles.myText : styles.otherText]}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A202C" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{otherName || 'Client'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        inverted
        contentContainerStyle={styles.listContent}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Écrivez un message..."
            placeholderTextColor="#718096"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Text style={styles.sendText}>➔</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#1A202C',
    elevation: 2
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 24, fontWeight: 'bold', color: '#F6E05E' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  listContent: { padding: 20 },
  messageBubble: {
    padding: 12,
    borderRadius: 15,
    marginVertical: 5,
    maxWidth: '80%',
  },
  myBubble: {
    backgroundColor: '#2D3748',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2,
  },
  otherBubble: {
    backgroundColor: '#FFF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2,
    elevation: 1
  },
  messageText: { fontSize: 16 },
  myText: { color: '#FFF' },
  otherText: { color: '#2D3748' },
  inputArea: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#FFF',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0'
  },
  input: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    color: '#2D3748'
  },
  sendBtn: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10
  },
  sendText: { color: '#F6E05E', fontSize: 20, fontWeight: 'bold' }
});