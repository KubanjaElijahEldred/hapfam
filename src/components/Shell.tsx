import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions, Modal, TextInput,
} from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import {
  LayoutDashboard, Factory, ClipboardList, Layers3, PackageOpen, CalendarClock, History,
  FileBarChart2, Bell, Settings, Search, Menu, X, ChevronDown, ChevronRight, Leaf,
  Warehouse, FlaskConical, Boxes, Truck, ArrowLeftRight, SlidersHorizontal, ShieldCheck,
  ClipboardCheck, Beaker, Ban, AlertTriangle, Wrench, CheckCircle2, LogOut, UserRound,
  Building2, ArrowUpRight, CircleDot, PackageCheck, Megaphone, Activity,
} from 'lucide-react-native';
import { C, DEPARTMENTS, RADIUS } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground } from 'expo-image';
import { IMG } from '../assets';
import { SkeletonDashboard } from './Skeleton';
import { useApp } from '../store';
import type { Dept } from '../types';
import { Avatar, Badge } from './ui';
import { notifications as notificationApi } from '../services/backend';

type IconType = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

export const NAV: Record<Dept, { label: string; route: string; icon: IconType; group?: string }[]> = {
  production: [
    { label: 'Dashboard', route: '/production/dashboard', icon: LayoutDashboard, group: 'Overview' },
    { label: 'Production Planning', route: '/production/planning', icon: CalendarClock, group: 'Operations' },
    { label: 'Production Orders', route: '/production/orders', icon: ClipboardList },
    { label: 'Batch Management', route: '/production/batches', icon: Layers3 },
    { label: 'Material Consumption', route: '/production/consumption', icon: PackageOpen },
    { label: 'Production Schedule', route: '/production/schedule', icon: CalendarClock },
    { label: 'Production History', route: '/production/history', icon: History },
    { label: 'Production Reports', route: '/production/reports', icon: FileBarChart2, group: 'Insights' },
    { label: 'Notifications', route: '/production/notifications', icon: Bell },
    { label: 'Announcements', route: '/production/announcements', icon: Megaphone, group: 'Communications' },
    { label: 'Settings', route: '/production/settings', icon: Settings },
  ],
  inventory: [
    { label: 'Dashboard', route: '/inventory/dashboard', icon: LayoutDashboard, group: 'Overview' },
    { label: 'Raw Materials', route: '/inventory/materials', icon: Boxes, group: 'Stock' },
    { label: 'Finished Products', route: '/inventory/finished', icon: PackageCheck },
    { label: 'Goods Receiving', route: '/inventory/receiving', icon: Truck },
    { label: 'Material Requests', route: '/inventory/requests', icon: ArrowLeftRight, group: 'Transactions' },
    { label: 'Stock Movements', route: '/inventory/movements', icon: ArrowLeftRight },
    { label: 'Stock Adjustments', route: '/inventory/adjustments', icon: SlidersHorizontal },
    { label: 'Expiry Tracking', route: '/inventory/expiry', icon: CalendarClock },
    { label: 'Inventory Reports', route: '/inventory/reports', icon: FileBarChart2, group: 'Insights' },
    { label: 'Notifications', route: '/inventory/notifications', icon: Bell },
    { label: 'Announcements', route: '/inventory/announcements', icon: Megaphone, group: 'Communications' },
    { label: 'Settings', route: '/inventory/settings', icon: Settings },
  ],
  quality: [
    { label: 'Dashboard', route: '/quality/dashboard', icon: LayoutDashboard, group: 'Overview' },
    { label: 'Inspection Requests', route: '/quality/inspections', icon: ClipboardCheck, group: 'Inspections' },
    { label: 'Raw Material Testing', route: '/quality/raw-testing', icon: Beaker },
    { label: 'Batch Testing', route: '/quality/batch-testing', icon: FlaskConical },
    { label: 'Batch Approvals', route: '/quality/approvals', icon: ShieldCheck, group: 'Decisions' },
    { label: 'Rejected Batches', route: '/quality/rejected', icon: Ban },
    { label: 'Non-Conformance', route: '/quality/nonconformance', icon: AlertTriangle, group: 'Quality system' },
    { label: 'Corrective Actions', route: '/quality/corrective', icon: Wrench },
    { label: 'Quality Reports', route: '/quality/reports', icon: FileBarChart2, group: 'Insights' },
    { label: 'Notifications', route: '/quality/notifications', icon: Bell },
    { label: 'Announcements', route: '/quality/announcements', icon: Megaphone, group: 'Communications' },
    { label: 'Settings', route: '/quality/settings', icon: Settings },
  ],
  management: [
    { label: 'Dashboard', route: '/management/dashboard', icon: LayoutDashboard, group: 'Overview' },
    { label: 'Announcements', route: '/management/announcements', icon: Megaphone, group: 'Communications' },
    { label: 'Department Accounts', route: '/management/users', icon: ShieldCheck },
    { label: 'Department Activity', route: '/management/activity', icon: Activity },
    { label: 'Audit Trail', route: '/management/audit', icon: ShieldCheck, group: 'Governance' },
    { label: 'Notifications', route: '/management/notifications', icon: Bell },
    { label: 'Settings', route: '/management/settings', icon: Settings },
  ],
};

const ROLE: Record<Dept, string> = {
  production: 'Production Manager',
  inventory: 'Store Keeper',
  quality: 'Quality Assurance Officer',
  management: 'System Manager',
};

function DeptMark({ size = 38 }: { size?: number }) {
  return (
    <View style={[s.mark, { width: size, height: size, borderRadius: size * 0.3 }]}>
      <Leaf size={size * 0.55} color={C.fresh} strokeWidth={2.6} />
    </View>
  );
}

function Sidebar({ dept, pathname, onNavigate, onSwitch }: { dept: Dept; pathname: string; onNavigate: () => void; onSwitch: () => void }) {
  const router = useRouter();
  const info = DEPARTMENTS[dept];
  const Icon = dept === 'production' ? Factory : dept === 'inventory' ? Warehouse : dept === 'management' ? ShieldCheck : FlaskConical;
  const items = NAV[dept];
  let group = '';
  return (
    <LinearGradient colors={[C.deep, '#0C3521', C.forest]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.sidebar}>
      <View style={s.brand}>
        <DeptMark />
        <View style={{ flex: 1 }}>
          <Text style={s.brandName}>HAPFAM</Text>
          <Text style={s.brandTag}>Good Food. Better Life.</Text>
        </View>
      </View>

      <View style={s.deptCard}>
        <View style={s.deptCardTop}>
          <Icon size={17} color={C.fresh} />
          <Text style={s.deptNo}>DEPARTMENT {info.no}</Text>
        </View>
        <Text style={s.deptName}>{info.name}</Text>
        <Text style={s.deptSub}>{info.sub}</Text>
      </View>

      <ScrollView style={s.navScroll} showsVerticalScrollIndicator={false}>
        {items.map(item => {
          const showGroup = item.group && item.group !== group;
          if (item.group) group = item.group;
          const active = pathname === item.route;
          const I = item.icon;
          return (
            <React.Fragment key={item.route}>
              {showGroup ? <Text style={s.groupLabel}>{item.group}</Text> : null}
              <Pressable onPress={() => { onNavigate(); if (pathname !== item.route) router.push(item.route as any); }} style={({ pressed }) => [s.navItem, active && s.navActive, pressed && { opacity: 0.8 }]}>
                {active ? <View style={s.activeBar} /> : null}
                <I size={18} color={active ? C.fresh : '#A9C3B4'} strokeWidth={active ? 2.4 : 1.9} />
                <Text style={[s.navText, active && s.navTextActive]}>{item.label}</Text>
                {item.label === 'Notifications' ? <NotificationCount dept={dept} /> : null}
              </Pressable>
            </React.Fragment>
          );
        })}
        <View style={{ height: 18 }} />
      </ScrollView>

      {dept === 'management' ? (
        <Pressable onPress={onSwitch} style={s.switchBtn}>
          <Building2 size={17} color="#CFE3D5" />
          <Text style={s.switchText}>Switch department</Text>
          <ChevronRight size={16} color="#8FB49C" />
        </Pressable>
      ) : null}
      <ImageBackground source={IMG.back} style={s.sideBottom} contentFit="cover">
        <LinearGradient colors={['rgba(8,44,27,0.15)', C.deep]} style={s.sideBottomShade} />
        <View style={s.sideFoot}>
          <Avatar name={dept === 'quality' ? 'Grace Akinyi' : dept === 'inventory' ? 'Alice Wambui' : dept === 'management' ? 'Elijah Kubanja' : 'Daniel Ochieng'} size={36} />
          <View style={{ flex: 1 }}>
            <Text style={s.footName}>{dept === 'quality' ? 'Grace Akinyi' : dept === 'inventory' ? 'Alice Wambui' : dept === 'management' ? 'Elijah Kubanja' : 'Daniel Ochieng'}</Text>
            <Text style={s.footRole}>{ROLE[dept]}</Text>
          </View>
          <CircleDot size={12} color={C.lemon} />
        </View>
      </ImageBackground>
    </LinearGradient>
  );
}

function NotificationCount({ dept }: { dept: Dept }) {
  const s = useApp();
  const n = s.notifications.filter(x => x.dept === dept && !x.read).length;
  if (!n) return null;
  return <View style={sCount.badge}><Text style={sCount.text}>{n}</Text></View>;
}

export function DepartmentShell({ dept, children }: { dept: Dept; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const app = useApp();
  const desktop = width >= 1024;
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState(false);
  const [notifs, setNotifs] = useState(false);
  const [profile, setProfile] = useState(false);
  const [switcher, setSwitcher] = useState(false);
  const [booting, setBooting] = useState(true);
  useEffect(() => { const id = setTimeout(() => setBooting(false), 650); return () => clearTimeout(id); }, [dept]);

  useEffect(() => {
    let alive = true;
    const sync = async () => {
      try {
        const list = await notificationApi.list(dept);
        if (!alive) return;
        app.addRemoteNotifications(list.map(n => ({
          id: n.id, dept: (n.department || dept) as Dept, title: n.title, body: n.body,
          time: n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
          read: !!n.read, tone: (['success','danger','warning','info'].includes(n.tone) ? n.tone : 'info') as any,
        })));
      } catch { /* backend offline — demo records continue to work */ }
    };
    sync();
    const id = setInterval(sync, 30000);
    return () => { alive = false; clearInterval(id); };
  }, [dept]);

  const unread = app.notifications.filter(n => n.dept === dept && !n.read).length;
  const current = NAV[dept].find(n => n.route === pathname)?.label || DEPARTMENTS[dept].name;
  const info = DEPARTMENTS[dept];

  const searchResults = useMemo(() => {
    return app.notifications.filter(n => n.dept === dept).slice(0, 8);
  }, [app.notifications, dept]);

  return (
    <View style={s.root}>
      {desktop ? <Sidebar dept={dept} pathname={pathname} onNavigate={() => {}} onSwitch={() => setSwitcher(true)} /> : null}

      {!desktop && drawer ? (
        <View style={s.drawerWrap}>
          <Pressable style={s.backdrop} onPress={() => setDrawer(false)} />
          <View style={s.drawer}>
            <Sidebar dept={dept} pathname={pathname} onNavigate={() => setDrawer(false)} onSwitch={() => { setDrawer(false); setSwitcher(true); }} />
          </View>
        </View>
      ) : null}

      <View style={s.main}>
        <View style={[s.topbar, width < 700 && { paddingHorizontal: 12, gap: 8 }]}>
          {!desktop ? (
            <Pressable onPress={() => setDrawer(true)} style={s.iconBtn} hitSlop={8}><Menu size={22} color={C.text} /></Pressable>
          ) : null}
          <View style={s.crumbs}>
            {width >= 700 ? <Text style={s.crumbRoot}>HAPFAM</Text> : null}
            {width >= 700 ? <ChevronRight size={13} color={C.muted} /> : null}
            {width >= 700 ? <Text style={s.crumbDept}>{info.name}</Text> : null}
            {width >= 700 ? <ChevronRight size={13} color={C.muted} /> : null}
            <Text style={s.crumbPage} numberOfLines={1}>{current}</Text>
          </View>
          <View style={{ flex: 1 }} />
          {width >= 700 ? (
            <Pressable onPress={() => setSearch(true)} style={s.searchBox}>
              <Search size={17} color={C.muted} />
              <Text style={s.searchPlaceholder}>Search records, batches, orders…</Text>
              <Text style={s.searchKey}>⌘K</Text>
            </Pressable>
          ) : (
            <Pressable onPress={() => setSearch(true)} style={s.iconBtn} hitSlop={8}><Search size={20} color={C.text} /></Pressable>
          )}
          <Pressable onPress={() => setNotifs(true)} style={s.iconBtn} hitSlop={8}>
            <Bell size={20} color={C.text} />
            {unread > 0 ? <View style={s.bellBadge}><Text style={s.bellText}>{unread}</Text></View> : null}
          </Pressable>
          <Pressable onPress={() => setProfile(true)} style={s.profileBtn}>
            <Avatar name={dept === 'quality' ? 'Grace Akinyi' : dept === 'inventory' ? 'Alice Wambui' : dept === 'management' ? 'Elijah Kubanja' : 'Daniel Ochieng'} size={34} />
            {width >= 700 ? (
              <>
                <View style={{ marginLeft: 9 }}>
                  <Text style={s.profName}>{dept === 'quality' ? 'Grace Akinyi' : dept === 'inventory' ? 'Alice Wambui' : dept === 'management' ? 'Elijah Kubanja' : 'Daniel Ochieng'}</Text>
                  <Text style={s.profRole}>{ROLE[dept]}</Text>
                </View>
                <ChevronDown size={14} color={C.muted} />
              </>
            ) : null}
          </Pressable>
        </View>
        <LinearGradient colors={[C.cream, '#F3F8E8', C.cream]} style={s.content}>
          <ScrollView contentContainerStyle={[s.contentPad, width < 700 && { padding: 14 }]} showsVerticalScrollIndicator={false}>
            {booting ? <SkeletonDashboard /> : children}
            <View style={{ height: 40 }} />
          </ScrollView>
        </LinearGradient>
      </View>

      {/* Global search */}
      <Modal visible={search} transparent animationType="fade" onRequestClose={() => setSearch(false)}>
        <Pressable style={modal.backdrop} onPress={() => setSearch(false)} />
        <View style={[modal.sheet, { maxWidth: 620 }]}>
          <View style={modal.head}>
            <Search size={19} color={C.primary} />
            <TextInput autoFocus placeholder="Search notifications, batches, materials…" placeholderTextColor={C.muted} style={modal.input}
              onChangeText={() => {}} />
            <Pressable onPress={() => setSearch(false)} hitSlop={8}><X size={19} color={C.muted} /></Pressable>
          </View>
          <View style={modal.body}>
            <Text style={modal.group}>RECENT IN {info.name.toUpperCase()}</Text>
            {searchResults.map(n => (
              <Pressable key={n.id} onPress={() => { setSearch(false); setNotifs(true); }} style={modal.result}>
                <View style={[modal.resultDot, { backgroundColor: n.tone === 'danger' ? C.danger : n.tone === 'success' ? C.primary : C.warning }]} />
                <View style={{ flex: 1 }}>
                  <Text style={modal.resultTitle}>{n.title}</Text>
                  <Text style={modal.resultSub} numberOfLines={1}>{n.body}</Text>
                </View>
                <ArrowUpRight size={15} color={C.muted} />
              </Pressable>
            ))}
            <View style={modal.searchHint}><Text style={modal.hintText}>Type to filter across the integrated HAPFAM record store.</Text></View>
          </View>
        </View>
      </Modal>

      {/* Notifications */}
      <Modal visible={notifs} transparent animationType="fade" onRequestClose={() => setNotifs(false)}>
        <Pressable style={modal.backdrop} onPress={() => setNotifs(false)} />
        <View style={[modal.sheet, modal.right]}>
          <View style={modal.head}>
            <Bell size={19} color={C.primary} />
            <Text style={modal.headTitle}>Notifications</Text>
            <View style={{ flex: 1 }} />
            <Pressable onPress={() => app.markAllRead(dept)} hitSlop={8}><Text style={modal.link}>Mark all read</Text></Pressable>
            <Pressable onPress={() => setNotifs(false)} hitSlop={8}><X size={19} color={C.muted} /></Pressable>
          </View>
          <ScrollView style={modal.body}>
            {app.notifications.filter(n => n.dept === dept).length === 0 ? <Text style={modal.empty}>No notifications yet.</Text> : null}
            {app.notifications.filter(n => n.dept === dept).map(n => (
              <Pressable key={n.id} onPress={() => app.markRead(n.id)} style={[modal.notif, !n.read && modal.notifUnread]}>
                <View style={[modal.notifIcon, { backgroundColor: n.tone === 'danger' ? C.dangerSoft : n.tone === 'success' ? C.successSoft : n.tone === 'warning' ? C.warningSoft : C.infoSoft }]}>
                  {n.tone === 'danger' ? <Ban size={16} color={C.danger} /> : n.tone === 'success' ? <CheckCircle2 size={16} color={C.primary} /> : n.tone === 'warning' ? <AlertTriangle size={16} color={C.warning} /> : <Bell size={16} color={C.info} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={modal.notifTitle}>{n.title}</Text>
                  <Text style={modal.notifBody}>{n.body}</Text>
                  <Text style={modal.notifTime}>{n.time}</Text>
                </View>
                {!n.read ? <View style={modal.unreadDot} /> : null}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Profile */}
      <Modal visible={profile} transparent animationType="fade" onRequestClose={() => setProfile(false)}>
        <Pressable style={modal.backdrop} onPress={() => setProfile(false)} />
        <View style={[modal.sheet, modal.right]}>
          <View style={modal.head}>
            <UserRound size={19} color={C.primary} />
            <Text style={modal.headTitle}>My profile</Text>
            <View style={{ flex: 1 }} />
            <Pressable onPress={() => setProfile(false)} hitSlop={8}><X size={19} color={C.muted} /></Pressable>
          </View>
          <View style={modal.body}>
            <View style={modal.profileHero}>
              <Avatar name={dept === 'quality' ? 'Grace Akinyi' : dept === 'inventory' ? 'Alice Wambui' : dept === 'management' ? 'Elijah Kubanja' : 'Daniel Ochieng'} size={62} />
              <Text style={modal.profName}>{dept === 'quality' ? 'Grace Akinyi' : dept === 'inventory' ? 'Alice Wambui' : dept === 'management' ? 'Elijah Kubanja' : 'Daniel Ochieng'}</Text>
              <Text style={modal.profMail}>{dept === 'quality' ? 'grace.akinyi' : dept === 'inventory' ? 'alice.wambui' : dept === 'management' ? 'manager' : 'daniel.ochieng'}@hapfam.co.ug</Text>
              <Badge label={ROLE[dept]} tone="success" />
            </View>
            <View style={modal.roleBox}>
              <Text style={modal.roleTitle}>Department access</Text>
              <Text style={modal.roleText}>You have full access to the {DEPARTMENTS[dept].full} workspace. Cross-department records are read-only and permission controlled.</Text>
            </View>
            {dept === 'management' ? (
              <Pressable onPress={() => { setProfile(false); setSwitcher(true); }} style={modal.menuItem}><Building2 size={18} color={C.text} /><Text style={modal.menuText}>Switch department</Text><ChevronRight size={16} color={C.muted} /></Pressable>
            ) : null}
            <Pressable onPress={() => { setProfile(false); router.push('/' as any); }} style={modal.menuItem}><LogOut size={18} color={C.danger} /><Text style={[modal.menuText, { color: C.danger }]}>Back to department selector</Text></Pressable>
          </View>
        </View>
      </Modal>

      {/* Department switcher */}
      <Modal visible={switcher} transparent animationType="fade" onRequestClose={() => setSwitcher(false)}>
        <Pressable style={modal.backdrop} onPress={() => setSwitcher(false)} />
        <View style={[modal.sheet, { maxWidth: 620 }]}>
          <View style={modal.head}>
            <Building2 size={19} color={C.primary} />
            <Text style={modal.headTitle}>Switch workspace</Text>
            <View style={{ flex: 1 }} />
            <Pressable onPress={() => setSwitcher(false)} hitSlop={8}><X size={19} color={C.muted} /></Pressable>
          </View>
          <View style={modal.body}>
            {(Object.keys(DEPARTMENTS) as Dept[]).map(k => {
              const d = DEPARTMENTS[k];
              const I = k === 'production' ? Factory : k === 'inventory' ? Warehouse : k === 'management' ? ShieldCheck : FlaskConical;
              return (
                <Pressable key={k} onPress={() => { setSwitcher(false); router.push(d.route as any); }} style={modal.deptItem}>
                  <View style={[modal.deptIcon, { backgroundColor: `${d.color}1A` }]}><I size={22} color={d.color} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={modal.deptTitle}>{d.full}</Text>
                    <Text style={modal.deptDesc}>{d.sub}</Text>
                  </View>
                  <ChevronRight size={18} color={C.muted} />
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const sCount = StyleSheet.create({
  badge: { backgroundColor: C.danger, borderRadius: 9, minWidth: 18, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', height: 18, marginLeft: 'auto' },
  text: { color: C.white, fontSize: 12, fontWeight: '800' },
});

const modal = StyleSheet.create({
  backdrop: { position: 'absolute', inset: 0, backgroundColor: 'rgba(8,32,20,0.45)' },
  sheet: { position: 'absolute', top: '12%', alignSelf: 'center', width: '92%', backgroundColor: C.white, borderRadius: RADIUS.xl, overflow: 'hidden', maxHeight: '76%' },
  right: { top: 0, right: 0, bottom: 0, left: undefined as any, alignSelf: undefined as any, width: 400, maxWidth: '92%', maxHeight: undefined as any, borderRadius: 0 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 18, borderBottomWidth: 1, borderBottomColor: C.border },
  headTitle: { fontSize: 18, fontWeight: '800', color: C.text },
  link: { color: C.primary, fontSize: 14, fontWeight: '700' },
  input: { flex: 1, fontSize: 16, color: C.text, marginLeft: 4 },
  body: { padding: 14 },
  group: { fontSize: 12, fontWeight: '800', color: C.muted, letterSpacing: 1.2, margin: 6 },
  result: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: RADIUS.md },
  resultDot: { width: 8, height: 8, borderRadius: 4 },
  resultTitle: { fontSize: 15, fontWeight: '700', color: C.text },
  resultSub: { fontSize: 13, color: C.muted, marginTop: 2 },
  searchHint: { padding: 14, alignItems: 'center' },
  hintText: { fontSize: 13, color: C.muted },
  notif: { flexDirection: 'row', gap: 12, padding: 13, borderRadius: RADIUS.md, marginBottom: 6, backgroundColor: C.white },
  notifUnread: { backgroundColor: '#F6FAF5' },
  notifIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  notifTitle: { fontSize: 15, fontWeight: '700', color: C.text },
  notifBody: { fontSize: 13, color: C.muted, marginTop: 3, lineHeight: 18 },
  notifTime: { fontSize: 12, color: C.muted, marginTop: 5, fontWeight: '600' },
  unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.fresh, marginTop: 4 },
  empty: { color: C.muted, textAlign: 'center', padding: 24, fontSize: 15 },
  profileHero: { alignItems: 'center', paddingVertical: 20, gap: 7 },
  profName: { fontSize: 21, fontWeight: '800', color: C.text, marginTop: 6 },
  profMail: { fontSize: 14, color: C.muted, marginBottom: 6 },
  roleBox: { backgroundColor: C.cream, borderRadius: RADIUS.md, padding: 14, marginBottom: 12 },
  roleTitle: { fontSize: 14, fontWeight: '800', color: C.forest },
  roleText: { fontSize: 13, color: C.muted, lineHeight: 19, marginTop: 5 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: C.border },
  menuText: { flex: 1, fontSize: 15, color: C.text, fontWeight: '600' },
  deptItem: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 12, borderRadius: RADIUS.md, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  deptIcon: { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  deptTitle: { fontSize: 15, fontWeight: '800', color: C.text },
  deptDesc: { fontSize: 13, color: C.muted, marginTop: 3 },
});

const s = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: C.cream },
  sidebar: { width: 264, backgroundColor: C.deep, paddingTop: 26, paddingBottom: 14 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 22, marginBottom: 26 },
  mark: { backgroundColor: 'rgba(140,207,69,0.13)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(140,207,69,0.3)' },
  brandName: { color: C.white, fontSize: 22, fontWeight: '800', letterSpacing: 2 },
  brandTag: { color: '#8FB49C', fontSize: 11, marginTop: 2, letterSpacing: 0.4 },
  deptCard: { marginHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: RADIUS.md, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 18 },
  deptCardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 7 },
  deptNo: { color: C.fresh, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  deptName: { color: C.white, fontSize: 17, fontWeight: '800' },
  deptSub: { color: '#8FB49C', fontSize: 12, marginTop: 3 },
  navScroll: { flex: 1, paddingHorizontal: 12 },
  groupLabel: { color: '#5E8A70', fontSize: 10, fontWeight: '800', letterSpacing: 1.3, marginTop: 16, marginBottom: 7, marginLeft: 12 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 12, borderRadius: RADIUS.sm, position: 'relative' },
  navActive: { backgroundColor: 'rgba(140,207,69,0.14)' },
  activeBar: { position: 'absolute', left: 0, top: 9, bottom: 9, width: 3, borderRadius: 2, backgroundColor: C.fresh },
  navText: { color: '#A9C3B4', fontSize: 14, fontWeight: '600', flex: 1 },
  navTextActive: { color: C.white, fontWeight: '800' },
  switchBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 18, paddingVertical: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.09)' },
  switchText: { color: '#CFE3D5', fontSize: 14, fontWeight: '600', flex: 1 },
  sideBottom: { height: 132, justifyContent: 'flex-end', marginTop: 6 },
  sideBottomShade: { position: 'absolute', inset: 0 },
  sideFoot: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.16)' },
  footName: { color: C.white, fontSize: 13, fontWeight: '700' },
  footRole: { color: '#8FB49C', fontSize: 11, marginTop: 2 },
  drawerWrap: { position: 'absolute', inset: 0, zIndex: 50 },
  backdrop: { position: 'absolute', inset: 0, backgroundColor: 'rgba(8,32,20,0.5)' },
  drawer: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 270 },
  main: { flex: 1, minWidth: 0 },
  topbar: { height: 72, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, gap: 16 },
  crumbs: { flexDirection: 'row', alignItems: 'center', gap: 7, minWidth: 0, flexShrink: 1 },
  crumbRoot: { color: C.muted, fontSize: 14, fontWeight: '700' },
  crumbDept: { color: C.forest, fontSize: 14, fontWeight: '700' },
  crumbPage: { color: C.text, fontSize: 14, fontWeight: '700' },
  searchBox: { width: 250, flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: C.cream, borderRadius: RADIUS.sm, paddingHorizontal: 12, height: 38 },
  searchPlaceholder: { color: C.muted, fontSize: 13, flex: 1 },
  searchKey: { color: C.muted, fontSize: 12, borderWidth: 1, borderColor: C.border, borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 },
  iconBtn: { padding: 7, position: 'relative' },
  bellBadge: { position: 'absolute', right: 2, top: 2, backgroundColor: C.danger, minWidth: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  bellText: { color: C.white, fontSize: 10, fontWeight: '800' },
  profileBtn: { flexDirection: 'row', alignItems: 'center' },
  profName: { color: C.text, fontSize: 13, fontWeight: '700' },
  profRole: { color: C.muted, fontSize: 11, marginTop: 1 },
  content: { flex: 1 },
  contentPad: { padding: 24, maxWidth: 1400, width: '100%', alignSelf: 'center' },
});
