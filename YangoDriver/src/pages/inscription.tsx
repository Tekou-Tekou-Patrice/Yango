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
  StatusBar,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export default function Inscription({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [carModel, setCarModel] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !name || !phone || !carModel) {
      Alert.alert("Champs vides", "Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    try {
      // 1. Création de l'utilisateur dans Firebase Auth
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);

      // 2. Enregistrement des données du profil dans Firestore
      await firestore().collection('drivers').doc(userCredential.user.uid).set({
        name,
        email,
        phone,
        carModel,
        status: 'offline',
        rating: 5.0,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert("Succès", "Votre profil partenaire a été créé !");
      // La navigation sera gérée par l'état onAuthStateChanged dans App.tsx
    } catch (error: any) {
      Alert.alert("Erreur", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.logo}>Yango<Text style={{color: '#F6E05E'}}>Driver</Text></Text>
            <Text style={styles.subtitle}>Créez votre profil partenaire</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.title}>Inscription</Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Nom complet</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Jean Dupont"
                placeholderTextColor="#A0AEC0"
                onChangeText={setName}
                value={name}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email professionnel</Text>
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
              <Text style={styles.label}>Téléphone</Text>
              <TextInput
                style={styles.input}
                placeholder="+237 ..."
                placeholderTextColor="#A0AEC0"
                onChangeText={setPhone}
                value={phone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Véhicule (Modèle)</Text>
              <TextInput
                style={styles.input}
                placeholder="Toyota Corolla ..."
                placeholderTextColor="#A0AEC0"
                onChangeText={setCarModel}
                value={carModel}
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

            <TouchableOpacity
              style={styles.btnRegister}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#F6E05E" />
              ) : (
                <Text style={styles.txtRegisterBtn}>Devenir Partenaire</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnLogin}
              onPress={() => navigation.navigate('Connexion')}
            >
              <Text style={styles.txtLogin}>
                Déjà inscrit ? <Text style={styles.highlight}>Se connecter</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { paddingHorizontal: 30, paddingVertical: 40 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 42, fontWeight: '900', color: '#000', letterSpacing: -1 },
  subtitle: { color: '#718096', fontSize: 16, marginTop: 5 },
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
    color: '#000'
  },
  btnRegister: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 15
  },
  txtRegisterBtn: { color: '#F6E05E', fontWeight: 'bold', fontSize: 18 },
  btnLogin: { marginTop: 25, alignItems: 'center' },
  txtLogin: { color: '#718096', fontSize: 14 },
  highlight: { color: '#B7791F', fontWeight: 'bold' }
});