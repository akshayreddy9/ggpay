import { useMemo, useState } from 'react';
import { Pressable, ScrollView, SectionList, View } from 'react-native';
import { Text, TextInput } from '../components/Text';
import { router } from 'expo-router';
import { Avatar, Empty, Loading, MI, Screen, Sheet } from '../components/ui';
import { get } from '../lib/api';
import { useApp, useLive } from '../lib/store';
import { C } from '../lib/theme';
import { dayMonth, inr, MONTH_NAMES } from '../lib/format';

const ICON = { bill: 'receipt', recharge: 'cellphone', cashback: 'gift', refund: 'cash-refund', bank_transfer: 'bank', self: 'swap-horizontal', admin: 'tune' };
const TITLE = '#1F1F1F';
const SUB = '#444746';

export function TxnRow({ t }) {
  const out = t.direction === 'out';
  const cp = t.counterparty;
  const failed = t.status === 'failed';
  const name = t.type === 'self' ? 'Self transfer' : cp.name;
  return (
    <Pressable onPress={() => router.push(`/txn/${t.id}`)} android_ripple={{ color: '#eee' }} style={({ pressed }) => [{ flexDirection: 'row', paddingHorizontal: 22, paddingVertical: 16, gap: 20 }, pressed && { backgroundColor: '#ECEFF3' }]}>
      {cp.user ? <Avatar user={cp.user} size={44} /> : <Avatar name={name} size={44} color={t.type === 'cashback' ? '#E37400' : '#5F6368'} icon={ICON[t.type]} />}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 19.5, color: TITLE, lineHeight: 27, fontWeight: '500' }} numberOfLines={2}>{name}</Text>
        <Text style={{ fontSize: 16.5, color: SUB, marginTop: 3 }}>{dayMonth(t.createdAt)}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 19.5, fontWeight: '500', color: failed ? SUB : out ? TITLE : C.green }}>{out || failed ? '' : '+ '}{inr(t.amount)}</Text>
        {failed && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <MI name="cancel" fill size={17} color={C.red} />
            <Text style={{ fontSize: 16, color: C.red }}>Failed</Text>
          </View>
        )}
        {t.status === 'pending' && <Text style={{ fontSize: 14, color: C.amber, marginTop: 4 }}>Pending</Text>}
      </View>
    </Pressable>
  );
}

function FilterChip({ label, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 44, paddingLeft: 16, paddingRight: 10, borderRadius: 10, borderWidth: 1, borderColor: active ? '#D3E3FD' : '#C4C7C5', backgroundColor: active ? '#D3E3FD' : '#fff' }}>
      <Text style={{ fontSize: 17.5, color: active ? '#041E49' : SUB, fontWeight: '500' }}>{label}</Text>
      <MI name="arrow-drop-down" size={22} color={active ? '#041E49' : SUB} />
    </Pressable>
  );
}

const STATUS = [['all', 'All'], ['success', 'Completed'], ['pending', 'Pending'], ['failed', 'Failed']];
const DATES = [['all', 'All time'], ['7', 'Last 7 days'], ['30', 'Last 30 days'], ['90', 'Last 90 days'], ['month', 'This month']];

export default function History() {
  const { accounts, toast } = useApp();
  const [txns, setTxns] = useState(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [method, setMethod] = useState('all');
  const [range, setRange] = useState('all');
  const [kind, setKind] = useState('all');
  const [sheet, setSheet] = useState(null);

  useLive(() => { get('/transactions').then((r) => setTxns(r.transactions)).catch(() => setTxns([])); });

  const sections = useMemo(() => {
    if (!txns) return [];
    const now = Date.now();
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    const since = range === 'all' ? 0 : range === 'month' ? monthStart.getTime() : now - Number(range) * 86400000;
    const query = q.toLowerCase().trim();
    const list = txns.filter((t) => {
      if (status !== 'all' && t.status !== status) return false;
      if (method !== 'all' && (t.direction === 'out' ? t.fromAccount?.id : t.toAccount?.id) !== method) return false;
      if (t.createdAt < since) return false;
      if (kind === 'sent' && t.direction !== 'out') return false;
      if (kind === 'received' && t.direction !== 'in') return false;
      if (query && !`${t.counterparty.name} ${t.note} ${t.upiRef} ${t.amount}`.toLowerCase().includes(query)) return false;
      return true;
    });
    const groups = [];
    list.forEach((t) => {
      const d = new Date(t.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      let g = groups[groups.length - 1];
      if (!g || g.key !== key) { g = { key, year: d.getFullYear(), month: MONTH_NAMES[d.getMonth()], data: [], net: 0 }; groups.push(g); }
      g.data.push(t);
      if (t.status === 'success' && t.type !== 'self') g.net += t.direction === 'in' ? t.amount : -t.amount;
    });
    return groups;
  }, [txns, q, status, method, range, kind]);

  const label = (list, v, fallback) => (v === 'all' ? fallback : list.find((x) => x[0] === v)?.[1]);
  const methodName = method === 'all' ? 'Payment method' : (() => { const a = accounts.find((x) => x.id === method); return a ? `${a.bankShort} ••${a.last4}` : 'Payment method'; })();

  const options = sheet === 'status' ? [STATUS, status, setStatus, 'Status']
    : sheet === 'method' ? [[['all', 'All payment methods'], ...accounts.map((a) => [a.id, `${a.bankName} ••${a.last4}`])], method, setMethod, 'Payment method']
      : sheet === 'date' ? [DATES, range, setRange, 'Date']
        : sheet === 'type' ? [[['all', 'All'], ['sent', 'Sent'], ['received', 'Received']], kind, setKind, 'Type'] : null;

  return (
    <Screen>
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <View style={{ height: 60, borderRadius: 30, borderWidth: 1, borderColor: '#747775', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 }}>
          <Pressable hitSlop={8} onPress={() => router.back()} style={{ padding: 8 }}><MI name="arrow-back" size={24} color={TITLE} /></Pressable>
          <TextInput value={q} onChangeText={setQ} placeholder="Search transactions" placeholderTextColor={SUB} style={{ flex: 1, fontSize: 20, color: TITLE, marginLeft: 6 }} />
          {q ? <Pressable onPress={() => setQ('')} style={{ padding: 8 }}><MI name="close" size={22} color={TITLE} /></Pressable>
            : <Pressable onPress={() => toast(`${txns?.length || 0} transactions in total`)} style={{ padding: 8 }}><MI name="more-vert" size={24} color={TITLE} /></Pressable>}
        </View>
      </View>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingVertical: 14 }}>
          <FilterChip label={label(STATUS, status, 'Status')} active={status !== 'all'} onPress={() => setSheet('status')} />
          <FilterChip label={methodName} active={method !== 'all'} onPress={() => setSheet('method')} />
          <FilterChip label={label(DATES, range, 'Date')} active={range !== 'all'} onPress={() => setSheet('date')} />
          <FilterChip label={kind === 'all' ? 'Type' : kind === 'sent' ? 'Sent' : 'Received'} active={kind !== 'all'} onPress={() => setSheet('type')} />
        </ScrollView>
      </View>

      {!txns ? <Loading /> : (
        <SectionList
          sections={sections}
          keyExtractor={(t) => t.id}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <View style={{ backgroundColor: '#F3F6FC', paddingHorizontal: 22, paddingVertical: 18, marginTop: 4, flexDirection: 'row', alignItems: 'flex-end' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15.5, color: SUB }}>{section.year}</Text>
                <Text style={{ fontSize: 28, color: TITLE, marginTop: 2 }}>{section.month}</Text>
              </View>
              <Text style={{ fontSize: 27, color: section.net > 0 ? C.green : TITLE, marginBottom: 2 }}>
                {section.net > 0 ? '+ ' : ''}{inr(Math.abs(section.net))}
              </Text>
            </View>
          )}
          renderItem={({ item }) => <TxnRow t={item} />}
          ListEmptyComponent={<Empty icon="history" title="No transactions found" subtitle="Try changing the filters" />}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}

      <Sheet visible={!!options} onClose={() => setSheet(null)} title={options?.[3]}>
        {options?.[0].map(([v, l]) => (
          <Pressable key={v} onPress={() => { options[2](v); setSheet(null); }} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 16 }}>
            <MI name={options[1] === v ? 'radio-button-checked' : 'radio-button-unchecked'} size={22} color={options[1] === v ? C.blueDark : SUB} />
            <Text style={{ fontSize: 16, color: TITLE }}>{l}</Text>
          </Pressable>
        ))}
      </Sheet>
    </Screen>
  );
}
