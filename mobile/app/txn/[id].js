import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, Share, View } from 'react-native';
import { Text } from '../../components/Text';
import { router, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import Svg, { Polygon } from 'react-native-svg';
import { Avatar, BankLogo, Screen, Sym } from '../../components/ui';
import { get } from '../../lib/api';
import { useApp, useLive } from '../../lib/store';
import { C, z } from '../../lib/theme';
import { inr, receiptDate } from '../../lib/format';

const TITLE = '#1F1F1F';
const SUB = '#444746';
const BLUE = '#0B57D0';
const DONE = '#1E8E3E';
const ICON = { bill: 'receipt', recharge: 'cellphone', cashback: 'gift', refund: 'cash-refund', bank_transfer: 'bank', self: 'swap-horizontal', admin: 'tune' };

// "rahulsharma@ggpay" -> "••••sharma@ggpay"
function mask(handle) {
  if (!handle || !handle.includes('@')) return handle || '';
  const [local, domain] = handle.split('@');
  return `••••${local.slice(-6)}@${domain}`;
}

// Stable app-level reference shown like a wallet transaction ID.
function appTxnId(id) {
  const raw = id.replace(/^txn_/, '');
  const alpha = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  return 'CICAg' + [...raw].map((ch, i) => alpha[(parseInt(ch, 16) * 7 + i * 13) % alpha.length]).join('');
}

function Detail({ label, value, sub, copy }) {
  const { toast } = useApp();
  return (
    <Pressable onLongPress={copy ? async () => { await Clipboard.setStringAsync(String(value)); toast('Copied'); } : undefined} style={{ marginTop: z(14) }}>
      <Text style={{ fontSize: 16.5, color: TITLE, lineHeight: 23 }}>{label}</Text>
      {!!value && <Text style={{ fontSize: 15.5, color: SUB, marginTop: z(3) }} selectable>{value}</Text>}
      {!!sub && <Text style={{ fontSize: 15.5, color: SUB, marginTop: z(3) }}>{sub}</Text>}
    </Pressable>
  );
}

function Pill({ icon, label, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: z(6), height: z(40), paddingHorizontal: z(14), borderRadius: z(20), borderWidth: 1, borderColor: '#C4C7C5' }, pressed && { backgroundColor: '#EEF3FD' }]}>
      <Sym name={icon} size={18} color={BLUE} />
      <Text style={{ fontSize: 14.5, color: BLUE, fontWeight: '500' }}>{label}</Text>
    </Pressable>
  );
}

// "POWERED BY UPI" mark drawn with shapes.
function PoweredByUpi() {
  return (
    <View style={{ alignItems: 'center', marginTop: z(18) }}>
      <Text style={{ fontSize: 8, color: SUB, letterSpacing: 1 }}>POWERED BY</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: z(3) }}>
        <Text style={{ fontSize: 22, fontWeight: '700', fontStyle: 'italic', color: '#5F6368', letterSpacing: 0.5 }}>UPI</Text>
        <Svg width={z(18)} height={z(18)} viewBox="0 0 24 24">
          <Polygon points="4,3 13,12 4,21" fill="#1E8E3E" />
          <Polygon points="11,3 20,12 11,21" fill="#F4511E" />
        </Svg>
      </View>
    </View>
  );
}

// Grey placeholder blocks that pulse while the receipt loads.
function Shimmer() {
  const pulse = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0.5, duration: 600, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  const block = (w, h, mt, r = 8) => <View style={{ width: w, height: z(h), marginTop: z(mt), borderRadius: z(r), backgroundColor: '#E8EAED', alignSelf: 'center' }} />;
  return (
    <Animated.View style={{ opacity: pulse, paddingHorizontal: z(20), paddingTop: z(56) }}>
      {block(z(52), 52, 0, 26)}
      {block('55%', 18, 18)}
      {block('45%', 44, 14)}
      {block('35%', 18, 18)}
      {block('100%', 200, 28, 20)}
    </Animated.View>
  );
}

export default function TxnDetails() {
  const { id } = useLocalSearchParams();
  const { toast, settings } = useApp();
  const [t, setT] = useState(null);
  const [open, setOpen] = useState(false);
  const appName = settings?.appName || 'GGPay';
  useLive(() => { get(`/transactions/${id}`).then((r) => setT(r.transaction)).catch(() => {}); }, [id]);

  if (!t) return <Screen><Shimmer /></Screen>;

  const out = t.direction === 'out';
  const cp = t.counterparty;
  const ok = t.status === 'success';
  const failed = t.status === 'failed';
  const statusColor = ok ? DONE : failed ? C.red : C.amber;
  const myAccount = out ? t.fromAccount : t.toAccount;
  const otherAccount = out ? t.toAccount : t.fromAccount;
  const help = () => router.push({ pathname: '/help', params: { txnId: t.id, subject: `Issue with payment of ${inr(t.amount)} (${t.upiRef})` } });
  const share = () => Share.share({
    message: `${out ? 'Paid' : 'Received'} ${inr(t.amount, { decimals: true })} ${out ? 'to' : 'from'} ${cp.name}\n${receiptDate(t.createdAt)}\nStatus: ${ok ? 'Completed' : t.status}\nUPI transaction ID: ${t.upiRef}\nvia ${appName}`,
  });

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: z(8), height: z(56) }}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={{ padding: z(8) }}><Sym name="arrow_back" size={24} color={TITLE} /></Pressable>
        <View style={{ flex: 1 }} />
        <Pressable hitSlop={10} onPress={help} style={{ padding: z(8) }}><Sym name="error" size={22} color={SUB} /></Pressable>
        <Pressable hitSlop={10} onPress={share} style={{ padding: z(8) }}><Sym name="more_vert" size={24} color={TITLE} /></Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: z(20), paddingBottom: z(24) }}>
        <View style={{ alignItems: 'center' }}>
          {cp.user ? <Avatar user={cp.user} size={48} /> : <Avatar name={cp.name} size={48} color="#5F6368" icon={ICON[t.type] || 'bank'} />}
          <Text style={{ fontSize: 17.5, color: TITLE, marginTop: z(14), textAlign: 'center' }}>{t.type === 'self' ? 'Self transfer to ' : out ? 'To ' : 'From '}{cp.name}</Text>
          <Text style={{ fontSize: 58, color: failed ? SUB : TITLE, marginTop: z(4), textDecorationLine: failed ? 'line-through' : 'none' }}>{inr(t.amount)}</Text>
          {out && cp.user && t.type === 'p2p' ? (
            <Pressable onPress={() => router.push({ pathname: '/pay', params: { userId: cp.user.id, amount: String(t.amount) } })}
              style={{ backgroundColor: BLUE, borderRadius: z(20), paddingHorizontal: z(20), height: z(40), justifyContent: 'center', marginTop: z(10) }}>
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '500' }}>Pay again</Text>
            </Pressable>
          ) : (
            <View style={{ backgroundColor: '#F0F4F9', borderRadius: z(8), paddingHorizontal: z(16), paddingVertical: z(8), marginTop: z(10) }}>
              <Text style={{ color: SUB, fontSize: 14 }}>{t.type === 'cashback' ? `Cashback from ${appName} Rewards` : t.type === 'refund' ? 'Refund' : out ? (t.note || 'Payment') : `Payment from ${appName}`}</Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: z(8), marginTop: z(18), paddingBottom: z(8), paddingHorizontal: z(14), borderBottomWidth: 1, borderColor: '#C4C7C5' }}>
            <Sym name={ok ? 'check_circle' : failed ? 'cancel' : 'schedule'} fill size={20} color={statusColor} />
            <Text style={{ fontSize: 17, color: TITLE }}>{ok ? 'Completed' : failed ? 'Failed' : 'Pending'}</Text>
          </View>
          <Text style={{ fontSize: 16, color: TITLE, marginTop: z(12) }}>{receiptDate(t.createdAt)}</Text>
          {failed && !!t.failureReason && <Text style={{ fontSize: 13.5, color: C.red, marginTop: z(8), textAlign: 'center' }}>{t.failureReason}</Text>}
          {!!t.refundedBy && <Text style={{ fontSize: 13.5, color: BLUE, marginTop: z(8) }}>This payment was refunded</Text>}
        </View>

        <View style={{ marginTop: z(22), borderWidth: 1, borderColor: '#C4C7C5', borderRadius: z(18), overflow: 'hidden' }}>
          <Pressable onPress={() => setOpen(!open)} style={{ flexDirection: 'row', alignItems: 'center', gap: z(14), padding: z(14), borderBottomWidth: 1, borderColor: '#C4C7C5' }}>
            {myAccount ? <BankLogo account={myAccount} size={36} /> : <Avatar name="G" size={36} color={C.blue} icon="wallet" />}
            <Text style={{ flex: 1, fontSize: 17.5, color: TITLE }}>{myAccount ? `${myAccount.bankShort} Bank ${myAccount.last4}` : appName}</Text>
            <Sym name={open ? 'expand_less' : 'expand_more'} size={24} color={SUB} />
          </Pressable>
          {open && (
            <View style={{ paddingHorizontal: z(18), paddingVertical: z(14), borderBottomWidth: 1, borderColor: '#C4C7C5' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: z(16) }}>
                <View style={{ width: z(20), alignItems: 'center' }}><View style={{ width: z(11), height: z(11), borderRadius: z(6), backgroundColor: C.blue }} /></View>
                <Text style={{ fontSize: 16.5, color: TITLE }}>Payment started</Text>
              </View>
              <View style={{ width: 2, height: z(20), backgroundColor: '#747775', marginLeft: z(9) }} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: z(16) }}>
                <Sym name={ok ? 'check_circle' : failed ? 'cancel' : 'schedule'} fill size={20} color={statusColor} />
                <Text style={{ fontSize: 16.5, color: statusColor }}>{ok ? 'Payment completed' : failed ? 'Payment failed' : 'Payment pending'}</Text>
              </View>
            </View>
          )}
          <View style={{ paddingHorizontal: z(18), paddingBottom: z(16) }}>
            <Detail label="UPI transaction ID" value={t.upiRef} copy />
            <Detail label={`To: ${t.toName}`} sub={t.type === 'bill' || t.type === 'recharge' || t.type === 'bank_transfer' ? t.toHandle : `${mask(t.toHandle)} on ${appName}`} />
            <Detail label={`From: ${t.fromName.toUpperCase()}${(out ? myAccount : otherAccount) ? ` (${(out ? myAccount : otherAccount).bankShort} Bank)` : ''}`} sub={t.fromHandle ? `${mask(t.fromHandle)} on ${appName}` : null} />
            <Detail label={`${appName} transaction ID`} value={appTxnId(t.id)} copy />
          </View>
        </View>

        {!out && <Text style={{ fontSize: 12.5, color: SUB, textAlign: 'center', marginTop: z(18), lineHeight: 17 }}>Payments may take up to 3 working days to be reflected in your account</Text>}
        <PoweredByUpi />
      </ScrollView>

      <View style={{ flexDirection: 'row', justifyContent: out ? 'flex-start' : 'center', gap: z(8), paddingHorizontal: z(14), paddingVertical: z(12) }}>
        <Pill icon="help" label="Having issues?" onPress={help} />
        <Pill icon="share" label="Share" onPress={share} />
        {out && <Pill icon="group" label="Split expense" onPress={() => (cp.user ? router.push({ pathname: '/pay', params: { userId: cp.user.id, mode: 'request', amount: String(Math.round(t.amount / 2)) } }) : toast('Split works with people payments'))} />}
      </View>
    </Screen>
  );
}
