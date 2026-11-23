
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { colors } from '../theme/colors';
import PixelArt from './PixelArt';
import { CLOUD, PALM, PLANT, ROCK } from './sprites';

// Fondo de playa con marco, igual que el mockup: cielo en franjas, mar, espuma,
// arena, palmeras, rocas y plantas. Los hijos se dibujan encima.
export default function BeachScene({ children }) {
  const { width, height } = useWindowDimensions();
  const horizon = Math.round(height * 0.5);
  const seaH = Math.round(height * 0.16);
  const skyBands = [colors.sky1, colors.sky2, colors.sky3, colors.sky4, colors.sky5];
  const topPad = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;

  // Espuma: bloques blancos de altura alterna a lo largo de la orilla.
  const foam = [];
  for (let x = 0, i = 0; x < width; x += 14, i++) {
    foam.push(<View key={i} style={[styles.foamBlock, { left: x, top: i % 2 ? 0 : 4 }]} />);
  }

  return (
    <View style={styles.root}>
      {/* cielo */}
      <View style={[styles.abs, { top: 0, height: horizon }]}>
        {skyBands.map((c, i) => (
          <View key={c} style={{ flex: 1, backgroundColor: c }} />
        ))}
      </View>
      <View pointerEvents="none" style={styles.abs}>
        <View style={{ position: 'absolute', top: horizon * 0.16, left: width * 0.06 }}>
          <PixelArt rows={CLOUD.rows} palette={CLOUD.palette} size={5} />
        </View>
        <View style={{ position: 'absolute', top: horizon * 0.34, right: width * 0.04 }}>
          <PixelArt rows={CLOUD.rows} palette={CLOUD.palette} size={4} />
        </View>
        <View style={{ position: 'absolute', top: horizon * 0.7, left: width * 0.3 }}>
          <PixelArt rows={CLOUD.rows} palette={CLOUD.palette} size={3} />
        </View>
      </View>

      {/* mar */}
      <View style={[styles.abs, { top: horizon, height: seaH, backgroundColor: colors.sea }]}>
        <View style={[styles.stripe, { top: 0, height: 4, backgroundColor: colors.seaLight }]} />
        <View style={[styles.stripe, { top: seaH * 0.35, height: 3, backgroundColor: colors.seaLight, left: '10%', right: '40%' }]} />
        <View style={[styles.stripe, { top: seaH * 0.6, height: 3, backgroundColor: colors.seaDeep, left: '35%', right: '8%' }]} />
        <View style={[styles.stripe, { top: seaH * 0.8, height: 3, backgroundColor: colors.seaLight, left: '5%', right: '55%' }]} />
      </View>

      {/* arena */}
      <View style={[styles.abs, { top: horizon + seaH, bottom: 0, backgroundColor: colors.sand }]}>
        <View style={{ height: 14 }}>{foam}</View>
        <View style={[styles.speck, { top: 60, left: width * 0.2 }]} />
        <View style={[styles.speck, { top: 120, left: width * 0.62 }]} />
        <View style={[styles.speck, { top: 190, left: width * 0.4 }]} />
        <View style={[styles.speck, { top: 250, left: width * 0.78 }]} />
      </View>

      {/* palmeras, rocas y plantas */}
      <View pointerEvents="none" style={{ position: 'absolute', left: -14, bottom: height * 0.1 }}>
        <PixelArt rows={PALM.rows} palette={PALM.palette} size={5} />
      </View>
      <View pointerEvents="none" style={{ position: 'absolute', right: -18, bottom: height * 0.14 }}>
        <PixelArt rows={PALM.rows} palette={PALM.palette} size={5} />
      </View>
      <View pointerEvents="none" style={{ position: 'absolute', left: 8, bottom: 14 }}>
        <PixelArt rows={ROCK.rows} palette={ROCK.palette} size={4} />
      </View>
      <View pointerEvents="none" style={{ position: 'absolute', left: 72, bottom: 12 }}>
        <PixelArt rows={PLANT.rows} palette={PLANT.palette} size={4} />
      </View>
      <View pointerEvents="none" style={{ position: 'absolute', right: 10, bottom: 12 }}>
        <PixelArt rows={PLANT.rows} palette={PLANT.palette} size={4} />
      </View>

      {/* contenido */}
      <SafeAreaView style={[StyleSheet.absoluteFill, { paddingTop: topPad }]}>{children}</SafeAreaView>

      {/* marco */}
      <View pointerEvents="none" style={styles.frameOuter}>
        <View style={styles.frameInner} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sky1 },
  abs: { position: 'absolute', left: 0, right: 0 },
  stripe: { position: 'absolute', left: 0, right: 0 },
  foamBlock: { position: 'absolute', width: 14, height: 8, backgroundColor: colors.foam },
  speck: { position: 'absolute', width: 6, height: 4, backgroundColor: colors.sandLight },
  frameOuter: {
    ...StyleSheet.absoluteFillObject,
    margin: 4,
    borderWidth: 3,
    borderColor: colors.navy,
    borderRadius: 14,
  },
  frameInner: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderColor: colors.creamEdge,
    borderRadius: 10,
  },
});
