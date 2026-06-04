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

export default function Inscription({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert("Champs vides", "Veuillez remplir tous les champs.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
      return;
    }
    try {
      await auth().createUserWithEmailAndPassword(email, password);
    } catch (error: any) {
      Alert.alert("Erreur", error.message);
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
          <Text style={styles.subtitle}>Créez votre compte en quelques secondes</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Inscription</Text>

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

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Confirmer le mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#A0AEC0"
              secureTextEntry
              onChangeText={setConfirmPassword}
              value={confirmPassword}
            />
          </View>

          <TouchableOpacity style={styles.btnRegister} onPress={handleRegister}>
            <Text style={styles.txtRegisterBtn}>S'inscrire</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnLogin}
            onPress={() => navigation.navigate('Connexion')}
          >
            <Text style={styles.txtLogin}>
              Déjà un compte ? <Text style={styles.highlight}>Se connecter</Text>
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
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 42, fontWeight: '900', color: '#000', letterSpacing: -1 },
  subtitle: { color: '#718096', fontSize: 16, marginTop: 5, textAlign: 'center' },
  form: { width: '100%' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 25, color: '#2D3748' },
  inputWrapper: { marginBottom: 15 },
  label: { color: '#4A5568', marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#2D3748'
  },
  btnRegister: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  txtRegisterBtn: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  btnLogin: { marginTop: 25, alignItems: 'center' },
  txtLogin: { color: '#718096', fontSize: 14 },
  highlight: { color: '#E53E3E', fontWeight: 'bold' }
});