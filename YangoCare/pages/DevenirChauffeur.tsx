import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';

export default function DevenirChauffeur({ navigation }: { navigation: any }) {
  const requirements = [
    { id: 1, text: 'CNI ou Passeport valide', icon: '🆔' },
    { id: 2, text: 'Permis de conduire en cours de validité', icon: '🪪' },
    { id: 3, text: 'Carte grise du véhicule', icon: '🚗' },
    { id: 4, text: 'Assurance à jour', icon: '📄' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#B7791F" />

      {/* Header avec bouton retour */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Partenaire Driver</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Text style={styles.heroEmoji}>🤝</Text>
          <Text style={styles.title}>Rejoignez l'équipe YangoCare</Text>
          <Text style={styles.subtitle}>
            Devenez un chauffeur partenaire et commencez à gagner de l'argent tout en aidant votre communauté.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documents requis</Text>
          <View style={styles.card}>
            {requirements.map((item, index) => (
              <View key={item.id} style={[
                styles.listItem,
                index !== requirements.length - 1 && styles.borderBottom
              ]}>
                <Text style={styles.itemIcon}>{item.icon}</Text>
                <Text style={styles.itemText}>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Note : Vous serez redirigé vers la plateforme officielle Yango Driver pour finaliser votre inscription.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.mainButton}
          activeOpacity={0.8}
          onPress={() => Linking.openURL('https://yango.com/fr_cm/driver/')}
        >
          <Text style={styles.btnText}>S'inscrire maintenant</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#B7791F' },
  header: {
    backgroundColor: '#B7791F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 20,
    paddingTop: Platform.OS === 'android' ? 10 : 0,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#F7FAFC',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    paddingBottom: 40
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  heroEmoji: { fontSize: 60, marginBottom: 15 },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10
  },
  section: { marginBottom: 25 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A5568',
    marginBottom: 15,
    marginLeft: 5
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemIcon: { fontSize: 20, marginRight: 15 },
  itemText: { fontSize: 16, color: '#2D3748', fontWeight: '500' },
  infoBox: {
    backgroundColor: '#FEFCBF',
    padding: 15,
    borderRadius: 15,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#F6E05E',
  },
  infoText: { color: '#744210', fontSize: 14, fontStyle: 'italic', lineHeight: 20 },
  mainButton: {
    backgroundColor: '#B7791F',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#B7791F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  btnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});