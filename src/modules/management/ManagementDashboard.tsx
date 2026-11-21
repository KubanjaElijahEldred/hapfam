import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Megaphone, ShieldCheck, Activity, Bell, ArrowUpRight, Building2 } from 'lucide-react-native';
import { C, DEPARTMENTS, RADIUS } from '../../theme';
import type { Dept } from '../../types';
import { Card, Kpi, SectionHead, Badge, Row, IconBox, gridWrap, gridItem, useGridCols } from '../../components/ui';
import { AnnouncementCenter } from '../../components/AnnouncementCenter';
import { useApp } from '../../store';

export function ManagementDashboard() {
  const router = useRouter();
  const app = useApp();
  const cols = useGridCols();
  return (
    <View>
      <View style={head}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={eyebrow}>MANAGEMENT · COMMUNICATIONS & OVERSIGHT</Text>
          <Text style={title}>Management Overview</Text>
          <Text style={sub}>Broadcast to every department and see replies with their source department.</Text>
        </View>
      </View>

      <View style={gridWrap(14)}>
        <View style={gridItem(cols)}><Kpi icon={<Megaphone size={19} color={C.primary} />} label="Workspaces" value="3" sub="Production · Inventory · Quality" tone="forest" /></View>
        <View style={gridItem(cols)}><Kpi icon={<ShieldCheck size={19} color={C.fresh} />} label="Active users" value="4" sub="Manager + 3 department leads" tone="success" /></View>
        <View style={gridItem(cols)}><Kpi icon={<Bell size={19} color={C.warning} />} label="Department alerts" value={String(app.notifications.filter(n => n.dept !== 'management' && !n.read).length)} sub="Unread across departments" tone="warning" /></View>
        <View style={gridItem(cols)}><Kpi icon={<Activity size={19} color={C.info} />} label="Recorded activities" value={String(app.activities.length)} sub="Live transaction feed" tone="info" /></View>
      </View>

      <View style={{ height: 22 }} />
      <Card style={{ marginBottom: 20 }}>
        <SectionHead eyebrow="Cross-department" title="Workspace Status" subtitle="Each workspace shares the same integrated record store" />
        <Row style={deptRow}>
          {(Object.keys(DEPARTMENTS) as Dept[]).filter(k => k !== 'management').map(k => {
            const d = DEPARTMENTS[k];
            const counts: Record<string, number> = {
              production: app.orders.length + app.batches.length,
              inventory: app.materials.length + app.finished.length,
              quality: app.inspections.length + app.ncrs.length,
            };
            return (
              <Pressable key={k} onPress={() => router.push(d.route as any)} style={deptCard}>
                <View style={[deptIcon, { backgroundColor: `${d.color}18` }]}><Building2 size={18} color={d.color} /></View>
                <Text style={deptName}>{d.name}</Text>
                <Text style={deptCount}>{counts[k]} records</Text>
                <ArrowUpRight size={14} color={C.muted} style={{ marginTop: 6 }} />
              </Pressable>
            );
          })}
        </Row>
      </Card>

      <AnnouncementCenter dept="management" />
    </View>
  );
}

const head = { flexDirection: 'row' as const, alignItems: 'flex-end' as const, marginBottom: 22 };
const eyebrow = { fontSize: 12, fontWeight: '800' as const, letterSpacing: 1.5, color: C.primary };
const title = { fontSize: 29, fontWeight: '800' as const, color: C.text, letterSpacing: -0.8, marginTop: 6 };
const sub = { fontSize: 15, color: C.muted, marginTop: 6 };
const deptRow = { flexDirection: 'row' as const, gap: 12, flexWrap: 'wrap' as const };
const deptCard = { flex: 1, minWidth: 170, backgroundColor: C.cream, borderRadius: RADIUS.md, padding: 14 };
const deptIcon = { width: 34, height: 34, borderRadius: 10, alignItems: 'center' as const, justifyContent: 'center' as const, marginBottom: 10 };
const deptName = { fontSize: 14, fontWeight: '800' as const, color: C.text };
const deptCount = { fontSize: 12, color: C.muted, marginTop: 3 };
