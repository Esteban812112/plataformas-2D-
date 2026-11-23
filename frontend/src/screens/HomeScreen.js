import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Brand from '../components/Brand';
import BeachScene from '../components/BeachScene';
import { Button, Chip, IconButton } from '../components/UI';

export default function HomeScreen({ username, unlockedLevel = 1, onPlay, onComments, onLogout }) {
  return (
    <BeachScene>
      <View style={styles.topRight}>
        <IconButton icon="power" label="Cerrar sesión" onPress={onLogout} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <Brand />
        <Chip style={styles.greeting}>{`Hola, ${username}`}</Chip>

        <View style={styles.menu}>
          <Button title="JUGAR" icon="play" onPress={onPlay} />
          <Button title="COMENTARIOS" icon="chat" onPress={onComments} style={styles.second} />
        </View>

        <Chip style={styles.levels}>{`Nivel desbloqueado: ${unlockedLevel}`}</Chip>
      </ScrollView>
    </BeachScene>
  );
}

const styles = StyleSheet.create({
  topRight: { position: 'absolute', top: 22, right: 22, zIndex: 5 },
  container: { flexGrow: 1, padding: 24, paddingTop: 70, justifyContent: 'center' },
  greeting: { marginTop: 14 },
  menu: { width: '100%', maxWidth: 340, alignSelf: 'center', marginTop: 34 },
  second: { marginTop: 16 },
  levels: { marginTop: 30 },
});
