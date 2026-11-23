import React from 'react';
import { Text, View, StyleSheet, useWindowDimensions } from 'react-native';
import { colors } from '../theme/colors';

const FONT = 'PressStart2P_400Regular';

// Título grande dorado con contorno azul y relieve, como el logo del mockup.
// React Native no tiene "text-stroke", así que se apilan copias desplazadas del texto.
export default function PixelTitle({ text = 'RUSHBOUND', compact = false }) {
  const { width } = useWindowDimensions();
  const max = compact ? 22 : 34;
  const size = Math.max(14, Math.min(max, Math.floor((width - 72) / (text.length * 1.05))));
  const o = Math.max(2, Math.round(size / 10)); // grosor del contorno
  const depth = Math.max(3, Math.round(size / 6)); // profundidad del relieve

  const base = { fontFamily: FONT, fontSize: size, includeFontPadding: false };
  const ring = [
    [-o, 0], [o, 0], [0, -o], [0, o], [-o, -o], [o, -o], [-o, o], [o, o],
  ];

  const layers = [];
  // contorno exterior (también alrededor del relieve)
  ring.forEach(([dx, dy], i) => {
    layers.push({ key: `o${i}`, dx, dy, color: colors.navy });
    layers.push({ key: `p${i}`, dx, dy: dy + depth, color: colors.navy });
  });
  // relieve naranja
  for (let d = 1; d <= depth; d++) layers.push({ key: `e${d}`, dx: 0, dy: d, color: colors.orange });

  return (
    <View
      accessible
      accessibilityRole="header"
      accessibilityLabel={text}
      style={{ alignSelf: 'center', padding: o, paddingBottom: o + depth }}
    >
      {layers.map((l) => (
        <Text
          key={l.key}
          importantForAccessibility="no-hide-descendants"
          style={[base, styles.layer, { color: l.color, left: o + l.dx, top: o + l.dy }]}
        >
          {text}
        </Text>
      ))}
      <Text style={[base, { color: colors.gold }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({ layer: { position: 'absolute' } });
