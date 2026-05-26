import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Alert, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid } from 'react-native';

// Structure pour stocker la position GPS
interface LocationState {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export default function AccueilPage({ navigation }: { navigation: any }) {
  const [region, setRegion] = useState<LocationState | null>(null);
  const [loading, setLoading] = useState(true);

  // Demande de permission Android native (Obligatoire en React Native CLI)
  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') return true;
    
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Accès à la géolocalisation",
          message: "YangoCare a besoin d'accès à votre position pour afficher la carte.",
          buttonNeutral: "Plus tard",
          buttonNegative: "Annuler",
          buttonPositive: "OK"
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  useEffect(() => {
    const getInitialLocation = async () => {
      const hasPermission = await requestLocationPermission();
      
      if (!hasPermission) {
        Alert.alert("Permission refusée", "Impossible de charger la carte sans GPS.");
        setLoading(false);
        return;
      }

      // Récupération de la position actuelle du téléphone
      Geolocation.getCurrentPosition(
        (position) => {
          setRegion({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.015, // Zoom de la carte
            longitudeDelta: 0.0121,
          });
          setLoading(false);
        },
        (error) => {
          Alert.alert("Erreur GPS", error.message);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    };

    getInitialLocation();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF3B30" />
        <Text style={styles.loaderText}>Chargement de la carte...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 1. La Carte Interactive */}
      {region && (
        <MapView
          provider={PROVIDER_GOOGLE} // Utilise Google Maps sur Android et iOS
          style={styles.map}
          initialRegion={region}
          showsUserLocation={true} // Affiche le point bleu natif du téléphone
          showsMyLocationButton={true}
        >
          {/* Exemple de Marqueur : Un chauffeur fictif à proximité */}
          <Marker
            coordinate={{
              latitude: region.latitude + 0.003, 
              longitude: region.longitude + 0.003
            }}
            title="Chauffeur Yango"
            description="Disponible (Toyota Yaris)"
            pinColor="orange"
          />
        </MapView>
      )}

      {/* 2. Le Panneau Supérieur (Statut) */}
      <View style={styles.topBar}>
        <Text style={styles.title}>YangoCare</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.navigate('Connexion')}>
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>

      {/* 3. Le Panneau Inférieur d'Action (Style Application VTC) */}
      <View style={styles.bottomCard}>
        <Text style={styles.subtitle}>Où allez-vous aujourd'hui ?</Text>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => Alert.alert("Commande", "Recherche de chauffeurs en cours...")}
        >
          <Text style={styles.actionButtonText}>Commander une course</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 15,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF3B30', // Changement pour le rouge/orange typique VTC
  },
  logoutButton: {
    padding: 5,
  },
  logoutText: {
    color: '#666',
    fontWeight: '600',
  },
  bottomCard: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});