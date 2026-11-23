import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert, BackHandler } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import CommentsScreen from './src/screens/CommentsScreen';
import UnityScreen from './src/screens/UnityScreen';
import { getMe, ApiError } from './src/api';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { colors } from './src/theme/colors';

const KEYS = { token: '@rushbound/token', comments: '@rushbound/comments' };

export default function App() {
  const [screen, setScreen] = useState('login');
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null); // { id, email, unlockedLevel }
  const username = user ? user.email.split('@')[0] : '';
  const [comments, setComments] = useState([]);
  const [ready, setReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts({ PressStart2P_400Regular });
  const [fontTimeout, setFontTimeout] = useState(false);

  // Si la fuente tarda demasiado, la app arranca igual con la fuente del sistema.
  useEffect(() => {
    const t = setTimeout(() => setFontTimeout(true), 2500);
    return () => clearTimeout(t);
  }, []);

  // Al abrir la app: si hay un token guardado, el servidor decide si sigue siendo válido.
  useEffect(() => {
    (async () => {
      try {
        const [savedToken, savedComments] = await Promise.all([AsyncStorage.getItem(KEYS.token), AsyncStorage.getItem(KEYS.comments)]);
        if (savedComments) setComments(JSON.parse(savedComments));
        if (savedToken) {
          try {
            const profile = await getMe(savedToken);
            setToken(savedToken);
            setUser(profile);
            setScreen('home');
          } catch (error) {
            // 401: token vencido o inválido. Sin conexión: no se puede comprobar. En ambos casos pide iniciar sesión.
            if (error instanceof ApiError && error.status === 401) await AsyncStorage.removeItem(KEYS.token);
          }
        }
      } catch (error) {
        console.warn('No se pudo recuperar el estado local:', error);
      } finally { setReady(true); }
    })();
  }, []);

  // Cada vez que se vuelve al menú, se actualiza el nivel desde el servidor.
  useEffect(() => {
    if (screen !== 'home' || !token) return;
    getMe(token).then(setUser).catch((error) => {
      if (error instanceof ApiError && error.status === 401) logout();
    });
  }, [screen]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'unity' || screen === 'comments') { setScreen('home'); return true; }
      if (screen === 'home') { Alert.alert('Salir', '¿Quieres cerrar la aplicación?', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Cerrar', onPress: () => BackHandler.exitApp() }]); return true; }
      return false;
    });
    return () => sub.remove();
  }, [screen]);

  const authenticated = async ({ token: newToken, user: newUser }) => {
    await AsyncStorage.setItem(KEYS.token, newToken);
    setToken(newToken);
    setUser(newUser);
    setScreen('home');
  };
  const logout = async () => {
    await AsyncStorage.removeItem(KEYS.token);
    setToken(null);
    setUser(null);
    setScreen('login');
  };
  const addComment = async (message) => {
    const item = { id: `${Date.now()}`, username, message, date: new Date().toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) };
    const next = [item, ...comments];
    setComments(next);
    await AsyncStorage.setItem(KEYS.comments, JSON.stringify(next));
  };

  if (!ready || (!fontsLoaded && !fontError && !fontTimeout)) return <View style={styles.loading}><ActivityIndicator size="large" color={colors.navy} /></View>;
  return <View style={styles.app}><StatusBar style="dark" />
    {screen === 'login' && <LoginScreen onAuthenticated={authenticated} />}
    {screen === 'home' && <HomeScreen username={username} unlockedLevel={user ? user.unlockedLevel : 1} onPlay={() => setScreen('unity')} onComments={() => setScreen('comments')} onLogout={logout} />}
    {screen === 'comments' && <CommentsScreen username={username} comments={comments} onAddComment={addComment} onBack={() => setScreen('home')} />}
    {screen === 'unity' && <UnityScreen onBack={() => setScreen('home')} />}
  </View>;
}

const styles = StyleSheet.create({ app: { flex: 1, backgroundColor: colors.sky2 }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sky2 } });
