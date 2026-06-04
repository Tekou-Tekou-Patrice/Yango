import React, { useState } from 'react';
import {
  View, TextInput, TouchableOpacity, Text, StyleSheet, Alert,
  SafeAreaView, KeyboardAvoidingView, Platform, StatusBar, ActivityIndicator
} from 'react-native';
import auth from '@react-native-firebase/auth';

export default function Connexion({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Champs vides", "Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    try {
      await auth().signInWithEmailAndPassword(email, password);
      // La redirection sera gérée automatiquement par ton App.tsx
    } catch (error: any) {
      Alert.alert("Erreur", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>

        <View style={styles.header}>
          <Text style={styles.logo}>Yango<Text style={{color: '#F6E05E'}}>Driver</Text></Text>
          <Text style={styles.subtitle}>Espace Professionnel Chauffeur</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email professionnel</Text>
            <TextInput
              style={styles.input}
              placeholder="votre@email.com"
              placeholderTextColor="#718096"
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
              placeholderTextColor="#718096"
              secureTextEntry
              onChangeText={setPassword}
              value={password}
            />
          </View>

          <TouchableOpacity style={styles.btnMain} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.btnText}>SE CONNECTER</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkRegister} onPress={() => navigation.navigate('Inscription')}>
            <Text style={styles.linkText}>Pas encore de compte ? <Text style={styles.highlight}>S'inscrire</Text></Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A202C' },
  content: { flex: 1, paddingHorizontal: 30, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 50 },
  logo: { fontSize: 42, fontWeight: '900', color: '#FFF' },
  subtitle: { color: '#A0AEC0', fontSize: 16, marginTop: 5 },
  form: { width: '100%' },
  inputWrapper: { marginBottom: 20 },
  label: { color: '#CBD5E0', marginBottom: 8, fontWeight: '600' },
  input: { backgroundColor: '#2D3748', borderRadius: 12, padding: 18, fontSize: 16, color: '#FFF' },
  btnMain: { backgroundColor: '#F6E05E', borderRadius: 12, padding: 20, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  linkRegister: { marginTop: 25, alignItems: 'center' },
  linkText: { color: '#A0AEC0', fontSize: 14 },
  highlight: { color: '#F6E05E', fontWeight: 'bold' }
});