// src/firebase.ts
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// On exporte les instances pour les utiliser partout
export const authService = auth();
export const db = firestore();