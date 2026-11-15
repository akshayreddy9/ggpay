import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Text } from '../Text';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Sheet, Sym } from '../ui';
import { get } from '../../lib/api';
import { useApp } from '../../lib/store';
import { z } from '../../lib/theme';
import { inr } from '../../lib/format';
import { G } from './HomeTab';

const LANGS = [['en', 'English'], ['hi', 'हिन्दी'], ['te', 'తెలుగు'], ['ta', 'தமிழ்'], ['kn', 'ಕನ್ನಡ'], ['ml', 'മലയാളം'], ['mr', 'मराठी'], ['bn', 'বাংলা']];

function Method({ icon, title, sub, filled, onPress }) {
  return (
    <Pressable onPress={onPress} style={{ flex: 1, alignItems: 'center' }}>
      {filled ? (
        <View style={{ width: z(64), height: z(64), alignItems: 'center', justifyContent: 'center' }}>
          <Sym name={icon} size={36} color={G.blue} />
        </View>
      ) : (
        <View style={{ width: z(64), height: z(64), borderRadius: z(32), borderWidth: 1.5, borderStyle: 'dashed', borderColor: G.blue, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: z(52), height: z(52), borderRadius: z(26), backgroundColor: '#D3E3FD', alignItems: 'center', justifyContent: 'center' }}>
            <Sym name={icon} size={26} color={G.blue} />
          </View>
          <View style={{ position: 'absolute', right: -z(2), bottom: 0, width: z(22), height: z(22), borderRadius: z(11), backgroundColor: G.blue, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#F3F6FC' }}>
            <Sym name="add" size={15} color="#fff" />
          </View>
        </View>
      )}
      <Text style={{ fontSize: 17, color: G.title, textAlign: 'center', marginTop: z(8), fontWeight: '500' }} numberOfLines={1}>{title}</Text>
      <Text style={{ fontSize: 14.5, color: G.sub, textAlign: 'center', marginTop: z(2) }} numberOfLines={1}>{sub}</Text>
    </Pressable>
  );
}

function Item({ icon, title, sub, right, onPress }) {
  return (
    <Pressable onPress={onPress} android_ripple={{ color: '#eee' }} style={{ flexDirection: 'row', paddingHorizontal: z(20), paddingVertical: z(14), gap: z(20), alignItems: sub ? 'flex-start' : 'center' }}>
      <View style={{ width: z(26), alignItems: 'center', marginTop: sub ? z(2) : 0 }}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 19.5, color: G.title }}>{title}</Text>
        {!!sub && <Text style={{ fontSize: 16, color: G.sub, marginTop: z(3), lineHeight: 22 }}>{sub}</Text>}
      </View>
      {right}
    </Pressable>
  );
}

const icon = (name) => <Sym name={name} size={27} color={G.blue} />;

export default function YouTab() {
  const { user, accounts, home, settings, toast } = useApp();
  const insets = useSafeAreaInsets();
  const [rewardsCount, setRewardsCount] = useState(null);
  const [lang, setLang] = useState('en');
  const [langOpen, setLangOpen] = useState(false);
  const appName = settings?.appName || 'GGPay';

  useEffect(() => {
    get('/rewards').then((r) => setRewardsCount(r.rewards.length)).catch(() => {});
    AsyncStorage.getItem('pn_lang').then((v) => v && setLang(v)).catch(() => {});
  }, [home]);

  if (!user) return null;
  const soon = (what) => toast(`${what} is coming soon to ${appName}`);
  const chooseLang = async (code) => {
    setLang(code);
    setLangOpen(false);
    await AsyncStorage.setItem('pn_lang', code);
    toast('Language saved');
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: z(30) }} showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: '#FDF4E7', paddingTop: insets.top + z(4), paddingBottom: z(22), overflow: 'hidden' }}>
        {/* Soft peach and mint shapes behind the header. */}
        <View style={{ position: 'absolute', right: -z(30), top: insets.top + z(40), width: z(190), height: z(120), backgroundColor: '#DDF3EE', transform: [{ rotate: '-14deg' }], borderRadius: z(12) }} />
        <View style={{ position: 'absolute', left: z(70), top: insets.top + z(60), width: z(120), height: z(120), borderRadius: z(60), backgroundColor: '#FBE3D2', opacity: 0.8 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: z(6) }}>
          <Pressable hitSlop={10} onPress={() => router.push('/settings')} style={{ padding: z(8) }}><Sym name="more_vert" size={24} color={G.title} /></Pressable>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: z(20) }}>
          <View style={{ flex: 1, paddingRight: z(10) }}>
            <Text style={{ fontSize: 34, color: G.title }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>{user.name}</Text>
            <Pressable onPress={async () => { await Clipboard.setStringAsync(user.upiId); toast('UPI ID copied'); }}>
              <Text style={{ fontSize: 18.5, color: G.sub, marginTop: z(12), lineHeight: 26 }} numberOfLines={2}>UPI ID: {user.upiId}</Text>
            </Pressable>
            <Text style={{ fontSize: 18.5, color: G.sub, marginTop: z(8) }}>{user.phone}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: z(6), marginTop: z(12), alignSelf: 'flex-start', backgroundColor: '#D3E3FD', borderRadius: z(16), paddingHorizontal: z(12), paddingVertical: z(5) }}>
              <Sym name="check_circle" size={18} color={G.blue} />
              <Text style={{ color: G.navy, fontSize: 16, fontWeight: '500' }}>UPI number</Text>
            </View>
          </View>
          <Pressable onPress={() => router.push('/edit-profile')}>
            <Avatar user={user} size={100} />
            <Pressable onPress={() => router.push('/my-qr')} style={{ position: 'absolute', right: -z(4), bottom: z(2), width: z(32), height: z(32), borderRadius: z(16), backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 3 }}>
              <Sym name="qr_code_2" size={18} color={G.title} />
            </Pressable>
          </Pressable>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: z(10), paddingHorizontal: z(16), marginTop: z(16) }}>
        <Pressable onPress={() => router.push('/rewards')} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: z(10), backgroundColor: '#F8E8F8', borderRadius: z(36), paddingHorizontal: z(18), height: z(76) }}>
          <Sym name="featured_seasonal_and_gifts" size={28} color="#8E24AA" />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 19, color: '#681DA8', fontWeight: '500' }} numberOfLines={1}>{rewardsCount ?? 0} rewards</Text>
            <Text style={{ fontSize: 14.5, color: '#681DA8' }} numberOfLines={1}>View now</Text>
          </View>
        </Pressable>
        <Pressable onPress={() => router.push('/refer')} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: z(10), backgroundColor: '#E0F7FA', borderRadius: z(36), paddingHorizontal: z(18), height: z(76) }}>
          <Sym name="person_add" size={28} color="#004D40" />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 19, color: '#004D40', fontWeight: '500' }} numberOfLines={1}>Get {inr(settings?.referralBonus || 0)}</Text>
            <Text style={{ fontSize: 14.5, color: '#00695C' }} numberOfLines={1}>Refer a friend</Text>
          </View>
        </Pressable>
      </View>

      <View style={{ marginHorizontal: z(16), marginTop: z(16), backgroundColor: '#F3F6FC', borderRadius: z(22), paddingVertical: z(16) }}>
        <Pressable onPress={() => router.push('/bank-accounts')} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: z(18), marginBottom: z(14) }}>
          <Text style={{ flex: 1, fontSize: 20, color: G.title, fontWeight: '500' }} numberOfLines={1} adjustsFontSizeToFit>Set up payment methods 1/3</Text>
          <Sym name="chevron_right" size={24} color={G.blue} />
        </Pressable>
        <View style={{ flexDirection: 'row', paddingHorizontal: z(4) }}>
          <Method filled icon="account_balance" title="Bank account" sub={`${accounts.length} account${accounts.length === 1 ? '' : 's'}`} onPress={() => router.push('/bank-accounts')} />
          <Method icon="credit_card" title="RuPay credit" sub="Pay with UPI" onPress={() => soon('RuPay credit card on UPI')} />
          <Method icon="diamond" title="UPI Lite" sub="Pay PIN-free" onPress={() => soon('UPI Lite')} />
        </View>
      </View>

      <View style={{ marginTop: z(10) }}>
        <Item icon={icon('credit_card')} title="Pay with credit or debit cards" sub="Pay bills with your card"
          right={<Text style={{ color: G.blue, fontSize: 18, fontWeight: '500', marginTop: z(2) }}>Add</Text>} onPress={() => soon('Card payments')} />
        <Item icon={icon('qr_code_2')} title="Your QR code" sub="Use to receive money from any UPI app" onPress={() => router.push('/my-qr')} />
        <Item
          icon={(
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Sym name="autorenew" size={26} color={G.blue} />
              <Text style={{ position: 'absolute', fontSize: 10, fontWeight: '700', color: G.blue }}>₹</Text>
            </View>
          )}
          title="Autopay" sub="No pending requests" onPress={() => soon('Autopay')} />
        <Item icon={<Sym name="shield_with_heart" size={24} color={G.blue} />} title="Set up pocket money" sub="Help your family pay without a bank account" onPress={() => soon('Pocket money')} />
        <Item icon={icon('settings')} title="Settings" onPress={() => router.push('/settings')} />
        <Item icon={icon('account_circle')} title={`Manage ${appName} account`} onPress={() => router.push('/edit-profile')} />
        <Item icon={icon('help')} title="Get help" onPress={() => router.push('/help')} />
        <Item icon={icon('language')} title="Language" sub={(LANGS.find((l) => l[0] === lang) || LANGS[0])[1]} onPress={() => setLangOpen(true)} />
      </View>

      <Sheet visible={langOpen} onClose={() => setLangOpen(false)} title="Language">
        {LANGS.map(([code, label]) => (
          <Pressable key={code} onPress={() => chooseLang(code)} style={{ flexDirection: 'row', alignItems: 'center', gap: z(16), paddingHorizontal: z(20), paddingVertical: z(14) }}>
            <Sym name={lang === code ? 'radio_button_checked' : 'radio_button_unchecked'} size={22} color={lang === code ? G.blue : G.sub} />
            <Text style={{ fontSize: 16, color: G.title }}>{label}</Text>
          </Pressable>
        ))}
      </Sheet>
    </ScrollView>
  );
}
