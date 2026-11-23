import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import BeachScene from '../components/BeachScene';
import { Button, Field, Header, Panel } from '../components/UI';
import { colors } from '../theme/colors';

export default function CommentsScreen({ username, comments, onAddComment, onBack }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async () => {
    const value = message.trim();
    if (value.length < 3) { setError('Escribe un comentario de al menos 3 caracteres.'); return; }
    if (value.length > 500) { setError('El comentario no puede superar los 500 caracteres.'); return; }
    await onAddComment(value);
    setMessage(''); setError('');
    Alert.alert('Comentario agregado', 'Tu comentario se guardó en este dispositivo.');
  };

  return (
    <BeachScene>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Header title="COMENTARIOS" onBack={onBack} />

          <Panel>
            <Text style={styles.formTitle}>¿Qué te pareció el juego?</Text>
            <Field
              value={message}
              onChangeText={(t) => { setMessage(t); if (error) setError(''); }}
              placeholder="Escribe tu comentario..."
              multiline
              maxLength={500}
              error={error}
              autoCapitalize="sentences"
            />
            <Text style={styles.counter}>{message.length}/500</Text>
            <Button title="ENVIAR" icon="forward" onPress={submit} />
          </Panel>

          <Panel style={styles.listPanel}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Comentarios recientes</Text>
              <View style={styles.count}>
                <Text style={styles.countText}>{comments.length}</Text>
              </View>
            </View>

            {comments.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>Todavía no hay comentarios</Text>
                <Text style={styles.emptyBody}>Sé el primero en compartir qué te pareció la aventura.</Text>
              </View>
            ) : (
              comments.map((item) => (
                <View key={item.id} style={styles.comment}>
                  <View style={styles.commentTop}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{(item.username || 'J').slice(0, 1).toUpperCase()}</Text>
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{item.username}</Text>
                      <Text style={styles.date}>{item.date || 'Reciente'}</Text>
                    </View>
                  </View>
                  <Text style={styles.commentText}>{item.message}</Text>
                </View>
              ))
            )}
          </Panel>

          <Text style={styles.backendNote}>
            Los comentarios se guardan localmente en esta versión. En la siguiente etapa se conectarán al backend.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </BeachScene>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 20, paddingTop: 18, paddingBottom: 40 },
  formTitle: { color: colors.navy, fontSize: 17, fontWeight: '900', marginBottom: 12 },
  counter: { color: colors.muted, fontSize: 12, textAlign: 'right', marginTop: -6, marginBottom: 12 },
  listPanel: { marginTop: 16 },
  listHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  listTitle: { color: colors.navy, fontSize: 17, fontWeight: '900' },
  count: {
    marginLeft: 10,
    backgroundColor: colors.navy,
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  countText: { color: colors.gold, fontSize: 13, fontWeight: '900' },
  empty: { alignItems: 'center', paddingVertical: 14 },
  emptyTitle: { color: colors.navy, fontSize: 15, fontWeight: '800' },
  emptyBody: { color: colors.muted, fontSize: 13, textAlign: 'center', lineHeight: 19, marginTop: 6 },
  comment: {
    backgroundColor: '#FFFBEF',
    borderWidth: 2,
    borderColor: colors.inputBorder,
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
  },
  commentTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 4,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.gold, fontWeight: '900', fontSize: 16 },
  userInfo: { marginLeft: 10 },
  userName: { color: colors.navy, fontSize: 14, fontWeight: '900' },
  date: { color: colors.muted, fontSize: 12, marginTop: 2 },
  commentText: { color: colors.navy, fontSize: 15, lineHeight: 21 },
  backendNote: {
    color: colors.navy,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(255,241,205,0.85)',
    borderRadius: 6,
    padding: 8,
  },
});
