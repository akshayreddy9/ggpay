import { useRef, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { Text } from '../../components/Text';
import { router, useLocalSearchParams } from 'expo-router';
import { Avatar, Btn, Header, Loading, MI, Screen } from '../../components/ui';
import { get, post } from '../../lib/api';
import { useApp, useFeature, useLive } from '../../lib/store';
import { C } from '../../lib/theme';
import { inr, shortDate } from '../../lib/format';

function TxnBubble({ item, other }) {
  const out = item.direction === 'out';
  const failed = item.status === 'failed';
  return (
    <Pressable onPress={() => router.push(`/txn/${item.id}`)} style={{ alignSelf: out ? 'flex-end' : 'flex-start', maxWidth: '78%', marginVertical: 6 }}>
      <View style={{ backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: C.line, padding: 16, minWidth: 200, borderBottomRightRadius: out ? 4 : 18, borderBottomLeftRadius: out ? 18 : 4 }}>
        <Text style={{ fontSize: 13, color: C.muted }}>
          {item.type === 'refund' ? 'Refund' : out ? `Payment to ${other.name.split(' ')[0]}` : `Payment to you`}
        </Text>
        <Text style={{ fontSize: 32, color: failed ? C.muted : C.text, marginTop: 4, textDecorationLine: failed ? 'line-through' : 'none' }}>{inr(item.amount)}</Text>
        {!!item.note && <Text style={{ fontSize: 14, color: C.text, marginTop: 2 }}>{item.note}</Text>}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}>
          {failed ? <MI name="error" size={16} color={C.red} /> : item.status === 'pending' ? <MI name="schedule" size={16} color={C.amber} /> : <MI name="check-circle" size={16} color={C.green} />}
          <Text style={{ fontSize: 13, color: failed ? C.red : C.muted, flex: 1 }}>{failed ? 'Failed' : item.status === 'pending' ? 'Pending' : out ? 'Paid' : 'Received'} · {shortDate(item.createdAt)}</Text>
          <MI name="chevron-right" size={18} color={C.faint} />
        </View>
      </View>
    </Pressable>
  );
}

function RequestBubble({ item, other, onPay, onDecline }) {
  const mine = item.mine;
  const pending = item.status === 'pending';
  return (
    <View style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '78%', marginVertical: 6 }}>
      <View style={{ backgroundColor: C.blueSoft, borderRadius: 18, padding: 16, minWidth: 220 }}>
        <Text style={{ fontSize: 13, color: C.muted }}>{mine ? `You requested from ${other.name.split(' ')[0]}` : `${other.name.split(' ')[0]} requested`}</Text>
        <Text style={{ fontSize: 32, color: C.text, marginTop: 4 }}>{inr(item.amount)}</Text>
        {!!item.note && <Text style={{ fontSize: 14, color: C.text }}>{item.note}</Text>}
        <Text style={{ fontSize: 13, color: C.muted, marginTop: 8 }}>{pending ? 'Pending' : item.status[0].toUpperCase() + item.status.slice(1)} · {shortDate(item.createdAt)}</Text>
        {pending && (
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            {!mine && <Btn title="Pay" onPress={onPay} style={{ height: 38, flex: 1 }} />}
            <Btn title={mine ? 'Cancel' : 'Decline'} variant="outline" onPress={onDecline} style={{ height: 38, flex: 1 }} />
          </View>
        )}
      </View>
    </View>
  );
}

export default function Chat() {
  const { id } = useLocalSearchParams();
  const { toast } = useApp();
  const canRequest = useFeature('requests');
  const [data, setData] = useState(null);
  const list = useRef(null);

  useLive(() => { get(`/thread/${id}`).then(setData).catch((e) => toast(e.message)); }, [id]);

  if (!data) return <Screen><Header /><Loading /></Screen>;
  const other = data.user;

  const items = [];
  let lastDay = '';
  data.items.forEach((it) => {
    const day = shortDate(it.at);
    if (day !== lastDay) { items.push({ kind: 'day', id: 'd' + it.at, label: day }); lastDay = day; }
    items.push(it);
  });

  return (
    <Screen>
      <Header
        title={other.name}
        subtitle={other.isMerchant ? other.merchantCategory : `+91 ${other.phone}`}
        right={<Pressable hitSlop={10} onPress={() => router.push({ pathname: '/my-qr', params: { userId: other.id } })} style={{ padding: 8 }}><MI name="info-outline" size={24} color={C.muted} /></Pressable>}
      />
      <FlatList
        ref={list}
        data={items}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{ padding: 16, flexGrow: 1, justifyContent: 'flex-end' }}
        onContentSizeChange={() => list.current?.scrollToEnd({ animated: false })}
        ListHeaderComponent={(
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Avatar user={other} size={72} />
            <Text style={{ fontSize: 20, color: C.text, marginTop: 12 }}>{other.name}</Text>
            <Text style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{other.upiId}</Text>
            {!data.items.length && <Text style={{ fontSize: 14, color: C.muted, marginTop: 18, textAlign: 'center' }}>Send money or request a payment to start your history with {other.name.split(' ')[0]}.</Text>}
          </View>
        )}
        renderItem={({ item }) => {
          if (item.kind === 'day') return <Text style={{ alignSelf: 'center', color: C.muted, fontSize: 12, marginVertical: 10 }}>{item.label}</Text>;
          if (item.kind === 'request') {
            return (
              <RequestBubble item={item} other={other}
                onPay={() => router.push({ pathname: '/pay', params: { userId: other.id, amount: String(item.amount), note: item.note, requestId: item.id } })}
                onDecline={() => post(`/requests/${item.id}/decline`).then(() => toast(item.mine ? 'Request cancelled' : 'Request declined')).catch((e) => toast(e.message))} />
            );
          }
          return <TxnBubble item={item} other={other} />;
        }}
      />
      <View style={{ flexDirection: 'row', gap: 10, padding: 12, borderTopWidth: 1, borderColor: C.line }}>
        <Btn title="Pay" onPress={() => router.push({ pathname: '/pay', params: { userId: other.id } })} style={{ flex: 1 }} />
        {canRequest && !other.isMerchant && <Btn title="Request" variant="outline" onPress={() => router.push({ pathname: '/pay', params: { userId: other.id, mode: 'request' } })} style={{ flex: 1 }} />}
      </View>
    </Screen>
  );
}
