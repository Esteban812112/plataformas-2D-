
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Header } from '../components/UI';
import { colors } from '../theme/colors';

const UNITY_URL =
  process.env.EXPO_PUBLIC_UNITY_GAME_URL ||
  'http://localhost:8080/index.html';

export default function UnityScreen({ onBack }) {
  return (
    <View style={styles.screen}>
      <View style={styles.top}>
        <Header title="JUGAR" onBack={onBack} />
      </View>

      <View style={styles.gameFrame}>
        <iframe
          title="Rushbound Unity Game"
          src={UNITY_URL}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
            backgroundColor: '#000',
          }}
          allow="fullscreen; autoplay"
          allowFullScreen
        />
      </View>

      <View style={styles.bottom}>
        <Text style={styles.bottomText}>
          MODO INDIVIDUAL
        </Text>
        <Text style={styles.bottomHint}>
          Disfruta tu aventura en Rushbound.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.sky3,
  },
  top: {
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  gameFrame: {
    flex: 1,
    marginHorizontal: 14,
    marginTop: 8,
    borderWidth: 3,
    borderColor: colors.navy,
    borderRadius: 8,
    padding: 3,
    backgroundColor: colors.black,
    overflow: 'hidden',
    minHeight: 250,
  },
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
  bottomText: {
    color: colors.navy,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  bottomHint: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3,
  },
});
