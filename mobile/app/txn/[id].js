import { useState } from 'react';
import { Pressable, ScrollView, Share, View } from 'react-native';
import { Text } from '../../components/Text';
import { router, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Avatar, BankLogo, Loading, MCI, MI, Screen } from '../../components/ui';
import { get } from '../../lib/api';
import { useApp, useLive } from '../../lib/store';
import { C } from '../../lib/theme';
import { inr, receiptDate } from '../../lib/format';

const TITLE = '#1F1F1F';
const SUB = '#444746';
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
    <Pressable onLongPress={copy ? async () => { await Clipboard.setStringAsync(String(value)); toast('Copied'); } : undefined} style={{ marginTop: 16 }}>
      <Text style={{ fontSize: 18, color: TITLE, lineHeight: 25 }}>{label}</Text>
      {!!value && <Text style={{ fontSize: 17, color: SUB, marginTop: 4 }} selectable>{value}</Text>}
      {!!sub && <Text style={{ fontSize: 17, color: SUB, marginTop: 4 }}>{sub}</Text>}
    </Pressable>
  );
}

function Pill({ icon, label, onPress }) {
  return (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, height: 40, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: '#C4C7C5' }}>
      <MCI name={icon} size={18} color={C.blueDark} />
      <Text style={{ fontSize: 16.5, color: TITLE }}>{label}</Text>
    </Pressable>
  );
}

export default function TxnDetails() {
  const { id } = useLocalSearchParams();
  const { toast } = useApp();
  const [t, setT] = useState(null);
  const [open, setOpen] = useState(false);
  useLive(() => { get(`/transactions/${id}`).then((r) => setT(r.transaction)).catch(() => {}); }, [id]);

  if (!t) return <Screen><Loading /></Screen>;

  const out = t.direction === 'out';
  const cp = t.counterparty;
  const ok = t.status === 'success';
  const failed = t.status === 'failed';
  const myAccount = out ? t.fromAccount : t.toAccount;
  const otherAccount = out ? t.toAccount : t.fromAccount;
  const share = () => Share.share({
    message: `${out ? 'Paid' : 'Received'} ${inr(t.amount, { decimals: true })} ${out ? 'to' : 'from'} ${cp.name}\n${receiptDate(t.createdAt)}\nStatus: ${ok ? 'Completed' : t.status}\nUPI transaction ID: ${t.upiRef}\nvia GGPay`,
  });

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, height: 56 }}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={{ padding: 8 }}><MI name="arrow-back" size={24} color={TITLE} /></Pressable>
        <View style={{ flex: 1 }} />
        <Pressable hitSlop={10} onPress={() => router.push({ pathname: '/help', params: { txnId: t.id, subject: `Issue with payment of ${inr(t.amount)} (${t.upiRef})` } })} style={{ padding: 8 }}>
          <MI name="error-outline" size={22} color={SUB} />
        </Pressable>
        <Pressable hitSlop={10} onPress={share} style={{ padding: 8 }}><MI name="more-vert" size={24} color={TITLE} /></Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}>
        <View style={{ alignItems: 'center' }}>
          {cp.user ? <Avatar user={cp.user} size={50} /> : <Avatar name={cp.name} size={50} color="#5F6368" icon={ICON[t.type] || 'bank'} />}
          <Text style={{ fontSize: 20, color: TITLE, marginTop: 16, textAlign: 'center' }}>{t.type === 'self' ? 'Self transfer to ' : out ? 'To ' : 'From '}{cp.name}</Text>
          <Text style={{ fontSize: 66, color: failed ? SUB : TITLE, marginTop: 6, textDecorationLine: failed ? 'line-through' : 'none' }}>{inr(t.amount)}</Text>
          {out && cp.user && t.type === 'p2p' ? (
            <Pressable onPress={() => router.push({ pathname: '/pay', params: { userId: cp.user.id, amount: String(t.amount) } })}
              style={{ backgroundColor: C.blueDark, borderRadius: 22, paddingHorizontal: 22, height: 44, justifyContent: 'center', marginTop: 12 }}>
              <Text style={{ color: '#fff', fontSize: 17, fontWeight: '500' }}>Pay again</Text>
            </Pressable>
          ) : (
            <View style={{ backgroundColor: '#F3F6FC', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8, marginTop: 10 }}>
              <Text style={{ color: SUB, fontSize: 15 }}>{t.type === 'cashback' ? 'Cashback from GGPay Rewards' : t.type === 'refund' ? 'Refund' : out ? (t.note || 'Payment') : 'Payment from GGPay'}</Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20, paddingBottom: 10, paddingHorizontal: 30, borderBottomWidth: 1, borderColor: '#C4C7C5' }}>
            <MI name={ok ? 'check-circle' : failed ? 'cancel' : 'schedule'} fill size={22} color={ok ? C.green : failed ? C.red : C.amber} />
            <Text style={{ fontSize: 19.5, color: TITLE }}>{ok ? 'Completed' : failed ? 'Failed' : 'Pending'}</Text>
          </View>
          <Text style={{ fontSize: 18.5, color: TITLE, marginTop: 14 }}>{receiptDate(t.createdAt)}</Text>
          {failed && !!t.failureReason && <Text style={{ fontSize: 14, color: C.red, marginTop: 8, textAlign: 'center' }}>{t.failureReason}</Text>}
          {!!t.refundedBy && <Text style={{ fontSize: 14, color: C.blueDark, marginTop: 8 }}>This payment was refunded</Text>}
        </View>

        <View style={{ marginTop: 26, borderWidth: 1, borderColor: '#C4C7C5', borderRadius: 20, overflow: 'hidden' }}>
          <Pressable onPress={() => setOpen(!open)} style={{ flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, borderBottomWidth: 1, borderColor: '#C4C7C5' }}>
            {myAccount ? <BankLogo account={myAccount} size={40} /> : <Avatar name="G" size={40} color={C.blue} icon="wallet" />}
            <Text style={{ flex: 1, fontSize: 20, color: TITLE }}>{myAccount ? `${myAccount.bankShort} Bank ${myAccount.last4}` : 'GGPay'}</Text>
            <MI name={open ? 'expand-less' : 'expand-more'} size={26} color={SUB} />
          </Pressable>
          {open && (
            <View style={{ paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderColor: '#C4C7C5' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
                <View style={{ width: 20, alignItems: 'center' }}><View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: C.blue }} /></View>
                <Text style={{ fontSize: 19, color: TITLE }}>Payment started</Text>
              </View>
              <View style={{ width: 2, height: 22, backgroundColor: '#747775', marginLeft: 9 }} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
                <MI name={ok ? 'check-circle' : failed ? 'cancel' : 'schedule'} size={20} color={ok ? C.green : failed ? C.red : C.amber} />
                <Text style={{ fontSize: 19, color: ok ? C.green : failed ? C.red : C.amber }}>{ok ? 'Payment completed' : failed ? 'Payment failed' : 'Payment pending'}</Text>
              </View>
            </View>
          )}
          <View style={{ paddingHorizontal: 20, paddingBottom: 18 }}>
            <Detail label="UPI transaction ID" value={t.upiRef} copy />
            <Detail label={`To: ${t.toName}`} sub={t.type === 'bill' || t.type === 'recharge' || t.type === 'bank_transfer' ? t.toHandle : `${mask(t.toHandle)} on GGPay`} />
            <Detail label={`From: ${t.fromName.toUpperCase()}${(out ? myAccount : otherAccount) ? ` (${(out ? myAccount : otherAccount).bankShort} Bank)` : ''}`} sub={t.fromHandle ? `${mask(t.fromHandle)} on GGPay` : null} />
            <Detail label="GGPay transaction ID" value={appTxnId(t.id)} copy />
          </View>
        </View>

        {!out && <Text style={{ fontSize: 13, color: SUB, textAlign: 'center', marginTop: 20, lineHeight: 18 }}>Payments may take up to 3 working days to be reflected in your account</Text>}
        <View style={{ alignItems: 'center', marginTop: 18 }}>
          <Text style={{ fontSize: 8, color: SUB, letterSpacing: 1 }}>POWERED BY</Text>
          <Text style={{ fontSize: 22, fontWeight: '900', fontStyle: 'italic', color: '#5F6368', letterSpacing: 1 }}>UPI</Text>
          <Text style={{ fontSize: 10, color: SUB, marginTop: 4 }}>GGPay demo transaction · no real money moved</Text>
        </View>
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderColor: '#E3E3E3' }}>
        <Pill icon="help-circle-outline" label="Having issues?" onPress={() => router.push({ pathname: '/help', params: { txnId: t.id, subject: `Issue with payment of ${inr(t.amount)} (${t.upiRef})` } })} />
        <Pill icon="share-variant-outline" label="Share" onPress={share} />
        <Pill icon="account-multiple-outline" label="Split" onPress={() => (cp.user ? router.push({ pathname: '/pay', params: { userId: cp.user.id, mode: 'request', amount: String(Math.round(t.amount / 2)) } }) : toast('Split works with people payments'))} />
      </View>
    </Screen>
  );
}
