import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';
import { Text, TextInput } from '../components/Text';
import { router, useLocalSearchParams } from 'expo-router';
import { AccountSheet } from '../components/pay';
import { Avatar, BankLogo, Btn, Loading, MI, Screen } from '../components/ui';
import { get, post } from '../lib/api';
import { useApp } from '../lib/store';
import { startPayment } from '../lib/payment';
import { C } from '../lib/theme';
import { inr } from '../lib/format';

export default function Pay() {
  const params = useLocalSearchParams();
  const { userId, requestId, mode = 'pay' } = params;
  const { accounts, settings, requestPin, toast } = useApp();
  const [to, setTo] = useState(null);
  const [amount, setAmount] = useState(params.amount ? String(params.amount) : '');
  const [note, setNote] = useState(params.note || '');
  const [noteOpen, setNoteOpen] = useState(!!params.note);
  const [sheet, setSheet] = useState(false);
  const [accountId, setAccountId] = useState(null);
  const [busy, setBusy] = useState(false);
  const amountRef = useRef(null);
  const isRequest = mode === 'request';

  useEffect(() => { get(`/users/${userId}`).then((r) => setTo(r.user)).catch((e) => toast(e.message)); }, [userId, toast]);
  useEffect(() => { if (!accountId && accounts.length) setAccountId((accounts.find((a) => a.primary) || accounts[0]).id); }, [accounts, accountId]);

  const value = Number(amount || 0);
  const limit = settings?.perTxLimit || 100000;
  const tooMuch = value > limit;
  const account = accounts.find((a) => a.id === accountId);

  const onAmount = (t) => {
    let v = t.replace(/[^\d.]/g, '');
    const [i, d] = v.split('.');
    v = d !== undefined ? `${i.slice(0, 6)}.${d.slice(0, 2)}` : i.slice(0, 6);
    setAmount(v.replace(/^0+(?=\d)/, ''));
  };

  const proceed = async () => {
    if (isRequest) {
      setBusy(true);
      try {
        await post('/requests', { toUserId: userId, amount: value, note });
        toast(`Requested ${inr(value)} from ${to.name}`);
        router.back();
      } catch (e) { toast(e.message); } finally { setBusy(false); }
      return;
    }
    if (!accounts.length) { router.push({ pathname: '/link-bank', params: { from: 'settings' } }); return; }
    setSheet(true);
  };

  const pay = () => {
    setSheet(false);
    startPayment(requestPin, {
      account, amount: value, to: { name: to.name, sub: to.upiId },
      payload: { type: 'p2p', toUserId: to.id, note, requestId },
    });
  };

  if (!to) return <Screen><Loading /></Screen>;

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 8 }}>
          <Pressable hitSlop={10} onPress={() => router.back()} style={{ padding: 8 }}><MI name="close" size={24} color={C.text} /></Pressable>
          <Pressable hitSlop={10} onPress={() => router.push('/help')} style={{ padding: 8 }}><MI name="more-vert" size={24} color={C.text} /></Pressable>
        </View>
        <Pressable style={{ flex: 1, alignItems: 'center', paddingHorizontal: 24 }} onPress={() => amountRef.current?.focus()}>
          <Avatar user={to} size={64} />
          <Text style={{ fontSize: 18, color: C.text, marginTop: 14 }}>{isRequest ? `Requesting from ${to.name}` : `Paying ${to.name}`}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <MI name="verified" size={14} color={C.green} />
            <Text style={{ fontSize: 13, color: C.muted }}>Banking name: {to.name.toUpperCase()}</Text>
          </View>
          <Text style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{to.upiId}</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 32 }}>
            <Text style={{ fontSize: 40, color: amount ? C.text : C.faint, marginRight: 2 }}>₹</Text>
            <TextInput
              ref={amountRef}
              value={amount}
              onChangeText={onAmount}
              keyboardType="decimal-pad"
              autoFocus
              placeholder="0"
              placeholderTextColor={C.faint}
              style={{ fontSize: 48, color: C.text, minWidth: 40, padding: 0 }}
            />
          </View>
          {tooMuch && <Text style={{ color: C.red, marginTop: 6 }}>Amount exceeds the limit of {inr(limit)} per payment</Text>}

          {noteOpen ? (
            <TextInput value={note} onChangeText={setNote} autoFocus={!params.note} maxLength={50} placeholder="Add a note" placeholderTextColor={C.faint}
              style={{ marginTop: 18, backgroundColor: C.surface, borderRadius: 20, paddingHorizontal: 18, height: 40, minWidth: 160, textAlign: 'center', fontSize: 15, color: C.text }} />
          ) : (
            <Pressable onPress={() => setNoteOpen(true)} style={{ marginTop: 18, backgroundColor: C.surface, borderRadius: 20, paddingHorizontal: 18, height: 40, justifyContent: 'center' }}>
              <Text style={{ color: C.muted, fontSize: 15 }}>Add note</Text>
            </Pressable>
          )}
        </Pressable>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderTopWidth: 1, borderColor: C.line }}>
          {isRequest ? (
            <Btn title="Request" onPress={proceed} disabled={!value || tooMuch} loading={busy} style={{ flex: 1 }} />
          ) : (
            <>
              <Pressable onPress={() => setSheet(true)} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                {account ? <BankLogo account={account} size={32} /> : <MI name="account-balance" size={28} color={C.muted} />}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, color: C.text }} numberOfLines={1}>{account ? `${account.bankName} ••${account.last4}` : 'Add bank account'}</Text>
                  <Text style={{ fontSize: 12, color: C.blue }}>Change</Text>
                </View>
              </Pressable>
              <Pressable onPress={proceed} disabled={!value || tooMuch}
                style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: !value || tooMuch ? '#BDC1C6' : C.blue, alignItems: 'center', justifyContent: 'center' }}>
                <MI name="arrow-forward" size={28} color="#fff" />
              </Pressable>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
      <AccountSheet visible={sheet} onClose={() => setSheet(false)} accounts={accounts} selectedId={accountId} onSelect={(a) => setAccountId(a.id)} amount={value} onPay={pay} />
    </Screen>
  );
}
