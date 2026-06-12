import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, SafeAreaView, KeyboardAvoidingView, Platform, StatusBar, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';

export default function Connexion({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Champs obligatoires");
      return;
    }
    setLoading(true);
    try {
      await auth().signInWithEmailAndPassword(email.trim(), password);
    } catch (error: any) {
      Alert.alert("Erreur", "Email ou mot de passe incorrect");
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
          <Text style={styles.subtitle}>Espace Partenaire</Text>
        </View>
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#718096" onChangeText={setEmail} value={email} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Mot de passe" placeholderTextColor="#718096" secureTextEntry onChangeText={setPassword} value={password} />
          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.btnT}>SE CONNECTER</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Inscription')}>
            <Text style={styles.link}>Nouveau ? <Text style={{color: '#F6E05E'}}>S'inscrire</Text></Text>
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
  subtitle: { color: '#A0AEC0', fontSize: 16 },
  form: { width: '100%' },
  input: { backgroundColor: '#2D3748', borderRadius: 12, padding: 18, fontSize: 16, color: '#FFF', marginBottom: 15 },
  btn: { backgroundColor: '#F6E05E', borderRadius: 12, padding: 20, alignItems: 'center', marginTop: 10 },
  btnT: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  link: { color: '#A0AEC0', textAlign: 'center', marginTop: 25 }
});