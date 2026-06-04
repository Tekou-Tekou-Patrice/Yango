import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import auth from '@react-native-firebase/auth';
import { StatusBar } from 'react-native';

// Import des pages Chauffeur
import ConnexionPage from './src/pages/connexion';
import InscriptionPage from './src/pages/inscription';
import AccueilPage from './src/pages/accueil';
import ChatPage from './src/pages/Chat';

const Stack = createStackNavigator();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Gère les changements d'état de l'utilisateur
  function onAuthStateChanged(user: any) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  if (initializing) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#1A202C" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <>
              <Stack.Screen name="Accueil" component={AccueilPage} />
              <Stack.Screen name="Chat" component={ChatPage} />
            </>
          ) : (
            <>
              <Stack.Screen name="Connexion" component={ConnexionPage} />
              <Stack.Screen name="Inscription" component={InscriptionPage} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}