import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';

export default function InscriptionPage({ navigation }: { navigation: any }) {
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleInscription = () => {
    if (!nom || !telephone || !email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs !");
      return;
    }
    Alert.alert(
      "Succès", 
      "Compte chauffeur créé !",
      [{ text: "OK", onPress: () => navigation.navigate('Connexion') }]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Créer un Compte</Text>
      <Text style={styles.subtitle}>Devenez chauffeur YangoDriver</Text>

      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Nom complet" value={nom} onChangeText={setNom} />
        <TextInput style={styles.input} placeholder="Téléphone" keyboardType="phone-pad" value={telephone} onChangeText={setTelephone} />
        <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Mot de passe" secureTextEntry value={password} onChangeText={setPassword} />

        <TouchableOpacity style={styles.button} onPress={handleInscription}>
          <Text style={styles.buttonText}>S'INSCRIRE</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Connexion')} style={styles.linkContainer}>
          <Text style={styles.linkText}>Déjà inscrit ? Se connecter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f9f9f9' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#0052cc', marginBottom: 5 },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#666', marginBottom: 30 },
  form: { backgroundColor: '#fff', padding: 20, borderRadius: 10, elevation: 3 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, marginBottom: 15, borderRadius: 8, backgroundColor: '#fafafa' },
  button: { backgroundColor: '#0052cc', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  linkContainer: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#0052cc', fontSize: 14, fontWeight: '600' }
});