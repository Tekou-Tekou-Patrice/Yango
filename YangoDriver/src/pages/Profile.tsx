import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, StatusBar, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export default function Profile({ navigation }: { navigation: any }) {
  const user = auth().currentUser;
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      return firestore().collection('drivers').doc(user.uid).onSnapshot(doc => {
        if (doc.exists) setData(doc.data());
      });
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.title}>Profil Chauffeur</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.content}>
        <Image source={{ uri: 'https://ui-avatars.com/api/?name=' + (user?.email) + '&background=F6E05E&color=000' }} style={styles.avatar} />
        <View style={styles.info}>
          <Text style={styles.label}>NOM</Text>
          <Text style={styles.val}>{data?.name || 'Non défini'}</Text>
          <Text style={styles.label}>VÉHICULE</Text>
          <Text style={styles.val}>{data?.carModel || 'Non défini'}</Text>
          <Text style={styles.label}>EMAIL</Text>
          <Text style={styles.val}>{user?.email}</Text>
          <Text style={styles.label}>NOTE</Text>
          <Text style={styles.val}>⭐ {data?.rating || '5.0'}</Text>
        </View>
        <TouchableOpacity style={styles.btn} onPress={() => auth().signOut()}><Text style={styles.btnT}>Déconnexion</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A202C' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  back: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  title: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1, padding: 20, alignItems: 'center' },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: '#F6E05E' },
  info: { width: '100%', backgroundColor: '#2D3748', borderRadius: 20, padding: 20, marginTop: 30 },
  label: { color: '#A0AEC0', fontSize: 10, fontWeight: 'bold', marginBottom: 5 },
  val: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  btn: { marginTop: 40, backgroundColor: '#E53E3E', padding: 15, borderRadius: 15, width: '100%', alignItems: 'center' },
  btnT: { color: '#FFF', fontWeight: 'bold' }
});