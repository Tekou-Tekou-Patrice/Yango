import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from './supabaseClient'; // Ajuste le chemin selon ton projet

export default function ConnexionPage({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs !");
      return;
    }

    setLoading(true);

    // VÉRITABLE CONNEXION VIA SUPABASE AUTH
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    setLoading(false);

    if (error) {
      // Traduction simple des erreurs courantes pour l'utilisateur
      let errorMessage = error.message;
      if (error.message === 'Invalid login credentials') {
        errorMessage = "Email ou mot de passe incorrect.";
      }
      Alert.alert("Échec de la connexion", errorMessage);
      return;
    }

    // Si la connexion réussit, Supabase stocke la session et on redirige
    if (data.user) {
      navigation.navigate('Accueil');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>YangoCare</Text>
      <Text style={styles.welcomeText}>Veuillez vous connecter</Text>

      <View style={styles.form}>
        <TextInput 
          style={styles.input} 
          placeholder="Adresse Email" 
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
          editable={!loading}
        />

        <TextInput 
          style={styles.input} 
          placeholder="Mot de passe" 
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>SE CONNECTER</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('Inscription')} 
          style={styles.linkContainer}
          disabled={loading}
        >
          <Text style={styles.linkText}>Nouveau ici ? Créer un compte</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20, 
    backgroundColor: '#f9f9f9' 
  },
  logo: { 
    fontSize: 36, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    color: '#FF3B30', // Harmonisé avec le rouge VTC de la page d'accueil
    marginBottom: 5 
  },
  welcomeText: { 
    fontSize: 16, 
    textAlign: 'center', 
    color: '#666', 
    marginBottom: 40 
  },
  form: { 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 10, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 5, 
    elevation: 3 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    padding: 12, 
    marginBottom: 15, 
    borderRadius: 8, 
    fontSize: 16, 
    backgroundColor: '#fafafa' 
  },
  button: { 
    backgroundColor: '#FF3B30', // Harmonisé en rouge
    padding: 15, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginTop: 10 
  },
  buttonDisabled: {
    backgroundColor: '#cca3a1',
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  linkContainer: { 
    marginTop: 20, 
    alignItems: 'center' 
  },
  linkText: { 
    color: '#FF3B30', // Harmonisé en rouge
    fontSize: 14, 
    fontWeight: '600' 
  }
});