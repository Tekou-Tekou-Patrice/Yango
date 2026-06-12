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
          <Text style={styles.greeting}>Bonjour,</Text>
          <Text style={styles.name}>{user?.displayName || user?.email?.split('@')[0]}</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Profile')}
          style={styles.avatarContainer}
        >
          <Image
            source={{ uri: `https://ui-avatars.com/api/?name=${user?.email}&background=F6E05E&color=000&bold=true` }}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.statusBox}>
        <View style={[styles.statusCard, isOnline ? styles.onlineCard : styles.offlineCard]}>
          <View>
            <Text style={styles.statusLabel}>STATUT ACTUEL</Text>
            <Text style={styles.statusText}>{isOnline ? "EN LIGNE" : "HORS LIGNE"}</Text>
          </View>
          <Switch
            value={isOnline}
            onValueChange={toggleStatus}
            trackColor={{ false: "#4A5568", true: "#F6E05E" }}
            thumbColor={isOnline ? "#000" : "#FFF"}
            ios_backgroundColor="#4A5568"
          />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Performance Aujourd'hui</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={styles.statVal}>{stats.earnings.toLocaleString()} F</Text>
            <Text style={styles.statLab}>Gains</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>🚗</Text>
            <Text style={styles.statVal}>{stats.count}</Text>
            <Text style={styles.statLab}>Courses</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.mainBtn, !isOnline && styles.disabledBtn]}
          onPress={() => navigation.navigate('Accueil')}
          disabled={!isOnline}
        >
          <View style={styles.btnContent}>
            <View style={styles.btnIconCircle}>
              <Text style={styles.btnIcon}>📍</Text>
            </View>
            <View style={styles.btnTextContainer}>
              <Text style={styles.btnTitle}>Passer en mode Navigation</Text>
              <Text style={styles.btnSub}>Rechercher des clients autour de vous</Text>
            </View>
          </View>
        </TouchableOpacity>

        {!isOnline && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Connectez-vous pour commencer à recevoir des courses.</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A202C' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 20,
  },
  greeting: { fontSize: 16, color: '#A0AEC0', marginBottom: -2 },
  name: { fontSize: 26, fontWeight: '900', color: '#FFF' },
  avatarContainer: {
    shadowColor: "#F6E05E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  avatar: { width: 55, height: 55, borderRadius: 28, borderWidth: 3, borderColor: '#F6E05E' },
  statusBox: { paddingHorizontal: 20, marginBottom: 25 },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 22,
    borderRadius: 24,
    borderWidth: 1,
  },
  onlineCard: { backgroundColor: '#2D3748', borderColor: '#F6E05E33' },
  offlineCard: { backgroundColor: '#1A202C', borderColor: '#4A5568' },
  statusLabel: { color: '#A0AEC0', fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
  statusText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 15, marginLeft: 5 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  statBox: {
    width: '48%',
    backgroundColor: '#2D3748',
    paddingVertical: 25,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  statIcon: { fontSize: 24, marginBottom: 10 },
  statLab: { color: '#A0AEC0', fontSize: 12, fontWeight: '600', marginTop: 2 },
  statVal: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  mainBtn: {
    backgroundColor: '#F6E05E',
    borderRadius: 24,
    padding: 20,
    elevation: 10,
    shadowColor: "#F6E05E",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  btnContent: { flexDirection: 'row', alignItems: 'center' },
  btnIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  btnIcon: { fontSize: 24 },
  btnTextContainer: { flex: 1 },
  disabledBtn: { backgroundColor: '#4A5568', shadowOpacity: 0, elevation: 0 },
  btnTitle: { color: '#000', fontSize: 18, fontWeight: 'bold' },
  btnSub: { color: '#000', opacity: 0.6, fontSize: 12, marginTop: 2 },
  infoBox: { marginTop: 20, padding: 15, alignItems: 'center' },
  infoText: { color: '#718096', fontSize: 13, textAlign: 'center', fontStyle: 'italic' }
});