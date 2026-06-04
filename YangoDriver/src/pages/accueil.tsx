import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Switch, Alert,
  StatusBar, SafeAreaView, Platform, FlatList, Dimensions, ActivityIndicator
} from 'react-native';
import { WebView } from 'react-native-webview';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const { width } = Dimensions.get('window');

export default function AccueilChauffeur({ navigation }: { navigation: any }) {
  const [isOnline, setIsOnline] = useState(false);
  const [availableRides, setAvailableRides] = useState<any[]>([]);
  const [activeRide, setActiveRide] = useState<any>(null);
  const [dailyCount, setDailyCount] = useState(0);
  const [eta, setEta] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);

  const [driverPos, setDriverPos] = useState({ lat: 3.8480, lon: 11.5021 });
  const [isSimulating, setIsSimulating] = useState(false);

  // Clé Google Maps corrigée (AIza au lieu de Alza)
  //const GOOGLE_MAPS_KEY = "AIzaSyDb4Jf8MzMQ5coBzQM3gvcvYJq6WSvY8Sk";

  useEffect(() => {
    if (!isOnline) {
      setAvailableRides([]);
      return;
    }

    const unsubscribeRides = firestore()
      .collection('rides')
      .where('status', '==', 'pending')
      .onSnapshot(snap => {
        if (snap) {
          const rides = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setAvailableRides(rides);
        }
      });

    return () => unsubscribeRides();
  }, [isOnline]);

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const unsubscribeCount = firestore()
      .collection('rides')
      .where('driverId', '==', user.uid)
      .where('status', '==', 'completed')
      .onSnapshot(snap => {
        if (snap) {
          let count = 0;
          snap.forEach(doc => {
            const data = doc.data();
            if (data.completedAt && data.completedAt.toDate() >= today) count++;
          });
          setDailyCount(count);
        }
      });

    return () => unsubscribeCount();
  }, []);

  const acceptRide = async (ride: any) => {
    try {
      await firestore().collection('rides').doc(ride.id).update({
        status: 'accepted',
        driverId: auth().currentUser?.uid,
        driverLat: driverPos.lat,
        driverLon: driverPos.lon,
        acceptedAt: firestore.FieldValue.serverTimestamp(),
      });

      setActiveRide(ride);

      webViewRef.current?.injectJavaScript(`
        if (window.setRoute) {
          window.setRoute(${driverPos.lat}, ${driverPos.lon}, ${ride.pickupLat}, ${ride.pickupLon});
        }
      `);

      Alert.alert("Course acceptée", "Le trajet vers le client est affiché.");
    } catch (e) {
      Alert.alert("Erreur", "Course non disponible.");
    }
  };

  const completeRide = async () => {
    if (!activeRide) return;
    await firestore().collection('rides').doc(activeRide.id).update({
      status: 'completed',
      completedAt: firestore.FieldValue.serverTimestamp()
    });
    setActiveRide(null);
    setEta(null);
    webViewRef.current?.injectJavaScript(`if (window.clearRoute) window.clearRoute();`);
    Alert.alert("Terminé", "Course validée avec succès !");
  };

  const onMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'ETA') setEta(data.value);
    } catch(e) {}
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <WebView
        ref={webViewRef}
        style={styles.map}
        onMessage={onMessage}
        source={{ html: `
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
              <style>html, body { margin: 0; padding: 0; height: 100%; width: 100%; } #map { height: 100%; width: 100%; }</style>
              <script src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}"></script>
            </head>
            <body>
              <div id="map"></div>
              <script>
                var map, directionsService, directionsRenderer, driverMarker;
                function initMap() {
                  map = new google.maps.Map(document.getElementById('map'), {
                    center: { lat: ${driverPos.lat}, lng: ${driverPos.lon} },
                    zoom: 15, disableDefaultUI: true,
                    styles: [
                      { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
                      { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
                      { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] },
                      { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] }
                    ]
                  });
                  directionsService = new google.maps.DirectionsService();
                  directionsRenderer = new google.maps.DirectionsRenderer({
                    map: map,
                    suppressMarkers: false,
                    polylineOptions: { strokeColor: "#F6E05E", strokeWeight: 6 }
                  });
                  driverMarker = new google.maps.Marker({
                    position: { lat: ${driverPos.lat}, lng: ${driverPos.lon} },
                    map: map,
                    icon: 'https://cdn-icons-png.flaticon.com/32/744/744465.png'
                  });
                }
                window.setRoute = function(sLat, sLon, eLat, eLon) {
                  directionsService.route({
                    origin: {lat: sLat, lng: sLon},
                    destination: {lat: eLat, lng: eLon},
                    travelMode: 'DRIVING'
                  }, function(res, stat) {
                    if (stat === 'OK') {
                      directionsRenderer.setDirections(res);
                      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ETA', value: res.routes[0].legs[0].duration.text }));
                    }
                  });
                };
                window.clearRoute = function() { directionsRenderer.setDirections({routes: []}); };
                google.maps.event.addDomListener(window, 'load', initMap);
              </script>
            </body>
          </html>
        ` }}
      />

      <SafeAreaView style={styles.overlay}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.statusText, {color: isOnline ? '#48BB78' : '#A0AEC0'}]}>
              {isOnline ? '• EN LIGNE' : '• HORS LIGNE'}
            </Text>
            <Text style={styles.dailyText}>{dailyCount} courses aujourd'hui</Text>
          </View>
          <Switch value={isOnline} onValueChange={setIsOnline} trackColor={{ false: "#4A5568", true: "#48BB78" }} />
        </View>

        {isOnline && !activeRide && (
          <FlatList
            data={availableRides}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.rideCard}>
                <View style={styles.rideHeader}>
                  <Text style={styles.typeBadge}>{item.serviceType}</Text>
                  <Text style={styles.ridePrice}>{item.price} F</Text>
                </View>
                <Text style={styles.rideDest}>{item.destination}</Text>
                <TouchableOpacity style={styles.btnAccept} onPress={() => acceptRide(item)}>
                  <Text style={styles.btnAcceptText}>ACCEPTER LA COURSE</Text>
                </TouchableOpacity>
              </View>
            )}
            style={styles.rideList}
            ListEmptyComponent={<Text style={styles.emptyText}>En attente de clients...</Text>}
          />
        )}

        {activeRide && (
          <View style={styles.activeRideCard}>
            <View style={styles.activeRideHeader}>
              <Text style={styles.activeRideTitle}>RÉCUPÉRATION EN COURS</Text>
              {eta && <Text style={styles.etaBadge}>{eta}</Text>}
            </View>
            <Text style={styles.activeRideDest}>{activeRide.destination}</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.chatBtn} onPress={() => navigation.navigate('Chat', { rideId: activeRide.id, otherName: 'Client' })}>
                <Text style={styles.btnText}>💬 CHAT</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.doneBtn} onPress={completeRide}>
                <Text style={styles.btnText}>TERMINER</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A202C' },
  map: { flex: 1 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: 20, pointerEvents: 'box-none' },
  header: { flexDirection: 'row', backgroundColor: '#000', padding: 20, borderRadius: 20, justifyContent: 'space-between', alignItems: 'center', elevation: 10, marginTop: Platform.OS === 'android' ? 30 : 0 },
  statusText: { fontWeight: 'bold', fontSize: 16 },
  dailyText: { color: '#A0AEC0', fontSize: 12 },
  rideList: { marginTop: 20 },
  rideCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 15, marginBottom: 15, elevation: 5 },
  rideHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  typeBadge: { backgroundColor: '#F6E05E', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, fontSize: 10, fontWeight: 'bold' },
  ridePrice: { fontWeight: 'bold', color: '#1A202C' },
  rideDest: { fontSize: 16, color: '#1A202C', fontWeight: '600', marginBottom: 15 },
  btnAccept: { backgroundColor: '#000', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnAcceptText: { color: '#F6E05E', fontWeight: 'bold' },
  activeRideCard: { position: 'absolute', bottom: 30, left: 20, right: 20, backgroundColor: '#FFF', padding: 25, borderRadius: 25, elevation: 20 },
  activeRideHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  activeRideTitle: { color: '#B7791F', fontWeight: 'bold', fontSize: 12 },
  etaBadge: { backgroundColor: '#48BB78', color: '#FFF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5, fontSize: 12, fontWeight: 'bold' },
  activeRideDest: { fontSize: 18, fontWeight: 'bold', color: '#1A202C', marginBottom: 20 },
  actionRow: { flexDirection: 'row', gap: 10 },
  chatBtn: { flex: 1, backgroundColor: '#2D3748', padding: 15, borderRadius: 12, alignItems: 'center' },
  doneBtn: { flex: 1, backgroundColor: '#48BB78', padding: 15, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#FFF', marginTop: 50, fontStyle: 'italic' }
});