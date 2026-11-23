import { Platform } from 'react-native';

// Dirección del backend. Se puede cambiar con la variable EXPO_PUBLIC_API_URL
// (por ejemplo, la IP de tu PC si pruebas en un celular real).
//  - Web e iOS simulador: localhost
//  - Emulador Android: 10.0.2.2 apunta al PC donde corre el backend
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:8082' : 'http://localhost:8082');

const TIMEOUT_MS = 10000;

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status; // 0 = no hubo respuesta del servidor
  }
}

async function request(path, { method = 'GET', token, body } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    throw new ApiError(0, 'No se pudo conectar con el servidor. Revisa que el backend esté encendido.');
  } finally {
    clearTimeout(timer);
  }
  let data = null;
  try { data = await response.json(); } catch (error) { /* respuesta sin cuerpo */ }
  if (!response.ok) throw new ApiError(response.status, (data && data.error) || 'Error inesperado.');
  return data;
}

export const register = (email, password) =>
  request('/auth/register', { method: 'POST', body: { email, password } });

export const login = (email, password) =>
  request('/auth/login', { method: 'POST', body: { email, password } });

export const getMe = (token) => request('/users/me', { token });

export const unlockLevel = (token, level) =>
  request('/users/me/level', { method: 'PUT', token, body: { level } });
