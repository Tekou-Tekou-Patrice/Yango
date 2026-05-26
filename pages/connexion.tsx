import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export default function ConnexionPage({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs !");
      return;
    }

    // Simulation de connexion -> Redirige vers l'accueil de l'application
    // (Note : Pour YangoDriver, remplace 'Accueil' par 'TableauBord' dans le dossier du projet chauffeur)
    navigation.navigate('Accueil');
  };

  return (
    <View style={styles.container}>
      {/* Changez "YangoCare" par "YangoDriver" dans l'application chauffeur */}
      <Text style={styles.logo}>YangoCare</Text>
      <Text style={styles.welcomeText}>Veuillez vous connecter</Text>

      <View style={styles.form}>
        <TextInput 
          style={styles.input} 
          placeholder="Adresse Email" 
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput 
          style={styles.input} 
          placeholder="Mot de passe" 
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>SE CONNECTER</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Inscription')} style={styles.linkContainer}>
          <Text style={styles.linkText}>Nouveau ici ? Créer un compte</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f9f9f9' },
  logo: { fontSize: 36, fontWeight: 'bold', textAlign: 'center', color: '#0052cc', marginBottom: 5 },
  welcomeText: { fontSize: 16, textAlign: 'center', color: '#666', marginBottom: 40 },
  form: { backgroundColor: '#fff', padding: 20, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, marginBottom: 15, borderRadius: 8, fontSize: 16, backgroundColor: '#fafafa' },
  button: { backgroundColor: '#0052cc', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  linkContainer: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#0052cc', fontSize: 14, fontWeight: '600' }
});