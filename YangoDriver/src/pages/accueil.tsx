import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, StatusBar, SafeAreaView, FlatList, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const GOOGLE_KEY = "TA_CLE_API_GOOGLE_ICI"; // Remplace par ta clé valide

export default function Accueil({ navigation }: { navigation: any }) {
  const [isOnline, setIsOnline] = useState(false);
  const [rides, setRides] = useState<any[]>([]);
  const [activeRide, setActiveRide] = useState<any>(null);
  const [route, setRoute] = useState<any[]>([]);
  const [eta, setEta] = useState<string | null>(null);
  const driverPos = { latitude: 3.8480, longitude: 11.5021 };

  useEffect(() => {
    if (!isOnline) {
      setRides([]);
      return;
    }
    const subscriber = firestore()
      .collection('rides')
      .where('status', '==', 'pending')
      .onSnapshot(snap => {
        setRides(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
    return () => subscriber();
  }, [isOnline]);

  const accept = async (ride: any) => {
    try {
      await firestore().collection('rides').doc(ride.id).update({
        status: 'accepted',
        driverId: auth().currentUser?.uid,
      });
      setActiveRide(ride);
    } catch (e) { Alert.alert("Erreur", "Course déjà prise."); }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* MAPVIEW : S'assure que le container parent a bien flex: 1 */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{ ...driverPos, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
        showsUserLocation={true}
      >
        {activeRide && (
          <Marker
            coordinate={{ latitude: activeRide.pickupLat, longitude: activeRide.pickupLon }}
            title="Client"
            pinColor="blue"
          />
        )}
      </MapView>

      <SafeAreaView style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
            <Text style={styles.back}>⇍ Dashboard</Text>
          </TouchableOpacity>
          <Switch value={isOnline} onValueChange={setIsOnline} trackColor={{ true: "#48BB78" }} />
        </View>

        {isOnline && !activeRide && (
          <FlatList
            data={rides}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.dest}>{item.destination}</Text>
                <TouchableOpacity style={styles.btnA} onPress={() => accept(item)}>
                  <Text style={styles.btnT}>ACCEPTER</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A202C' },
  map: { flex: 1 }, // Important : prend tout l'espace
  overlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 20,
    paddingTop: 50,
    justifyContent: 'space-between'
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 20,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  back: { color: '#F6E05E', fontWeight: 'bold' },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 15, marginTop: 15 },
  dest: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  btnA: { backgroundColor: '#000', padding: 12, borderRadius: 10, alignItems: 'center' },
  btnT: { color: '#FFF', fontWeight: 'bold' }
});