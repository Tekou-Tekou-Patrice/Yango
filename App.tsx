import 'react-native-gesture-handler'; // Obligatoire tout en haut !
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importation des pages depuis le dossier pages
import ConnexionPage from './pages/connexion';
import InscriptionPage from './pages/inscription';
import AccueilPage from './pages/accueil';
import IASecourPage from './pages/iaSecour';
import DevenirChauffeur from './pages/DevenirChauffeur';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Connexion" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Connexion" component={ConnexionPage} />
        <Stack.Screen name="Inscription" component={InscriptionPage} />
        <Stack.Screen name="Accueil" component={AccueilPage} />
        <Stack.Screen name="IASecour" component={IASecourPage} />
        <Stack.Screen name="DevenirChauffeur" component={DevenirChauffeur} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}