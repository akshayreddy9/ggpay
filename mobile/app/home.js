import { useEffect, useState } from 'react';
import { BackHandler, Pressable, View } from 'react-native';
import { Text } from '../components/Text';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Sym } from '../components/ui';
import HomeTab, { G } from '../components/home/HomeTab';
import MoneyTab from '../components/home/MoneyTab';
import YouTab from '../components/home/YouTab';
import { useApp, useLive } from '../lib/store';
import { shadow } from '../lib/theme';

const BAR_BG = '#EEF2F8';

function TabBar({ tab, onChange, user }) {
  const insets = useSafeAreaInsets();
  const items = [['home', 'Home'], ['money', 'Money'], ['you', 'You']];
  return (
    <View style={{ flexDirection: 'row', backgroundColor: BAR_BG, paddingTop: 12, paddingBottom: insets.bottom + 12 }}>
      {items.map(([key, label]) => {
        const on = tab === key;
        const fg = on ? '#001D35' : G.sub;
        return (
          <Pressable key={key} onPress={() => onChange(key)} style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ width: 68, height: 34, borderRadius: 17, backgroundColor: on ? '#C2E7FF' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
              {key === 'you' ? <Avatar user={user} size={26} />
                : <Sym name={key === 'home' ? 'home' : 'currency_rupee_circle'} fill={on && key === 'home'} size={27} color={fg} />}
            </View>
            <Text style={{ fontSize: 16, marginTop: 5, color: fg, fontWeight: on ? '700' : '500' }}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function Home() {
  const params = useLocalSearchParams();
  const { user, settings, refreshHome } = useApp();
  const [tab, setTab] = useState(params.tab || 'home');

  useEffect(() => { if (params.tab) setTab(params.tab); }, [params.tab]);
  useLive(() => { refreshHome(); }, [user?.id]);

  // Android back on Money/You returns to Home first.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (tab !== 'home') { setTab('home'); return true; }
      return false;
    });
    return () => sub.remove();
  }, [tab]);

  const showScan = tab === 'home' && settings?.features?.scan !== false;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flex: 1 }}>
        {tab === 'home' && <HomeTab onTab={setTab} />}
        {tab === 'money' && <MoneyTab />}
        {tab === 'you' && <YouTab />}
        {showScan && (
          <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 14, alignItems: 'center' }}>
            <Pressable onPress={() => router.push('/scan')}
              style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: pressed ? '#BFD5FB' : '#D3E3FD', height: 60, paddingHorizontal: 28, borderRadius: 20, ...shadow, elevation: 5, shadowOpacity: 0.2 }]}>
              <Sym name="qr_code_scanner" size={26} color="#0842A0" />
              <Text style={{ color: '#041E49', fontSize: 19, fontWeight: '500' }}>Scan QR</Text>
            </Pressable>
          </View>
        )}
      </View>
      <TabBar tab={tab} onChange={setTab} user={user} />
    </View>
  );
}
