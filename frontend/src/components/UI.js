import React from 'react';
import { Pressable, Text, View, TextInput, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { PixelIcon } from './PixelArt';
import { ICONS } from './sprites';

// Botón de madera/arena con contorno azul oscuro, brillo arriba y borde inferior que se "hunde" al tocar.
export function Button({ title, onPress, secondary = false, disabled = false, style, icon }) {
  const pal = secondary
    ? { face: colors.blue, light: colors.blueLight, dark: colors.blueDark }
    : { face: colors.btn, light: colors.btnLight, dark: colors.btnDark };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btnOuter,
        disabled && styles.disabled,
        pressed && !disabled && { transform: [{ translateY: 3 }] },
        style,
      ]}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.btnBody,
            { backgroundColor: pal.face, borderBottomColor: pal.dark, borderBottomWidth: pressed ? 3 : 7 },
          ]}
        >
          <View style={[styles.btnShine, { backgroundColor: pal.light }]} />
          <View style={styles.btnRow}>
            {icon ? <PixelIcon rows={ICONS[icon]} color={colors.navy} size={3} style={styles.btnIcon} /> : null}
            <Text style={styles.btnText}>{title}</Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

// Botón cuadrado con solo un ícono (volver, cerrar sesión).
export function IconButton({ icon, label, onPress, style }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.iconOuter, pressed && { transform: [{ translateY: 2 }] }, style]}
    >
      <View style={styles.iconBody}>
        <PixelIcon rows={ICONS[icon]} color={colors.navy} size={3} />
      </View>
    </Pressable>
  );
}

// Marco dorado con interior crema, como los paneles del mockup.
export function Panel({ children, style, innerStyle }) {
  return (
    <View style={[styles.panelOuter, style]}>
      <View style={[styles.panelInner, innerStyle]}>{children}</View>
    </View>
  );
}

// Etiqueta pequeña tipo cinta (saludo, niveles, eslogan).
export function Chip({ children, style }) {
  return (
    <View style={[styles.chip, style]}>
      <Text style={styles.chipText}>{children}</Text>
    </View>
  );
}

// Barra superior de las pantallas internas: volver + título.
export function Header({ title, onBack }) {
  return (
    <View style={styles.header}>
      <IconButton icon="back" label="Volver" onPress={onBack} />
      <View style={styles.headerTitleWrap}>
        <Text style={styles.headerTitle} accessibilityRole="header">
          {title}
        </Text>
      </View>
    </View>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  multiline,
  error,
  autoCapitalize = 'none',
  keyboardType,
  maxLength,
}) {
  return (
    <View style={styles.fieldWrap}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        maxLength={maxLength}
        accessibilityLabel={label || placeholder}
        style={[styles.input, multiline && styles.multiline, error && styles.inputError]}
        selectionColor={colors.blueDark}
      />
      {!!error && (
        <View style={styles.errorRow} accessibilityLiveRegion="polite">
          <View style={styles.errorBadge}>
            <Text style={styles.errorBadgeText}>!</Text>
          </View>
          <Text style={styles.error}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  btnOuter: {
    borderWidth: 3,
    borderColor: colors.navy,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: colors.navy,
  },
  btnBody: { minHeight: 56, paddingHorizontal: 16, justifyContent: 'center' },
  btnShine: { position: 'absolute', top: 0, left: 0, right: 0, height: 5, opacity: 0.9 },
  btnRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  btnIcon: { marginRight: 12 },
  btnText: { color: colors.navy, fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  disabled: { opacity: 0.5 },

  iconOuter: {
    width: 50,
    height: 50,
    borderWidth: 3,
    borderColor: colors.navy,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: colors.navy,
  },
  iconBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blue,
    borderBottomWidth: 5,
    borderBottomColor: colors.blueDark,
  },

  panelOuter: {
    backgroundColor: colors.creamEdge,
    borderWidth: 3,
    borderColor: colors.navy,
    borderRadius: 10,
    padding: 4,
  },
  panelInner: {
    backgroundColor: colors.cream,
    borderWidth: 2,
    borderColor: colors.navy,
    borderRadius: 6,
    padding: 16,
  },

  chip: {
    alignSelf: 'center',
    backgroundColor: colors.cream,
    borderWidth: 3,
    borderColor: colors.navy,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: { color: colors.navy, fontSize: 13, fontWeight: '800', letterSpacing: 0.5, textAlign: 'center' },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: colors.cream,
    borderWidth: 3,
    borderColor: colors.navy,
    borderRadius: 6,
    minHeight: 50,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  headerTitle: { color: colors.navy, fontSize: 18, fontWeight: '900', letterSpacing: 1 },

  fieldWrap: { marginBottom: 14 },
  label: { color: colors.navy, fontWeight: '800', marginBottom: 6, fontSize: 14 },
  input: {
    minHeight: 50,
    backgroundColor: colors.inputBg,
    color: colors.navy,
    borderWidth: 3,
    borderColor: colors.inputBorder,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  multiline: { minHeight: 110, textAlignVertical: 'top', paddingTop: 12 },
  inputError: { borderColor: colors.danger },
  errorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  errorBadge: {
    width: 18,
    height: 18,
    borderRadius: 3,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBadgeText: { color: colors.white, fontSize: 12, fontWeight: '900' },
  error: { color: colors.danger, marginLeft: 8, flex: 1, fontSize: 13, fontWeight: '600' },
});
