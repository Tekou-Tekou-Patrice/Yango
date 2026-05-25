import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function AccueilPage({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue sur YangoCare</Text>
      <Text style={styles.subtitle}>Vous êtes connecté avec succès.</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Connexion')}>
        <Text style={styles.buttonText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0052cc',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#0052cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
