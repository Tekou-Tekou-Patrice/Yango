import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import auth from '@react-native-firebase/auth';

export default function Connexion({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Champs vides", "Veuillez remplir tous les champs.");
      return;
    }
    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (error: any) {
      Alert.alert("Erreur", "Email ou mot de passe incorrect");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>Yango<Text style={{color: '#E53E3E'}}>Care</Text></Text>
          <Text style={styles.subtitle}>Votre santé, notre priorité</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Connexion</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="votre@email.com"
              placeholderTextColor="#A0AEC0"
              onChangeText={setEmail}
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#A0AEC0"
              secureTextEntry
              onChangeText={setPassword}
              value={password}
            />
          </View>

          <TouchableOpacity style={styles.btnLogin} onPress={handleLogin}>
            <Text style={styles.txtLogin}>Se connecter</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnRegister}
            onPress={() => navigation.navigate('Inscription')}
          >
            <Text style={styles.txtRegister}>
              Pas encore de compte ? <Text style={styles.highlight}>S'inscrire</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { flex: 1, paddingHorizontal: 30, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 50 },
  logo: { fontSize: 42, fontWeight: '900', color: '#000', letterSpacing: -1 },
  subtitle: { color: '#718096', fontSize: 16, marginTop: 5 },
  form: { width: '100%' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, color: '#2D3748' },
  inputWrapper: { marginBottom: 20 },
  label: { color: '#4A5568', marginBottom: 8, fontWeight: '600' },
  input: {
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#2D3748'
  },
  btnLogin: {
    backgroundColor: '#E53E3E',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    elevation: 4,
    shadowColor: '#E53E3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  txtLogin: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  btnRegister: { marginTop: 25, alignItems: 'center' },
  txtRegister: { color: '#718096', fontSize: 14 },
  highlight: { color: '#E53E3E', fontWeight: 'bold' }
});