import React from 'react';
import PixelTitle from './PixelTitle';

// Logo del juego (se mantiene el nombre del componente para no tocar los imports).
export default function Brand({ compact = false }) {
  return <PixelTitle text="RUSHBOUND" compact={compact} />;
}
