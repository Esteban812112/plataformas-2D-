import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import Brand from '../components/Brand';
import BeachScene from '../components/BeachScene';
import { Button, Chip, Field, Panel } from '../components/UI';
import { colors } from '../theme/colors';
import { login, register } from '../api';

const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

function messageFor(error, isRegister) {
  if (error.status === 0) return error.message;
  if (error.status === 401) return 'Correo o contraseña incorrectos.';
  if (error.status === 409) return 'Ya existe una cuenta con ese correo.';
  if (error.status === 400) return isRegister ? 'Revisa el correo y usa una contraseña de 8 a 72 caracteres.' : 'Correo o contraseña incorrectos.';
  return 'Algo salió mal. Inténtalo de nuevo.';
}

export default function LoginScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const isRegister = mode === 'register';

  const submit = async () => {
    if (loading) return;
    const next = {};
    const cleanEmail = email.trim();
    if (!EMAIL_PATTERN.test(cleanEmail)) next.email = 'Escribe un correo válido.';
    if (isRegister && password.length < 8) next.password = 'La contraseña debe tener al menos 8 caracteres.';
    if (!isRegister && password.length === 0) next.password = 'Escribe tu contraseña.';
    setErrors(next);
    setServerError('');
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      const auth = isRegister ? await register(cleanEmail, password) : await login(cleanEmail, password);
      onAuthenticated(auth);
    } catch (error) {
      setServerError(messageFor(error, isRegister));
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(isRegister ? 'login' : 'register');
    setErrors({});
    setServerError('');
  };

  return (
    <BeachScene>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Brand />
          <Chip style={styles.tagline}>RUN • JUMP • SURVIVE</Chip>

          <Panel style={styles.panel}>
            <Text style={styles.cardTitle}>{isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</Text>
            <Text style={styles.cardSubtitle}>
              {isRegister ? 'Regístrate con tu correo y una contraseña.' : 'Ingresa tus datos para continuar.'}
            </Text>
            <Field
              label="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              placeholder="tu@correo.com"
              autoCapitalize="none"
              keyboardType="email-address"
              error={errors.email}
            />
            <Field
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              placeholder={isRegister ? 'Mínimo 8 caracteres' : 'Tu contraseña'}
              secureTextEntry
              maxLength={72}
              error={errors.password}
            />
            {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}
            <Button
              title={loading ? 'ESPERA...' : isRegister ? 'CREAR CUENTA' : 'ENTRAR'}
              icon="play"
              onPress={submit}
              disabled={loading}
            />
            <Pressable onPress={switchMode} disabled={loading} accessibilityRole="button">
              <Text style={styles.switchText}>
                {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
              </Text>
            </Pressable>
          </Panel>
        </ScrollView>
      </KeyboardAvoidingView>
    </BeachScene>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, padding: 24, paddingVertical: 28, justifyContent: 'center' },
  tagline: { marginTop: 12, marginBottom: 20 },
  panel: { width: '100%', maxWidth: 420, alignSelf: 'center' },
  cardTitle: { color: colors.navy, fontSize: 22, fontWeight: '900' },
  cardSubtitle: { color: colors.muted, fontSize: 14, marginTop: 4, marginBottom: 18 },
  serverError: { color: '#B3261E', fontSize: 13, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  switchText: { color: colors.navy, fontSize: 13, fontWeight: '700', textAlign: 'center', marginTop: 16, textDecorationLine: 'underline' },
});
