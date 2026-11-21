import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { Megaphone, Send, ShieldCheck, Trash2, MessageSquare, Building2, RefreshCw } from 'lucide-react-native';
import { C, DEPARTMENTS, RADIUS } from '../theme';
import type { Dept } from '../types';
import { announcements as api } from '../services/backend';
import { Badge, Button, Card, Empty, Header, Row, SectionHead, Avatar } from './ui';

interface Reply { id: string; department: string; author_name: string; body: string; created_at: string }
interface Announcement {
  id: string; title: string; body: string; audience: string; priority: string;
  author_department: string; author_name: string; created_at: string; replies: Reply[];
}

const FALLBACK: Announcement[] = [
  {
    id: 'ANN-DEMO-1', title: 'Welcome to the HAPFAM integrated workspace',
    body: 'All three departments now share one record store. Please raise material requests through Production and record inspection decisions in Quality.',
    audience: 'all', priority: 'normal', author_department: 'management', author_name: 'Elijah Kubanja',
    created_at: new Date().toISOString(),
    replies: [{ id: 'REP-DEMO-1', department: 'inventory', author_name: 'Alice Wambui', body: 'Inventory is ready to receive deliveries.', created_at: new Date().toISOString() }],
  },
];

export function AnnouncementCenter({ dept, compact = false }: { dept: Dept; compact?: boolean }) {
  const isManager = dept === 'management';
  const [items, setItems] = useState<Announcement[]>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('all');
  const [priority, setPriority] = useState('normal');
  const [replyFor, setReplyFor] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await api.list();
      setItems(data); setOnline(true);
    } catch { setOnline(false); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const visible = isManager ? items : items.filter(a => a.audience === 'all' || a.audience === dept);

  const compose = async () => {
    if (!title.trim() || !body.trim()) { setMessage('Title and message are required.'); return; }
    setBusy(true);
    try {
      await api.create({ title, body, audience, priority });
      setTitle(''); setBody(''); setMessage('Announcement sent to all selected departments.');
      await load();
    } catch (e: any) { setMessage(e.message || 'Could not send. Backend unavailable.'); }
    finally { setBusy(false); }
  };

  const sendReply = async (id: string) => {
    if (!replyText.trim()) { setMessage('Please enter a reply.'); return; }
    setBusy(true);
    try {
      await api.reply(id, replyText);
      setReplyText(''); setReplyFor(null); setMessage('Reply sent — Management and other departments were notified.');
      await load();
    } catch (e: any) { setMessage(e.message || 'Could not send reply. Backend unavailable.'); }
    finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    try { await api.remove(id); await load(); } catch { setMessage('Could not delete announcement.'); }
  };

  if (compact) {
    return (
      <View>
        {visible.slice(0, 3).map(a => (
          <Row key={a.id} style={compactRow}>
            <View style={compactIcon}><Megaphone size={15} color={C.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={compactTitle} numberOfLines={1}>{a.title}</Text>
              <Text style={compactBody} numberOfLines={1}>From {a.author_department}{isManager ? ` · ${a.replies.length} replies` : ''}</Text>
            </View>
          </Row>
        ))}
      </View>
    );
  }

  return (
    <View>
      <Header title="Announcements" subtitle={isManager ? 'Broadcast to departments and track every reply.' : 'Messages from Management — reply to communicate across departments.'}
        right={<Pressable onPress={load} style={refreshBtn}><RefreshCw size={15} color={C.primary} /><Text style={refreshText}>Refresh</Text></Pressable>} />

      <Row style={statusRow}>
        <Badge label={online ? 'Connected to HAPFAM API' : 'Offline demo mode'} tone={online ? 'success' : 'warning'} />
        <Text style={statusText}>{visible.length} announcement(s)</Text>
      </Row>

      {isManager ? (
        <Card style={{ marginBottom: 18 }}>
          <SectionHead eyebrow="Management broadcast" title="New Announcement" subtitle="Sent to every selected department with a notification." />
          <Text style={label}>Title</Text>
          <TextInput value={title} onChangeText={setTitle} placeholder="e.g. Line maintenance tomorrow" placeholderTextColor={C.muted} style={input} />
          <Text style={label}>Message</Text>
          <TextInput value={body} onChangeText={setBody} placeholder="Write the announcement…" placeholderTextColor={C.muted} multiline style={[input, textarea]} />
          <Text style={label}>Audience</Text>
          <Row style={pills}>
            {['all', 'production', 'inventory', 'quality'].map(o => (
              <Pressable key={o} onPress={() => setAudience(o)} style={[pill, audience === o && pillOn]}>
                <Text style={[pillText, audience === o && pillTextOn]}>{o === 'all' ? 'All departments' : DEPARTMENTS[o as Dept]?.name || o}</Text>
              </Pressable>
            ))}
          </Row>
          <Text style={label}>Priority</Text>
          <Row style={pills}>
            {['normal', 'high'].map(o => (
              <Pressable key={o} onPress={() => setPriority(o)} style={[pill, priority === o && pillOn]}>
                <Text style={[pillText, priority === o && pillTextOn]}>{o === 'high' ? 'High priority' : 'Normal'}</Text>
              </Pressable>
            ))}
          </Row>
          <View style={sendRow}>
            {message ? <Text style={messageText}>{message}</Text> : null}
            <Button label={busy ? 'Sending…' : 'Send announcement'} icon={<Send size={15} color={C.white} />} onPress={compose} disabled={busy} />
          </View>
        </Card>
      ) : null}

      {loading ? <View style={loadingBox}><ActivityIndicator color={C.primary} /><Text style={loadingText}>Loading announcements…</Text></View> : null}

      {!loading && visible.length === 0 ? <Empty title="No announcements" text="Messages from Management will appear here." /> : null}

      {visible.map(a => (
        <Card key={a.id} style={{ marginBottom: 14 }}>
          <Row style={annHead}>
            <View style={annIcon}><Megaphone size={18} color={a.priority === 'high' ? C.warning : C.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={annTitle}>{a.title}</Text>
              <Row style={annMeta}>
                <Badge label={a.author_department.toUpperCase()} tone="forest" />
                <Text style={annBy}>{a.author_name} · {new Date(a.created_at).toLocaleDateString()}</Text>
                {a.priority === 'high' ? <Badge label="High priority" tone="warning" /> : null}
              </Row>
            </View>
            {isManager ? <Pressable onPress={() => remove(a.id)} hitSlop={8}><Trash2 size={17} color={C.danger} /></Pressable> : null}
          </Row>
          <Text style={annBody}>{a.body}</Text>
          <View style={replySection}>
            {isManager ? (
            <>
            <Row style={replyHeading}><MessageSquare size={14} color={C.muted} /><Text style={replyHeadingText}>Replies ({a.replies.length}) · visible only to Management</Text></Row>
            {a.replies.length === 0 ? <Text style={noReplies}>No replies yet.</Text> : a.replies.map(r => (
              <View key={r.id} style={replyItem}>
                <Avatar name={r.author_name} size={28} />
                <View style={{ flex: 1 }}>
                  <Row style={replyMeta}>
                    <Text style={replyAuthor}>{r.author_name}</Text>
                    <Badge label={r.department.toUpperCase()} tone={r.department === 'management' ? 'forest' : 'info'} />
                  </Row>
                  <Text style={replyBody}>{r.body}</Text>
                </View>
              </View>
            ))}
            </>
            ) : null}
            {replyFor === a.id ? (
              <View style={replyCompose}>
                <TextInput value={replyText} onChangeText={setReplyText} placeholder="Write a reply to Management and other departments…" placeholderTextColor={C.muted} multiline style={[input, textarea]} />
                <Row style={replyActions}>
                  <Button small label="Cancel" variant="outline" onPress={() => { setReplyFor(null); setReplyText(''); }} />
                  <Button small label="Send reply" icon={<Send size={13} color={C.white} />} onPress={() => sendReply(a.id)} disabled={busy} />
                </Row>
              </View>
            ) : (
              <Pressable onPress={() => { setReplyFor(a.id); setReplyText(''); }} style={replyBtn}>
                <MessageSquare size={14} color={C.primary} /><Text style={replyBtnText}>Reply as {DEPARTMENTS[dept]?.name || dept}</Text>
              </Pressable>
            )}
          </View>
        </Card>
      ))}
    </View>
  );
}

const inputStyle = { borderWidth: 1, borderColor: C.border, borderRadius: RADIUS.sm, paddingHorizontal: 13, height: 44, fontSize: 15, color: C.text, backgroundColor: C.white } as const;
const input = inputStyle;
const textarea = { height: 90, paddingTop: 12, textAlignVertical: 'top' as const };
const label = { fontSize: 14, fontWeight: '700' as const, color: C.text, marginTop: 12, marginBottom: 6 };
const compactRow = { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F2ED' };
const compactIcon = { width: 30, height: 30, borderRadius: 9, backgroundColor: C.successSoft, alignItems: 'center' as const, justifyContent: 'center' as const };
const compactTitle = { fontSize: 14, fontWeight: '700' as const, color: C.text };
const compactBody = { fontSize: 12, color: C.muted, marginTop: 2 };
const refreshBtn = { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: C.border, borderRadius: RADIUS.sm };
const refreshText = { fontSize: 14, color: C.primary, fontWeight: '700' as const };
const statusRow = { gap: 10, marginBottom: 16, alignItems: 'center' as const };
const statusText = { fontSize: 13, color: C.muted };
const pills = { gap: 8, flexWrap: 'wrap' as const, marginBottom: 4 };
const pill = { paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: C.border, backgroundColor: C.white };
const pillOn = { backgroundColor: C.forest, borderColor: C.forest };
const pillText = { fontSize: 13, color: C.muted, fontWeight: '700' as const };
const pillTextOn = { color: C.white };
const sendRow = { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, marginTop: 16, flexWrap: 'wrap' as const, gap: 10 };
const messageText = { fontSize: 13, color: C.primary, fontWeight: '600' as const };
const loadingBox = { alignItems: 'center' as const, padding: 30, gap: 8 };
const loadingText = { fontSize: 14, color: C.muted };
const annHead = { gap: 11, marginBottom: 12 };
const annIcon = { width: 38, height: 38, borderRadius: 11, backgroundColor: C.successSoft, alignItems: 'center' as const, justifyContent: 'center' as const };
const annTitle = { fontSize: 17, fontWeight: '800' as const, color: C.text };
const annMeta = { gap: 8, marginTop: 6, flexWrap: 'wrap' as const, alignItems: 'center' as const };
const annBy = { fontSize: 12, color: C.muted };
const annBody = { fontSize: 14, color: C.text, lineHeight: 21 };
const replySection = { marginTop: 14, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 12 };
const replyHeading = { gap: 6, marginBottom: 10 };
const replyHeadingText = { fontSize: 13, fontWeight: '800' as const, color: C.text };
const noReplies = { fontSize: 13, color: C.muted, fontStyle: 'italic' as const };
const replyItem = { flexDirection: 'row' as const, gap: 9, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F2F4F0' };
const replyMeta = { gap: 7, alignItems: 'center' as const };
const replyAuthor = { fontSize: 13, fontWeight: '800' as const, color: C.text };
const replyBody = { fontSize: 13, color: C.muted, marginTop: 4, lineHeight: 19 };
const replyCompose = { marginTop: 10 };
const replyActions = { gap: 8, justifyContent: 'flex-end' as const, marginTop: 8 };
const replyBtn = { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 6, marginTop: 10, paddingVertical: 8 };
const replyBtnText = { fontSize: 13, color: C.primary, fontWeight: '800' as const };
