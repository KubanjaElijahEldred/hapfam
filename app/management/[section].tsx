import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ShieldCheck, Bell, Activity, Settings2 } from 'lucide-react-native';
import { DepartmentShell } from '../../src/components/Shell';
import { Card, Header, Row, IconBox, Badge, Empty } from '../../src/components/ui';
import { audit as auditApi, notifications as notificationApi } from '../../src/services/backend';
import { useApp } from '../../src/store';
import { C } from '../../src/theme';

export default function Page() {
  const { section } = useLocalSearchParams<{ section: string }>();
  const app = useApp();
  const [rows, setRows] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (section === 'audit') setRows(await auditApi.list());
        else if (section === 'notifications' || section === 'activity') setRows(await notificationApi.list('management'));
      } catch { /* offline */ }
      setLoaded(true);
    })();
  }, [section]);

  if (section === 'notifications' || section === 'activity') {
    return (
      <DepartmentShell dept="management">
        <View>
          <Header title="Management Notifications" subtitle="Replies from departments and system events." />
          <Card>
            {rows.length === 0 ? <Empty title={loaded ? 'No notifications' : 'Loading…'} text="Department replies will appear here." /> : rows.map(n => (
              <Row key={n.id} style={{ paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#F0F2ED', gap: 11 }}>
                <IconBox tone={n.tone || 'info'} size={34}><Bell size={16} color={C.primary} /></IconBox>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: C.text }}>{n.title}</Text>
                  <Text style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{n.body}</Text>
                </View>
                <Badge label={n.department} tone="neutral" />
              </Row>
            ))}
          </Card>
        </View>
      </DepartmentShell>
    );
  }

  if (section === 'audit') {
    return (
      <DepartmentShell dept="management">
        <View>
          <Header title="Audit Trail" subtitle="Every important transaction with actor and timestamp." />
          <Card>
            {rows.length === 0 ? <Empty title={loaded ? 'No audit records' : 'Loading…'} text="Backend audit events appear here." /> : rows.map(a => (
              <Row key={a.id} style={{ paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#F0F2ED', gap: 11 }}>
                <IconBox tone="forest" size={34}><ShieldCheck size={16} color={C.primary} /></IconBox>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: C.text }}>{a.action} · {a.entity}</Text>
                  <Text style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{a.actor} · {a.details || a.id}</Text>
                </View>
                <Text style={{ fontSize: 12, color: C.muted }}>{new Date(a.created_at).toLocaleString()}</Text>
              </Row>
            ))}
          </Card>
        </View>
      </DepartmentShell>
    );
  }

  return (
    <DepartmentShell dept="management">
      <View>
        <Header title="Management Settings" subtitle="System configuration and access information." />
        <Card>
          <Row style={{ paddingVertical: 10, gap: 10 }}><Settings2 size={17} color={C.primary} /><Text style={{ fontSize: 14, color: C.text }}>Role: System Manager · Full cross-department oversight</Text></Row>
          <Row style={{ paddingVertical: 10, gap: 10 }}><ShieldCheck size={17} color={C.primary} /><Text style={{ fontSize: 14, color: C.text }}>Password policy: minimum 12 characters with upper, lower, number and symbol</Text></Row>
          <Row style={{ paddingVertical: 10, gap: 10 }}><Activity size={17} color={C.primary} /><Text style={{ fontSize: 14, color: C.text }}>Local activity records: {app.activities.length}</Text></Row>
        </Card>
      </View>
    </DepartmentShell>
  );
}
