import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Text } from '../Text';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BankLogo, MCI, MI } from '../ui';
import { get } from '../../lib/api';
import { useApp, useLive } from '../../lib/store';
import { C } from '../../lib/theme';
import { inr } from '../../lib/format';
import { G } from './HomeTab';

function Card({ children, style }) {
  return <View style={[{ marginHorizontal: 16, marginTop: 16, backgroundColor: '#F3F6FC', borderRadius: 24, padding: 18 }, style]}>{children}</View>;
}

export default function MoneyTab() {
  const { accounts, home } = useApp();
  const insets = useSafeAreaInsets();
  const [txns, setTxns] = useState([]);
  useLive(() => { get('/transactions').then((r) => setTxns(r.transactions)).catch(() => {}); });

  const start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0);
  const month = txns.filter((t) => t.createdAt >= start.getTime() && t.status === 'success' && t.type !== 'self');
  const spent = month.filter((t) => t.direction === 'out').reduce((s, t) => s + t.amount, 0);
  const received = month.filter((t) => t.direction === 'in').reduce((s, t) => s + t.amount, 0);
  const max = Math.max(spent, received, 1);
  const byCat = {};
  month.filter((t) => t.direction === 'out').forEach((t) => { const k = t.category || 'Transfer'; byCat[k] = (byCat[k] || 0) + t.amount; });
  const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const CAT_COLORS = ['#1A73E8', '#E8710A', '#188038', '#9334E6'];

  return (
    <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
      <Text style={{ fontSize: 30, color: G.title, paddingHorizontal: 20, marginTop: 8 }}>Money</Text>

      <Card>
        <Text style={{ fontSize: 14, color: G.sub }}>{start.toLocaleString('en-US', { month: 'long' })} so far</Text>
        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, color: G.sub }}>Spent</Text>
            <Text style={{ fontSize: 26, color: G.title, marginTop: 2 }}>{inr(spent)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, color: G.sub }}>Received</Text>
            <Text style={{ fontSize: 26, color: C.green, marginTop: 2 }}>{inr(received)}</Text>
          </View>
        </View>
        <View style={{ marginTop: 14, gap: 8 }}>
          <View style={{ height: 10, borderRadius: 5, backgroundColor: '#E1E6EE' }}><View style={{ height: 10, borderRadius: 5, width: `${(spent / max) * 100}%`, backgroundColor: C.blue }} /></View>
          <View style={{ height: 10, borderRadius: 5, backgroundColor: '#E1E6EE' }}><View style={{ height: 10, borderRadius: 5, width: `${(received / max) * 100}%`, backgroundColor: C.green }} /></View>
        </View>
        {cats.length > 0 && (
          <View style={{ marginTop: 16, gap: 8 }}>
            {cats.map(([k, v], i) => (
              <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: CAT_COLORS[i] }} />
                <Text style={{ flex: 1, color: G.title, fontSize: 14 }}>{k}</Text>
                <Text style={{ color: G.title, fontSize: 14 }}>{inr(v)}</Text>
              </View>
            ))}
          </View>
        )}
        <Pressable onPress={() => router.push('/history')} style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: C.blueDark, fontWeight: '600', fontSize: 15 }}>See all transactions</Text>
          <MI name="chevron-right" size={22} color={C.blueDark} />
        </Pressable>
      </Card>

      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ flex: 1, fontSize: 19, color: G.title }}>Bank accounts</Text>
          <Pressable onPress={() => router.push({ pathname: '/link-bank', params: { from: 'settings' } })}><Text style={{ color: C.blueDark, fontWeight: '600' }}>Add</Text></Pressable>
        </View>
        {accounts.map((a) => (
          <Pressable key={a.id} onPress={() => router.push('/balance')} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10 }}>
            <BankLogo account={a} size={40} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, color: G.title }}>{a.bankName} ••{a.last4}</Text>
              <Text style={{ fontSize: 13, color: G.sub }}>{a.primary ? 'Primary · ' : ''}{a.type}</Text>
            </View>
            <Text style={{ color: C.blueDark, fontWeight: '600' }}>Check balance</Text>
          </Pressable>
        ))}
      </Card>

      <Card style={{ paddingVertical: 6, paddingHorizontal: 0 }}>
        {[
          ['trophy-outline', 'Rewards earned', inr(home?.rewardsTotal || 0), () => router.push('/rewards')],
          ['receipt', 'Bills & recharges', 'Pay and track bills', () => router.push('/bills')],
          ['swap-horizontal', 'Self transfer', 'Between your accounts', () => router.push('/self-transfer')],
          ['bank-transfer-out', 'Bank transfer', 'To any account + IFSC', () => router.push('/bank-transfer')],
        ].map(([icon, title, sub, onPress]) => (
          <Pressable key={title} onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 18, paddingHorizontal: 18, paddingVertical: 12 }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#D3E3FD', alignItems: 'center', justifyContent: 'center' }}>
              <MCI name={icon} size={22} color={C.blueDark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, color: G.title }}>{title}</Text>
              <Text style={{ fontSize: 13, color: G.sub }}>{sub}</Text>
            </View>
            <MI name="chevron-right" size={22} color={G.sub} />
          </Pressable>
        ))}
      </Card>
    </ScrollView>
  );
}
