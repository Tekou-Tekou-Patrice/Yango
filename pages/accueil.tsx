import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { fetchCoordinates } from '../src/GeocodingService';

export default function AccueilPage({ navigation }: { navigation: any }) {
  const [destination, setDestination] = useState('');
  const webViewRef = useRef<WebView>(null);

  const handleGo = async () => {
    const coords = await fetchCoordinates(destination);
    if (coords) {
      webViewRef.current?.injectJavaScript(`
        var dest = L.latLng(${coords.lat}, ${coords.lon});
        control.setWaypoints([L.latLng(3.8480, 11.5021), dest]);
        map.flyTo(dest, 14);
      `);
    } else {
      Alert.alert("Introuvable", "Veuillez préciser le lieu.");
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        style={styles.map}
        source={{ html: `<html><body><div id="map" style="height:100vh"></div><link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"/><script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script><link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css"/><script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js"></script><script>var map = L.map('map').setView([3.8480, 11.5021], 13); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map); var control = L.Routing.control({ waypoints: [], addWaypoints: false }).addTo(map);</script></body></html>` }}
      />

      <View style={styles.header}>
        <TextInput style={styles.input} placeholder="Où allez-vous ?" onChangeText={setDestination} />
        <TouchableOpacity style={styles.btnGo} onPress={handleGo}><Text style={styles.txtBtn}>GO</Text></TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, styles.shadow]} onPress={handleGo}><Text>🚗 Course</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.shadow, {backgroundColor:'#FF4500'}]} onPress={() => Alert.alert("SOS")}><Text style={{color:'white'}}>🚨 Urgence</Text></TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, styles.shadow, {backgroundColor:'#6200EE'}]} onPress={() => navigation.navigate('IASecour')}><Text style={{color:'white'}}>🤖 IA Secours</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.shadow, {backgroundColor:'#FFD700'}]} onPress={() => navigation.navigate('DevenirChauffeur')}><Text>👤 Chauffeur</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  header: { position: 'absolute', top: 50, left: 20, right: 20, flexDirection: 'row', backgroundColor: 'white', borderRadius: 25, padding: 5, elevation: 5, shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.2 },
  input: { flex: 1, paddingHorizontal: 20 },
  btnGo: { padding: 15, backgroundColor: '#000', borderRadius: 20 },
  txtBtn: { color: 'white', fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 30, left: 20, right: 20, gap: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  btn: { flex: 1, padding: 20, backgroundColor: 'white', borderRadius: 20, alignItems: 'center' },
  shadow: { elevation: 10, shadowColor: '#000', shadowOffset: {width:0, height:4}, shadowOpacity: 0.3 }
});