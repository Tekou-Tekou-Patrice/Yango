import React, { useState, useEffect, useRef } from 'react';
import {
  View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, Modal,
  StatusBar, SafeAreaView, Platform, Dimensions, ActivityIndicator
} from 'react-native';
import { WebView } from 'react-native-webview';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { fetchCoordinates } from '../src/GeocodingService';

const { width } = Dimensions.get('window');

export default function AccueilPage({ navigation }: { navigation: any }) {
  const [destination, setDestination] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSOSVisible, setIsSOSVisible] = useState(false);
  const [serviceType, setServiceType] = useState('Classique');
  const [activeRide, setActiveRide] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [eta, setEta] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);

  // Clé Google Maps
  const GOOGLE_MAPS_KEY = "AIzaSyDb4Jf8MzMQ5coBzQM3gvcvYJq6WSvY8Sk";
  const userLocation = { lat: 3.8480, lon: 11.5021 };

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) return;

    const subscriber = firestore()
      .collection('rides')
      .where('passengerId', '==', user.uid)
      .where('status', 'in', ['pending', 'accepted', 'arrived', 'ongoing'])
      .onSnapshot(querySnapshot => {
        if (!querySnapshot.empty) {
          const ride = querySnapshot.docs[0];
          const data = ride.data();
          setActiveRide({ id: ride.id, ...data });

          // Mettre à jour la position du chauffeur sur la carte du client
          if (data.driverLat && data.driverLon) {
            webViewRef.current?.injectJavaScript(`
              if (window.updateDriverMarker) {
                window.updateDriverMarker(${data.driverLat}, ${data.driverLon});
              }
            `);
          }

          if (data.status === 'accepted' || data.status === 'ongoing') {
            const dest = { lat: data.destLat, lon: data.destLon };
            const start = data.status === 'accepted' ? { lat: data.driverLat, lon: data.driverLon } : userLocation;
            updateMapWithRoute(start, dest);
          }
        } else {
          setActiveRide(null);
          setEta(null);
          webViewRef.current?.injectJavaScript(`if(window.clearRoute) window.clearRoute();`);
        }
      });

    return () => subscriber();
  }, []);

  const updateMapWithRoute = (start: any, end: any) => {
    if (!start.lat || !end.lat) return;
    webViewRef.current?.injectJavaScript(`
      if (window.setRoute) {
        window.setRoute(${start.lat}, ${start.lon}, ${end.lat}, ${end.lon});
      }
    `);
  };

  const handleSearchLocation = async () => {
    if (!destination.trim()) return;
    setLoading(true);
    const coords = await fetchCoordinates(destination);
    setLoading(false);
    if (coords) {
      setIsModalVisible(true);
      updateMapWithRoute(userLocation, coords);
    } else {
      Alert.alert("Erreur", "Lieu introuvable.");
    }
  };

  const handleConfirmOrder = async () => {
    setIsModalVisible(false);
    const coords = await fetchCoordinates(destination);
    if (coords) {
      try {
        await firestore().collection('rides').add({
          passengerId: auth().currentUser?.uid,
          passengerName: auth().currentUser?.displayName || "Client",
          destination: destination,
          pickupLat: userLocation.lat,
          pickupLon: userLocation.lon,
          destLat: coords.lat,
          destLon: coords.lon,
          serviceType: serviceType,
          status: 'pending',
          createdAt: firestore.FieldValue.serverTimestamp(),
          price: serviceType === 'VIP' ? 5000 : 2500,
        });
      } catch (e) {
        Alert.alert("Erreur", "Connexion Firebase échouée.");
      }
    }
  };

  const onMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'ETA') setEta(data.value);
    } catch(e) {}
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <WebView
        ref={webViewRef}
        style={styles.map}
        onMessage={onMessage}
        source={{ html: `
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
              <style>html, body { margin: 0; padding: 0; height: 100%; width: 100%; } #map { height: 100%; width: 100%; }</style>
              <script src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}"></script>
            </head>
            <body>
              <div id="map"></div>
              <script>
                var map, directionsService, directionsRenderer, userMarker, driverMarker;

                function initMap() {
                  map = new google.maps.Map(document.getElementById('map'), {
                    center: { lat: ${userLocation.lat}, lng: ${userLocation.lon} },
                    zoom: 15, disableDefaultUI: true
                  });
                  directionsService = new google.maps.DirectionsService();
                  directionsRenderer = new google.maps.DirectionsRenderer({
                    map: map, suppressMarkers: false, polylineOptions: { strokeColor: "#E53E3E", strokeWeight: 5 }
                  });
                  userMarker = new google.maps.Marker({ position: { lat: ${userLocation.lat}, lng: ${userLocation.lon} }, map: map, title: "Moi" });
                }

                window.setRoute = function(sLat, sLon, eLat, eLon) {
                  directionsService.route({
                    origin: {lat: sLat, lng: sLon}, destination: {lat: eLat, lng: eLon}, travelMode: 'DRIVING'
                  }, function(res, status) {
                    if (status === 'OK') {
                      directionsRenderer.setDirections(res);
                      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ETA', value: res.routes[0].legs[0].duration.text }));
                    }
                  });
                };

                window.updateDriverMarker = function(lat, lon) {
                  if (!driverMarker) {
                    driverMarker = new google.maps.Marker({
                      position: {lat: lat, lng: lon}, map: map,
                      icon: 'https://cdn-icons-png.flaticon.com/32/744/744465.png'
                    });
                  } else {
                    driverMarker.setPosition({lat: lat, lng: lon});
                  }
                };

                window.clearRoute = function() { directionsRenderer.setDirections({routes: []}); };
                google.maps.event.addDomListener(window, 'load', initMap);
              </script>
            </body>
          </html>
        ` }}
      />

      {!activeRide && (
        <SafeAreaView style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <TextInput style={styles.input} placeholder="Où allez-vous ?" onChangeText={setDestination} value={destination} />
            <TouchableOpacity style={styles.btnGo} onPress={handleSearchLocation} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnGoText}>GO</Text>}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}

      <View style={styles.footer}>
        {activeRide ? (
          <View style={styles.activeRideCard}>
            <Text style={styles.statusLabel}>{activeRide.status === 'pending' ? "⏳ RECHERCHE..." : "✅ CHAUFFEUR EN ROUTE"}</Text>
            <View style={styles.rideInfo}>
              <View style={{flex:1}}>
                <Text style={styles.destValue} numberOfLines={1}>{activeRide.destination}</Text>
                {eta && <Text style={styles.etaText}>Arrivée : {eta}</Text>}
              </View>
              <TouchableOpacity style={styles.chatBtn} onPress={() => navigation.navigate('Chat', { rideId: activeRide.id, otherName: 'Chauffeur' })}>
                <Text style={styles.chatIcon}>💬</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => firestore().collection('rides').doc(activeRide.id).delete()}>
              <Text style={styles.cancelText}>ANNULER</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem} onPress={() => setIsSOSVisible(true)}>
              <View style={[styles.iconCircle, {backgroundColor: '#FED7D7'}]}><Text style={styles.icon}>🚨</Text></View>
              <Text style={styles.label}>SOS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('IASecour')}>
              <View style={[styles.iconCircle, {backgroundColor: '#E9D8FD'}]}><Text style={styles.icon}>🤖</Text></View>
              <Text style={styles.label}>IA Aide</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('DevenirChauffeur')}>
              <View style={[styles.iconCircle, {backgroundColor: '#FEFCBF'}]}><Text style={styles.icon}>👤</Text></View>
              <Text style={styles.label}>Chauffeur</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Modal SOS & Sélection Service identiques aux versions précédentes mais stylisés */}
      <Modal visible={isSOSVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>URGENCES</Text>
            <TouchableOpacity style={styles.sosItem} onPress={() => Alert.alert("Appel 119")}><Text style={styles.sosText}>📞 SAMU : 119</Text></TouchableOpacity>
            <TouchableOpacity style={styles.sosItem} onPress={() => Alert.alert("Appel 117")}><Text style={styles.sosText}>📞 Police : 117</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setIsSOSVisible(false)} style={styles.closeBtn}><Text>Fermer</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIndicator} />
            <Text style={styles.modalTitle}>Votre Course</Text>
            <View style={styles.serviceRow}>
              <TouchableOpacity style={[styles.serviceBtn, serviceType === 'Classique' && styles.selected]} onPress={() => setServiceType('Classique')}>
                <Text style={styles.serviceIcon}>🚗</Text><Text style={styles.serviceLabel}>Classique</Text><Text style={styles.price}>2500 F</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.serviceBtn, serviceType === 'VIP' && styles.selected]} onPress={() => setServiceType('VIP')}>
                <Text style={styles.serviceIcon}>💎</Text><Text style={styles.serviceLabel}>VIP</Text><Text style={styles.price}>5000 F</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmOrder}><Text style={styles.confirmBtnText}>VALIDER</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.backBtn}><Text>Retour</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  map: { flex: 1 },
  searchContainer: { position: 'absolute', top: 50, left: 20, right: 20, zIndex: 10 },
  searchBar: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 15, padding: 8, elevation: 15, alignItems: 'center' },
  input: { flex: 1, paddingHorizontal: 15, fontSize: 16 },
  btnGo: { backgroundColor: '#E53E3E', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  btnGoText: { color: 'white', fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 30, left: 20, right: 20 },
  menuCard: { backgroundColor: 'white', borderRadius: 25, padding: 20, elevation: 15, flexDirection: 'row', justifyContent: 'space-around' },
  activeRideCard: { backgroundColor: 'white', borderRadius: 25, padding: 20, elevation: 20 },
  statusLabel: { color: '#E53E3E', fontWeight: 'bold', fontSize: 12 },
  rideInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15 },
  destValue: { fontSize: 18, fontWeight: 'bold', color: '#1A202C' },
  etaText: { color: '#48BB78', fontWeight: 'bold' },
  chatBtn: { backgroundColor: '#F6E05E', width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' },
  chatIcon: { fontSize: 22 },
  cancelBtn: { padding: 10, alignItems: 'center' },
  cancelText: { color: '#718096', fontSize: 12, textDecorationLine: 'underline' },
  iconCircle: { width: 55, height: 55, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  icon: { fontSize: 24 },
  label: { fontSize: 12, fontWeight: '700' },
  menuItem: { alignItems: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', padding: 25, borderTopLeftRadius: 30, borderTopRightRadius: 30, alignItems: 'center' },
  modalIndicator: { width: 40, height: 5, backgroundColor: '#E2E8F0', borderRadius: 10, marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 25 },
  serviceRow: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  serviceBtn: { flex: 1, padding: 20, borderRadius: 20, borderWidth: 2, borderColor: '#F7FAFC', alignItems: 'center', backgroundColor: '#F7FAFC' },
  selected: { borderColor: '#E53E3E', backgroundColor: '#FFF5F5' },
  serviceIcon: { fontSize: 32, marginBottom: 10 },
  serviceLabel: { fontWeight: 'bold' },
  price: { color: '#E53E3E', fontWeight: 'bold' },
  confirmBtn: { backgroundColor: '#000', width: '100%', padding: 18, borderRadius: 15, alignItems: 'center' },
  confirmBtnText: { color: 'white', fontWeight: 'bold' },
  backBtn: { marginTop: 15 },
  sosItem: { width: '100%', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  sosText: { fontSize: 18, fontWeight: 'bold', color: '#E53E3E' },
  closeBtn: { marginTop: 20 }
});