import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native';

export default function DevenirChauffeur() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Rejoignez YangoCare</Text>
      <Text style={styles.text}>Pour devenir partenaire, préparez :</Text>
      <Text>• CNI valide</Text>
      <Text>• Permis de conduire</Text>
      <Text>• Carte grise du véhicule</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => Linking.openURL('https://yango.com/fr_cm/driver/')}
      >
        <Text style={styles.btnText}>S'inscrire sur YangoDriver</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  text: { fontSize: 16, marginBottom: 10 },
  button: { marginTop: 30, backgroundColor: '#FFD700', padding: 20, borderRadius: 10 },
  btnText: { textAlign: 'center', fontWeight: 'bold', fontSize: 16 }
});