import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, useWindowDimensions,
  NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react-native';
import { ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { C, RADIUS, SHADOW } from '../theme';

export interface Slide {
  image: any;
  eyebrow: string;
  title: string;
  subtitle: string;
  accent?: string;
}

export function HeroCarousel({ slides, height = 330 }: { slides: Slide[]; height?: number }) {
  const scroller = useRef<any>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [w, setW] = useState(0);
  const { width } = useWindowDimensions();
  const h = Math.min(height, width < 700 ? 290 : height);

  useEffect(() => {
    if (paused || w === 0 || slides.length < 2) return;
    const id = setInterval(() => {
      const next = (index + 1) % slides.length;
      setIndex(next);
      scroller.current?.scrollTo({ x: next * w, animated: true });
    }, 5200);
    return () => clearInterval(id);
  }, [index, paused, w, slides.length]);

  const go = (n: number) => {
    const next = (n + slides.length) % slides.length;
    setIndex(next);
    scroller.current?.scrollTo({ x: next * w, animated: true });
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!w) return;
    const i = Math.round(e.nativeEvent.contentOffset.x / w);
    if (i !== index && i >= 0 && i < slides.length) setIndex(i);
  };

  const hover = { onMouseEnter: () => setPaused(true), onMouseLeave: () => setPaused(false) } as any;

  return (
    <View
      style={[styles.wrap, { height: h }, SHADOW.raised]}
      onLayout={e => setW(e.nativeEvent.layout.width)}
      {...hover}
    >
      <ScrollView
        ref={scroller}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={styles.scroller}
      >
        {slides.map((s, i) => (
          <ImageBackground key={i} source={s.image} style={[styles.slide, { width: w || Math.max(280, width - (width >= 1024 ? 312 : 32) - 48), height: h }]} contentFit="cover">
            <View style={[styles.shade, { backgroundColor: 'rgba(8,44,27,0.16)' }]} />
            <LinearGradient colors={['rgba(8,44,27,0)', 'rgba(8,44,27,0.85)']} style={styles.bottomShade} />
            <View style={styles.content}>
              <View style={[styles.eyebrow, { backgroundColor: s.accent || C.fresh }]}>
                <Text style={styles.eyebrowText}>{s.eyebrow}</Text>
              </View>
              <Text style={[styles.title, { fontSize: width < 700 ? 26 : 37 }]}>{s.title}</Text>
              <Text style={styles.subtitle}>{s.subtitle}</Text>
            </View>
          </ImageBackground>
        ))}
      </ScrollView>

      {index > 0 ? (
        <Pressable onPress={() => go(index - 1)} style={({ pressed }) => [styles.arrow, styles.left, pressed && { opacity: 0.7 }]} hitSlop={10}>
          <ChevronLeft size={20} color={C.white} strokeWidth={2.5} />
        </Pressable>
      ) : null}
      {index < slides.length - 1 ? (
        <Pressable onPress={() => go(index + 1)} style={({ pressed }) => [styles.arrow, styles.right, pressed && { opacity: 0.7 }]} hitSlop={10}>
          <ChevronRight size={20} color={C.white} strokeWidth={2.5} />
        </Pressable>
      ) : null}

      <View style={styles.controls}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <Pressable key={i} onPress={() => go(i)} hitSlop={8} style={styles.dotBtn}>
              <View style={[styles.dot, i === index ? { width: 24, backgroundColor: C.fresh } : { backgroundColor: 'rgba(255,255,255,0.55)' }]} />
            </Pressable>
          ))}
        </View>
        <Pressable onPress={() => setPaused(p => !p)} hitSlop={8} style={styles.pauseBtn}>
          {paused ? <Play size={13} color={C.white} fill={C.white} /> : <Pause size={13} color={C.white} fill={C.white} />}
          <Text style={styles.pauseText}>{paused ? 'Play' : 'Pause'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', borderRadius: RADIUS.xl, overflow: 'hidden', backgroundColor: C.deep, marginBottom: 26 },
  scroller: { width: '100%', height: '100%' },
  slide: { justifyContent: 'flex-end' },
  shade: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  bottomShade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '82%' },
  content: { padding: 30, paddingBottom: 34, maxWidth: 620 },
  eyebrow: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.pill, marginBottom: 14 },
  eyebrowText: { color: C.deep, fontSize: 12, fontWeight: '800', letterSpacing: 1.3, textTransform: 'uppercase' },
  title: { color: C.white, fontWeight: '800', letterSpacing: -1, lineHeight: 44 },
  subtitle: { color: '#DDEBE0', fontSize: 17, marginTop: 8, fontWeight: '500' },
  arrow: { position: 'absolute', top: '50%', marginTop: -19, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  left: { left: 16 },
  right: { right: 16 },
  controls: { position: 'absolute', right: 22, bottom: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dotBtn: { padding: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  pauseBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.16)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.pill },
  pauseText: { color: C.white, fontSize: 13, fontWeight: '700' },
});
