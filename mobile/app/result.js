import { useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Pressable, Share, View } from 'react-native';
import { Text } from '../components/Text';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAudioPlayer } from 'expo-audio';
import { Avatar, Btn, Loading, MCI, Screen } from '../components/ui';
import { SuccessTick } from '../components/pay';
import { get } from '../lib/api';
import { goHome, resetTo } from '../lib/nav';
import { C } from '../lib/theme';
import { fullDate, inr } from '../lib/format';

export default function Result() {
  const { txnId, rewardId } = useLocalSearchParams();
  const [t, setT] = useState(null);
  const player = useAudioPlayer(require('../assets/sounds/success.wav'));
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => { get(`/transactions/${txnId}`).then((r) => setT(r.transaction)).catch(() => goHome()); }, [txnId]);

  useEffect(() => {
    if (!t) return;
    if (t.status === 'success') {
      try { player.seekTo(0); player.play(); } catch {}
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    }
    Animated.timing(fade, { toValue: 1, duration: 500, delay: 500, useNativeDriver: true }).start();
  }, [t, player, fade]);

  const done = () => {
    const other = t?.counterparty?.user;
    if (t?.type === 'p2p' && other) {
      resetTo('/home');
      router.push(`/chat/${other.id}`);
    } else goHome();
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => { done(); return true; });
    return () => sub.remove();
  });

  if (!t) return <Screen><Loading /></Screen>;
  const ok = t.status === 'success';
  const pending = t.status === 'pending';

  const share = () => Share.share({
    message: `${ok ? 'Paid' : 'Payment failed'} ${inr(t.amount, { decimals: true })} to ${t.counterparty.name} via GGPay UPI\n${fullDate(t.createdAt)}\nUPI transaction ID: ${t.upiRef}`,
  });

  return (
    <Screen bg={ok ? '#fff' : '#fff'}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <SuccessTick size={120} failed={!ok && !pending} color={pending ? C.amber : C.green} />
        <Text style={{ fontSize: 40, color: C.text, marginTop: 8 }}>{inr(t.amount, { decimals: true })}</Text>
        <Animated.View style={{ opacity: fade, alignItems: 'center' }}>
          <Text style={{ fontSize: 18, color: ok ? C.text : C.red, marginTop: 6, textAlign: 'center' }}>
            {ok ? (t.type === 'self' ? 'Transferred to your account' : `Paid to ${t.counterparty.name}`) : pending ? 'Payment pending' : 'Payment failed'}
          </Text>
          {!ok && !!t.failureReason && <Text style={{ fontSize: 14, color: C.muted, marginTop: 6, textAlign: 'center' }}>{t.failureReason}</Text>}
          {!!t.counterparty.handle && ok && <Text style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{t.counterparty.handle}</Text>}
          <Text style={{ fontSize: 13, color: C.muted, marginTop: 14 }}>{fullDate(t.createdAt)}</Text>
          <Text style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>UPI transaction ID: {t.upiRef}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, backgroundColor: C.surface, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 }}>
            <MCI name="flask-outline" size={12} color={C.muted} />
            <Text style={{ fontSize: 11, color: C.muted }}>Demo transaction</Text>
          </View>

          {!!rewardId && ok && (
            <Pressable onPress={() => router.push('/rewards')} style={{ marginTop: 28, flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 18, backgroundColor: '#FEF7E0', borderWidth: 1, borderColor: '#FDE293' }}>
              <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: C.gBlue, alignItems: 'center', justifyContent: 'center' }}>
                <MCI name="gift" size={28} color="#fff" />
              </View>
              <View>
                <Text style={{ fontSize: 16, color: C.text, fontWeight: '600' }}>You won a scratch card!</Text>
                <Text style={{ fontSize: 13, color: C.muted }}>Tap to scratch and reveal your reward</Text>
              </View>
            </Pressable>
          )}
        </Animated.View>
      </View>
      <Animated.View style={{ padding: 24, gap: 12, opacity: fade }}>
        {t.counterparty.user && t.type === 'p2p' && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
            <Avatar user={t.counterparty.user} size={24} />
            <Text style={{ color: C.muted, fontSize: 13 }}>{t.fromAccount ? `From ${t.fromAccount.bankName} ••${t.fromAccount.last4}` : ''}</Text>
          </View>
        )}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Btn title="Share" icon="share" variant="outline" onPress={share} style={{ flex: 1 }} />
          <Btn title="Details" variant="outline" onPress={() => router.push(`/txn/${t.id}`)} style={{ flex: 1 }} />
        </View>
        <Btn title="Done" onPress={done} />
      </Animated.View>
    </Screen>
  );
}
