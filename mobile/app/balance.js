import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Text } from '../components/Text';
import { router } from 'expo-router';
import { BankLogo, Btn, Header, MI, Screen, s } from '../components/ui';
import { SuccessTick } from '../components/pay';
import { post } from '../lib/api';
import { useApp } from '../lib/store';
import { C } from '../lib/theme';
import { groupIN } from '../lib/format';

export default function Balance() {
  const { accounts, requestPin } = useApp();
  const [shown, setShown] = useState(null);

  const check = (a) => {
    requestPin({
      account: a,
      amount: null,
      processingText: 'Fetching balance',
      submit: (pin) => post(`/accounts/${a.id}/balance`, { pin }),
      onDone: (r) => { setShown(r.account); router.back(); },
    });
  };

  if (shown) {
    const { int, dec } = groupIN(shown.balance);
    return (
      <Screen>
        <Header title="" onBack={() => setShown(null)} />
        <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 24 }}>
          <SuccessTick size={72} color={C.blue} />
          <BankLogo account={shown} size={48} />
          <Text style={{ fontSize: 16, color: C.text, marginTop: 12 }}>{shown.bankName}</Text>
          <Text style={{ fontSize: 13, color: C.muted }}>{shown.type} ••{shown.last4}</Text>
          <Text style={{ fontSize: 14, color: C.muted, marginTop: 36 }}>Available balance</Text>
          <Text style={{ fontSize: 44, color: C.text, marginTop: 6 }}>₹{int}<Text style={{ fontSize: 26 }}>.{dec}</Text></Text>
        </View>
        <View style={{ padding: 20, gap: 10 }}>
          <Btn title="See transaction history" variant="outline" onPress={() => router.replace('/history')} />
          <Btn title="Done" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="Check balance" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ color: C.muted, marginBottom: 16 }}>Select a bank account. You'll need to enter its UPI PIN.</Text>
        {accounts.map((a) => (
          <Pressable key={a.id} onPress={() => check(a)} style={[s.card, { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, marginBottom: 10 }]}>
            <BankLogo account={a} size={44} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, color: C.text }}>{a.bankName}</Text>
              <Text style={{ fontSize: 13, color: C.muted }}>{a.type} ••{a.last4}{a.primary ? ' · Primary' : ''}</Text>
            </View>
            <Text style={{ color: C.blue, fontWeight: '600' }}>Check</Text>
            <MI name="chevron-right" size={22} color={C.blue} />
          </Pressable>
        ))}
      </ScrollView>
    </Screen>
  );
}
