import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet, Easing, Text } from 'react-native';
import { usePathname } from 'expo-router';
import { C, RADIUS } from '../theme';

/** Shimmering grey skeleton used while a workspace hydrates. */
export function SkeletonBlock({ width = '100%', height = 16, radius = 8, style }: { width?: any; height?: number; radius?: number; style?: any }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [anim]);
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.9] });
  return <Animated.View style={[{ width, height, borderRadius: radius, backgroundColor: C.border, opacity }, style]} />;
}

export function SkeletonDashboard() {
  return (
    <View style={sk.wrap}>
      <SkeletonBlock width={220} height={16} />
      <SkeletonBlock width="60%" height={34} style={{ marginTop: 12 }} />
      <SkeletonBlock width="45%" height={14} style={{ marginTop: 10 }} />
      <SkeletonBlock height={230} radius={RADIUS.xl} style={{ marginTop: 26 }} />
      <View style={sk.grid}>
        {[0, 1, 2, 3].map(i => <SkeletonBlock key={i} height={120} radius={RADIUS.lg} />)}
      </View>
      <SkeletonBlock height={200} radius={RADIUS.lg} style={{ marginTop: 18 }} />
    </View>
  );
}

/** Animated 3D-style loader shown briefly during client-side route changes. */
export function RouteTransition() {
  const pathname = usePathname();
  const first = useRef(true);
  const [visible, setVisible] = useState(false);
  const spin = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setVisible(true);
    fade.setValue(1);
    const loop = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 1400, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    const timeout = setTimeout(() => {
      Animated.timing(fade, { toValue: 0, duration: 280, useNativeDriver: true }).start(() => { setVisible(false); loop.stop(); spin.setValue(0); });
    }, 420);
    return () => { clearTimeout(timeout); loop.stop(); };
  }, [pathname, fade, spin]);

  if (!visible) return null;
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const scale = spin.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.9, 1.08, 0.9] });
  return (
    <Animated.View style={[tr.overlay, { opacity: fade }]} pointerEvents="none">
      <Animated.View style={[tr.cube, { transform: [{ perspective: 700 }, { rotateY: rotate }, { scale }] }]}>
        <View style={tr.faceA} />
        <View style={tr.faceB} />
      </Animated.View>
      <Text style={tr.text}>Loading workspace…</Text>
    </Animated.View>
  );
}

const sk = StyleSheet.create({
  wrap: { gap: 10, paddingTop: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
});
const tr = StyleSheet.create({
  overlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(248,245,235,0.82)', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  cube: { width: 58, height: 58, alignItems: 'center', justifyContent: 'center' },
  faceA: { position: 'absolute', width: 54, height: 54, borderRadius: 14, borderWidth: 3, borderColor: C.primary, backgroundColor: 'rgba(140,207,69,0.22)' },
  faceB: { position: 'absolute', width: 32, height: 32, borderRadius: 9, borderWidth: 3, borderColor: C.lemon, backgroundColor: 'rgba(33,139,69,0.25)' },
  text: { marginTop: 16, fontSize: 17, color: C.forest, fontWeight: '700' },
});
