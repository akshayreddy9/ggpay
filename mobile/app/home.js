import { useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Pressable, View } from 'react-native';
import { Text } from '../components/Text';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Avatar, Sym } from '../components/ui';
import HomeTab, { G } from '../components/home/HomeTab';
import MoneyTab from '../components/home/MoneyTab';
import YouTab from '../components/home/YouTab';
import { useApp, useLive } from '../lib/store';
import { shadow, z } from '../lib/theme';

const BAR_BG = '#F0F4F9';

// House with the door touching the bottom edge, filled when selected.
function HomeIcon({ on, color }) {
  const d = z(26);
  return (
    <Svg width={d} height={d} viewBox="0 0 24 24">
      {on
        ? <Path d="M4 21V10l8-6 8 6v11h-6v-6h-4v6H4Z" fill={color} />
        : <Path d="M6 19h3v-6h6v6h3v-8.5L12 6l-6 4.5V19Zm-2 2V9.5L12 3.5l8 6V21h-7v-6h-2v6H4Z" fill={color} />}
    </Svg>
  );
}

function TabBar({ tab, onChange, user }) {
  const insets = useSafeAreaInsets();
  const items = [['home', 'Home'], ['money', 'Money'], ['you', 'You']];
  return (
    <View style={{ flexDirection: 'row', backgroundColor: BAR_BG, paddingTop: z(12), paddingBottom: insets.bottom + z(12) }}>
      {items.map(([key, label]) => {
        const on = tab === key;
        const fg = on ? '#001D35' : G.sub;
        return (
          <Pressable key={key} onPress={() => onChange(key)} style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ width: z(68), height: z(34), borderRadius: z(17), overflow: 'hidden', backgroundColor: on ? '#C2E7FF' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
              {key === 'home' ? <HomeIcon on={on} color={fg} />
                : key === 'money' ? <Sym name="currency_rupee_circle" size={27} color={fg} />
                  : <Avatar user={user} size={26} />}
            </View>
            <Text style={{ fontSize: 16, marginTop: z(5), color: fg, fontWeight: on ? '700' : '500' }}>{label}</Text>
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
  const [atBottom, setAtBottom] = useState(false);
  const slide = useRef(new Animated.Value(0)).current;

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

  // The Scan QR pill slides away at the bottom of Home so it never covers the last row.
  useEffect(() => {
    Animated.timing(slide, { toValue: atBottom ? 1 : 0, duration: 220, useNativeDriver: true }).start();
  }, [atBottom, slide]);

  const showScan = tab === 'home' && settings?.features?.scan !== false;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flex: 1 }}>
        {tab === 'home' && <HomeTab onTab={setTab} onNearBottom={setAtBottom} />}
        {tab === 'money' && <MoneyTab />}
        {tab === 'you' && <YouTab />}
        {showScan && (
          <Animated.View pointerEvents={atBottom ? 'none' : 'box-none'}
            style={{ position: 'absolute', left: 0, right: 0, bottom: z(14), alignItems: 'center', opacity: slide.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }), transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [0, z(90)] }) }] }}>
            <Pressable onPress={() => router.push('/scan')}
              style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: z(10), backgroundColor: pressed ? '#A8D9FF' : '#C2E7FF', height: z(58), paddingHorizontal: z(28), borderRadius: z(18), ...shadow, elevation: 4, shadowOpacity: 0.18 }]}>
              <Sym name="qr_code_scanner" size={26} color={G.navy} />
              <Text style={{ color: G.navy, fontSize: 19, fontWeight: '500' }}>Scan QR</Text>
            </Pressable>
          </Animated.View>
        )}
      </View>
      <TabBar tab={tab} onChange={setTab} user={user} />
    </View>
  );
}
