import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import { C, TONE_COLOR } from '../theme';

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'forest' | 'fresh';

/** Circular progress gauge — used for pass rates, target achievement, capacity. */
export function Ring({ value, label, sub, tone = 'success', size = 148, thickness = 13 }: {
  value: number; label?: string; sub?: string; tone?: Tone; size?: number; thickness?: number;
}) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  const color = TONE_COLOR[tone];
  return (
    <View style={[styles.ringWrap, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="#EDF1EA" strokeWidth={thickness} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={thickness} fill="none"
          strokeDasharray={`${(v / 100) * circ} ${circ}`} strokeLinecap="round"
          rotation={-90} originX={size / 2} originY={size / 2} />
      </Svg>
      <View style={styles.ringCenter}>
        <Text style={[styles.ringValue, { color: C.text }]}>{Math.round(v)}<Text style={{ fontSize: size * 0.16 }}>%</Text></Text>
        {label ? <Text style={styles.ringLabel}>{label}</Text> : null}
        {sub ? <Text style={styles.ringSub}>{sub}</Text> : null}
      </View>
    </View>
  );
}

/** Vertical bar chart built with views — reliable on web, iOS and Android. */
export function Bars({ data, tone = 'success', height = 150, goal, unit = '' }: {
  data: { label: string; value: number }[]; tone?: Tone; height?: number; goal?: number; unit?: string;
}) {
  const max = Math.max(...data.map(x => x.value), goal || 0, 1);
  return (
    <View style={{ width: '100%' }}>
      {goal ? (
        <View style={[styles.goalLine, { bottom: height * 0 + (goal / max) * (height - 28) + 22 }]}>
          <Text style={styles.goalLabel}>Target</Text>
        </View>
      ) : null}
      <View style={[styles.bars, { height }]}>
        {data.map((x, i) => {
          const h = Math.max(4, (x.value / max) * (height - 28));
          return (
            <View key={x.label + i} style={styles.barCol}>
              <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                <Text style={styles.barValue}>{x.value}{unit}</Text>
                <View style={[styles.bar, { height: h, backgroundColor: i === data.length - 1 ? TONE_COLOR[tone] : `${TONE_COLOR[tone]}55` }]} />
              </View>
              <Text style={styles.barLabel}>{x.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/** Smooth trend / area line chart. */
export function Trend({ points, tone = 'success', height = 120, labels }: { points: number[]; tone?: Tone; height?: number; labels?: string[] }) {
  const w = 320;
  const min = Math.min(...points) * 0.85;
  const max = Math.max(...points) * 1.08 || 1;
  const step = w / Math.max(1, points.length - 1);
  const coords = points.map((p, i) => ({ x: i * step, y: height - 12 - ((p - min) / (max - min || 1)) * (height - 24) }));
  const line = coords.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${line} L${w},${height} L0,${height} Z`;
  const color = TONE_COLOR[tone];
  return (
    <View style={{ width: '100%' }}>
      <Svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none">
        <Path d={area} fill={`${color}18`} />
        <Path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {coords.map((p, i) => <Circle key={i} cx={p.x} cy={p.y} r="3" fill={C.white} stroke={color} strokeWidth="2" />)}
      </Svg>
      {labels ? (
        <View style={styles.trendLabels}>{labels.map(l => <Text key={l} style={styles.trendLabel}>{l}</Text>)}</View>
      ) : null}
    </View>
  );
}

/** Horizontal stacked comparison bars (e.g. approved vs rejected vs hold). */
export function StackBar({ segments, height = 12 }: { segments: { value: number; tone: Tone }[]; height?: number }) {
  const total = segments.reduce((a, b) => a + b.value, 0) || 1;
  return (
    <View style={[styles.stack, { height, borderRadius: height / 2 }]}>
      {segments.map((s, i) => <View key={i} style={{ width: `${(s.value / total) * 100}%`, backgroundColor: TONE_COLOR[s.tone] }} />)}
    </View>
  );
}

export function Sparkline({ points, tone = 'success' }: { points: number[]; tone?: Tone }) {
  return <Trend points={points} tone={tone} height={42} />;
}

const styles = StyleSheet.create({
  ringWrap: { alignItems: 'center', justifyContent: 'center' },
  ringCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  ringValue: { fontSize: 30, fontWeight: '800', letterSpacing: -1 },
  ringLabel: { fontSize: 11, color: C.muted, fontWeight: '600', marginTop: 1 },
  ringSub: { fontSize: 10, color: C.muted, marginTop: 2 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' },
  bar: { width: '64%', maxWidth: 34, borderRadius: 6, minHeight: 4 },
  barValue: { fontSize: 10, fontWeight: '700', color: C.muted, marginBottom: 5 },
  barLabel: { fontSize: 11, color: C.muted, marginTop: 7, fontWeight: '600' },
  goalLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: C.warning, zIndex: 2 },
  goalLabel: { position: 'absolute', right: 0, top: -14, fontSize: 9, color: C.warning, fontWeight: '700' },
  trendLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  trendLabel: { fontSize: 10, color: C.muted },
  stack: { flexDirection: 'row', overflow: 'hidden', width: '100%' },
});
