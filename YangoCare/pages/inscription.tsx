import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { supabase } from './supabaseClient'; // Ajuste le chemin selon ton projet

export default function InscriptionPage({ navigation }: { navigation: any }) {
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInscription = async () => {
    if (!nom || !telephone || !email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs !");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);

    // 1. Création de l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
    });

    if (authError) {
      Alert.alert("Erreur d'inscription", authError.message);
      setLoading(false);
      return;
    }

    // 2. Si l'utilisateur est créé, on enregistre ses données complémentaires dans la table publique 'profiles'
    if (authData?.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id, // On lie le profil à l'ID unique de l'authentification
            full_name: nom.trim(),
            // Tu peux ajouter une colonne 'phone' dans ta table profiles si besoin,
            // ou stocker les métadonnées directement.
            role: 'driver', // Défini par défaut comme chauffeur ici
            updated_at: new Date(),
          },
        ]);

      if (profileError) {
        Alert.alert("Erreur de profil", "Le compte a été créé mais le profil n'a pas pu être initialisé : " + profileError.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);

    Alert.alert(
      "Succès", 
      "Compte chauffeur créé avec succès ! Vous pouvez maintenant vous connecter.",
      [{ text: "OK", onPress: () => navigation.navigate('Connexion') }]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Créer un Compte</Text>
      <Text style={styles.subtitle}>Devenez chauffeur YangoDriver</Text>

      <View style={styles.form}>
        <TextInput 
          style={styles.input} 
          placeholder="Nom complet" 
          value={nom} 
          onChangeText={setNom} 
          editable={!loading}
        />
        
        <TextInput 
          style={styles.input} 
          placeholder="Téléphone" 
          keyboardType="phone-pad" 
          value={telephone} 
          onChangeText={setTelephone} 
          editable={!loading}
        />
        
        <TextInput 
          style={styles.input} 
          placeholder="Email" 
          keyboardType="email-address" 
          autoCapitalize="none" 
          autoCorrect={false}
          value={email} 
          onChangeText={setEmail} 
          editable={!loading}
        />
        
        <TextInput 
          style={styles.input} 
          placeholder="Mot de passe (6 caractères min.)" 
          secureTextEntry 
          value={password} 
          onChangeText={setPassword} 
          editable={!loading}
        />

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleInscription}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>S'INSCRIRE</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('Connexion')} 
          style={styles.linkContainer}
          disabled={loading}
        >
          <Text style={styles.linkText}>Déjà inscrit ? Se connecter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f9f9f9' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#FF3B30', marginBottom: 5 },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#666', marginBottom: 30 },
  form: { backgroundColor: '#fff', padding: 20, borderRadius: 10, elevation: 3 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, marginBottom: 15, borderRadius: 8, backgroundColor: '#fafafa', fontSize: 16 },
  button: { backgroundColor: '#FF3B30', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonDisabled: { backgroundColor: '#cca3a1' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  linkContainer: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#FF3B30', fontSize: 14, fontWeight: '600' }
});