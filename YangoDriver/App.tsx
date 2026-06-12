import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import auth from '@react-native-firebase/auth';
import { StatusBar } from 'react-native';

import Connexion from './src/pages/connexion';
import Inscription from './src/pages/inscription';
import Dashboard from './src/pages/Dashboard';
import Accueil from './src/pages/accueil';
import Chat from './src/pages/Chat';
import Profile from './src/pages/Profile';

const Stack = createStackNavigator();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    return auth().onAuthStateChanged((u) => {
      setUser(u);
      if (initializing) setInitializing(false);
    });
  }, []);

  if (initializing) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#1A202C" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <>
              <Stack.Screen name="Dashboard" component={Dashboard} />
              <Stack.Screen name="Accueil" component={Accueil} />
              <Stack.Screen name="Chat" component={Chat} />
              <Stack.Screen name="Profile" component={Profile} />
            </>
          ) : (
            <>
              <Stack.Screen name="Connexion" component={Connexion} />
              <Stack.Screen name="Inscription" component={Inscription} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}