import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import auth from '@react-native-firebase/auth';

import ConnexionPage from './pages/connexion';
import InscriptionPage from './pages/inscription';
import AccueilPage from './pages/accueil';
import IASecourPage from './pages/iaSecour';
import DevenirChauffeur from './pages/DevenirChauffeur';
import ChatPage from './pages/Chat';

const Stack = createStackNavigator();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

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
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <>
              <Stack.Screen name="Accueil" component={AccueilPage} />
              <Stack.Screen name="IASecour" component={IASecourPage} />
              <Stack.Screen name="DevenirChauffeur" component={DevenirChauffeur} />
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