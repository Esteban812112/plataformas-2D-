import React, { useMemo } from 'react';
import Svg, { Rect } from 'react-native-svg';

// Dibuja una cuadrícula de texto como pixel art. `size` es el tamaño en pantalla de cada pixel
// (usa números enteros para que los bordes queden nítidos).
export default function PixelArt({ rows, palette, size = 4, style }) {
  const { rects, width, height } = useMemo(() => {
    const out = [];
    let maxW = 0;
    rows.forEach((row, y) => {
      maxW = Math.max(maxW, row.length);
      let x = 0;
      while (x < row.length) {
        const c = row[x];
        let run = 1;
        while (x + run < row.length && row[x + run] === c) run++;
        if (palette[c]) out.push({ x, y, w: run, fill: palette[c] });
        x += run;
      }
    });
    return { rects: out, width: maxW, height: rows.length };
  }, [rows, palette]);

  return (
    <Svg width={width * size} height={height * size} viewBox={`0 0 ${width} ${height}`} style={style}>
      {rects.map((r, i) => (
        <Rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.fill} />
      ))}
    </Svg>
  );
}

// Ícono de un solo color.
export function PixelIcon({ rows, color, size = 3, style }) {
  return <PixelArt rows={rows} palette={{ '#': color }} size={size} style={style} />;
}
