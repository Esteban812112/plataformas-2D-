import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform, StatusBar, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import { Button, Header } from '../components/UI';
import { colors } from '../theme/colors';

const UNITY_URL = process.env.EXPO_PUBLIC_UNITY_GAME_URL || 'http://10.0.2.2:8080/index.html';

export default function UnityScreen({ onBack }) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const topPad = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;

  return (
    <SafeAreaView style={[styles.screen, { paddingTop: topPad }]}>
      <View style={styles.top}>
        <Header title="JUGAR" onBack={onBack} />
      </View>

      <View style={styles.gameFrame}>
        <View style={styles.game}>
          {failed ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>No se pudo cargar el juego</Text>
              <Text style={styles.errorText}>
                Comprueba que el build de Unity esté publicado en la dirección configurada y que el
                móvil o emulador pueda acceder a ella.
              </Text>
              <Text style={styles.url}>{UNITY_URL}</Text>
              <Button
                title="REINTENTAR"
                onPress={() => { setFailed(false); setLoading(true); }}
                style={styles.retry}
              />
            </View>
          ) : (
            <>
              <WebView
                source={{ uri: UNITY_URL }}
                style={styles.webview}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                onError={() => { setLoading(false); setFailed(true); }}
                javaScriptEnabled
                domStorageEnabled
                allowsInlineMediaPlayback
                originWhitelist={['*']}
              />
              {loading && (
                <View style={styles.loading}>
                  <ActivityIndicator size="large" color={colors.gold} />
                  <Text style={styles.loadingText}>CARGANDO AVENTURA...</Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>

      <View style={styles.bottom}>
        <Text style={styles.bottomText}>MODO INDIVIDUAL</Text>
        <Text style={styles.bottomHint}>Tu progreso se conectará al backend en la siguiente etapa.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.sky3 },
  top: { paddingHorizontal: 14, paddingTop: 12 },
  gameFrame: {
    flex: 1,
    marginHorizontal: 14,
    borderWidth: 3,
    borderColor: colors.navy,
    borderRadius: 8,
    padding: 3,
    backgroundColor: colors.creamEdge,
  },
  game: { flex: 1, backgroundColor: colors.black, borderWidth: 2, borderColor: colors.navy },
  webview: { flex: 1, backgroundColor: colors.black },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.black,
  },
  loadingText: { color: colors.gold, fontSize: 12, fontWeight: '900', letterSpacing: 2, marginTop: 14 },
  errorBox: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  errorTitle: { color: colors.gold, fontSize: 20, fontWeight: '900', textAlign: 'center' },
  errorText: { color: colors.white, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 12 },
  url: { color: colors.blueLight, fontSize: 12, marginTop: 14, textAlign: 'center' },
  retry: { marginTop: 22, minWidth: 220 },
  bottom: {
    margin: 14,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.cream,
    borderWidth: 3,
    borderColor: colors.navy,
    borderRadius: 6,
  },
  bottomText: { color: colors.navy, fontSize: 12, letterSpacing: 1.5, fontWeight: '900' },
  bottomHint: { color: colors.muted, fontSize: 12, marginTop: 3 },
});
