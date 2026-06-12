import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Image, Switch } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export default function Dashboard({ navigation }: { navigation: any }) {
  const user = auth().currentUser;
  const [isOnline, setIsOnline] = useState(false);
  const [stats, setStats] = useState({ earnings: 0, count: 0 });

  useEffect(() => {
    if (!user) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const unsubscribe = firestore()
      .collection('rides')
      .where('driverId', '==', user.uid)
      .where('status', '==', 'completed')
      .onSnapshot(snap => {
        let total = 0;
        let count = 0;
        snap?.forEach(doc => {
          const d = doc.data();
          if (d.completedAt?.toDate() >= today) {
            total += d.price || 0;
            count++;
          }
        });
        setStats({ earnings: total, count });
      });

    return () => unsubscribe();
  }, [user]);

  const toggleStatus = async (val: boolean) => {
    setIsOnline(val);
    await firestore().collection('drivers').doc(user?.uid).set({
      status: val ? 'online' : 'offline',
      lastSeen: firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A202C" />
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Partenaire</Text>
          <Text style={styles.name}>{user?.displayName || user?.email?.split('@')[0]}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image source={{ uri: `https://ui-avatars.com/api/?name=${user?.email}&background=F6E05E&color=000` }} style={styles.avatar} />
        </TouchableOpacity>
      </View>

      <View style={styles.statusBox}>
        <View style={[styles.statusCard, isOnline ? styles.online : styles.offline]}>
          <Text style={styles.statusText}>{isOnline ? "VOUS ÊTES EN LIGNE" : "VOUS ÊTES HORS LIGNE"}</Text>
          <Switch
            value={isOnline}
            onValueChange={toggleStatus}
            trackColor={{ false: "#4A5568", true: "#48BB78" }}
            thumbColor="#FFF"
          />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLab}>GAINS JOUR</Text>
            <Text style={styles.statVal}>{stats.earnings} F</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLab}>COURSES</Text>
            <Text style={styles.statVal}>{stats.count}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.mainBtn, !isOnline && styles.disabled]}
          onPress={() => navigation.navigate('Accueil')}
          disabled={!isOnline}
        >
          <Text style={styles.btnIcon}>🗺️</Text>
          <Text style={styles.btnTitle}>Accéder à la carte</Text>
          <Text style={styles.btnSub}>Voir les demandes à proximité</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A202C' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25 },
  greeting: { fontSize: 14, color: '#A0AEC0' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#FFF' },
  avatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#F6E05E' },
  statusBox: { paddingHorizontal: 20, marginBottom: 20 },
  statusCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderRadius: 20 },
  online: { backgroundColor: '#2D3748' },
  offline: { backgroundColor: '#111827' },
  statusText: { color: '#FFF', fontWeight: 'bold' },
  content: { flex: 1, padding: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statBox: { width: '48%', backgroundColor: '#2D3748', padding: 20, borderRadius: 20, alignItems: 'center' },
  statLab: { color: '#A0AEC0', fontSize: 10, fontWeight: 'bold' },
  statVal: { color: '#F6E05E', fontSize: 20, fontWeight: 'bold', marginTop: 5 },
  mainBtn: { backgroundColor: '#F6E05E', borderRadius: 25, padding: 30, alignItems: 'center', elevation: 5 },
  disabled: { backgroundColor: '#4A5568', opacity: 0.6 },
  btnIcon: { fontSize: 35, marginBottom: 10 },
  btnTitle: { color: '#000', fontSize: 18, fontWeight: 'bold' },
  btnSub: { color: '#000', opacity: 0.7, fontSize: 12 }
});