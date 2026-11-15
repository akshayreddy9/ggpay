import { useState } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { Text } from '../Text';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Polygon } from 'react-native-svg';
import { Avatar, Sym } from '../ui';
import { useApp } from '../../lib/store';
import { C, screenWidth, z } from '../../lib/theme';

// Colours from the reference app. Sizes are for a 412dp-wide screen; z() and the Text
// component scale them to the phone.
export const G = {
  tile: '#D3E3FD',
  blue: '#0B57D0',
  navy: '#041E49',
  hero: '#B3E3FF',
  title: '#1F1F1F',
  sub: '#444746',
  link: '#0B57D0',
  green: '#146C2E',
};

function SectionTitle({ children, right }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: z(22), marginTop: z(32), marginBottom: z(18) }}>
      <Text style={{ flex: 1, fontSize: 27, color: G.title }} numberOfLines={1}>{children}</Text>
      {right}
    </View>
  );
}

// Round icon + label in the 4-column grids.
function Circle({ icon, label, onPress, bg = G.tile, color = G.navy, children, badge, dot }) {
  return (
    <Pressable onPress={onPress} style={{ width: '25%', alignItems: 'center', marginBottom: z(22) }}>
      <View>
        <View style={{ width: z(58), height: z(58), borderRadius: z(29), backgroundColor: bg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {children || <Sym name={icon} size={28} color={color} />}
        </View>
        {badge && (
          <View style={{ position: 'absolute', top: -z(11), alignSelf: 'center', backgroundColor: '#FFDF99', borderRadius: z(6), paddingHorizontal: z(7), paddingVertical: 1 }}>
            <Text style={{ fontSize: 11.5, color: '#5C4300', fontWeight: '500' }}>{badge}</Text>
          </View>
        )}
        {dot && <View style={{ position: 'absolute', top: 0, right: 0, width: z(12), height: z(12), borderRadius: z(6), backgroundColor: G.blue }} />}
      </View>
      <Text style={{ fontSize: 16, color: G.title, textAlign: 'center', marginTop: z(9), paddingHorizontal: 1, lineHeight: 21 }} numberOfLines={2}>{label}</Text>
    </Pressable>
  );
}

// Icons of the four big tiles, built like the reference: brackets, badge, arrow and ₹.
function TileIcon({ kind }) {
  const s = 36;
  if (kind === 'scan') return <Sym name="qr_code_scanner" size={s} color={G.blue} />;
  if (kind === 'pay') {
    return (
      <View>
        <Sym name="person" size={s} color={G.blue} />
        <View style={{ position: 'absolute', right: -z(5), top: z(5), width: z(7), height: z(11), borderRadius: z(2), backgroundColor: G.blue }} />
      </View>
    );
  }
  if (kind === 'bank') {
    return (
      <View>
        <Sym name="account_balance" size={s} color={G.blue} />
        <View style={{ position: 'absolute', right: -z(9), bottom: -z(3), backgroundColor: G.tile, borderRadius: z(6) }}>
          <Sym name="arrow_right_alt" size={18} color={G.blue} />
        </View>
      </View>
    );
  }
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Sym name="smartphone" size={s} color={G.blue} />
      <Text style={{ position: 'absolute', fontSize: 12, fontWeight: '700', color: G.blue }}>₹</Text>
    </View>
  );
}

// Small two-arrow mark used on the UPI ID pill.
function UpiMark() {
  return (
    <Svg width={z(22)} height={z(22)} viewBox="0 0 24 24">
      <Polygon points="5,4 13,12 5,20" fill="#1E8E3E" />
      <Polygon points="11,4 19,12 11,20" fill="#F4511E" />
    </Svg>
  );
}

function Pill({ icon, top, bottom, bottomColor = G.title, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: z(12), borderRadius: z(34), paddingLeft: z(16), paddingRight: z(24), height: z(64), backgroundColor: pressed ? '#E3E8EF' : '#F0F4F9' }]}>
      {icon}
      <View>
        <Text style={{ fontSize: 15.5, color: G.sub }}>{top}</Text>
        <Text style={{ fontSize: 16.5, color: bottomColor, fontWeight: '500', marginTop: 1 }} numberOfLines={1}>{bottom}</Text>
      </View>
    </Pressable>
  );
}

function Hero({ banner }) {
  const w = screenWidth();
  return (
    <Pressable onPress={() => router.push('/offers')} style={{ height: z(168), flexDirection: 'row', paddingLeft: z(22), paddingTop: z(18) }}>
      <View style={{ flex: 1, paddingRight: z(6), zIndex: 1 }}>
        <Text style={{ fontSize: 21.5, fontWeight: '500', color: G.navy, lineHeight: 28 }} numberOfLines={2}>{banner?.title || 'Pay anyone, anywhere'}</Text>
        {!!banner?.subtitle && <Text style={{ fontSize: 15.5, color: G.navy, marginTop: z(6), lineHeight: 20, opacity: 0.85 }} numberOfLines={2}>{banner.subtitle}</Text>}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: z(8), marginTop: z(10) }}>
          <Text style={{ fontSize: 16, color: G.blue, fontWeight: '500' }}>{banner?.cta || 'Check now'}</Text>
          <View style={{ width: z(28), height: z(28), borderRadius: z(14), backgroundColor: G.blue, alignItems: 'center', justifyContent: 'center' }}>
            <Sym name="arrow_forward" size={16} color="#fff" />
          </View>
        </View>
      </View>
      <View style={{ width: z(120), alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
        {banner?.image ? <Image source={{ uri: banner.image }} style={{ width: z(110), height: z(110) }} resizeMode="contain" />
          : <Text style={{ fontSize: 70 }}>{banner?.emoji || '💸'}</Text>}
      </View>
      {/* Waves along the bottom of the hero, like the reference banner. */}
      <Svg width={w} height={z(46)} viewBox="0 0 400 46" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, bottom: 0 }}>
        <Path d="M0 22 C 70 4, 140 40, 210 22 S 340 6, 400 18 L400 46 L0 46 Z" fill="#9FD8FF" opacity="0.55" />
        <Path d="M0 32 C 80 18, 150 46, 240 30 S 360 22, 400 30 L400 46 L0 46 Z" fill="#8ACEFF" opacity="0.55" />
      </Svg>
    </Pressable>
  );
}

function AdCard({ ad }) {
  if (!ad || ad.active === false) return null;
  return (
    <Pressable onPress={() => router.push('/offers')} style={{ marginHorizontal: z(16), marginTop: z(8), borderRadius: z(18), overflow: 'hidden', backgroundColor: '#FFF4F2', borderWidth: 1, borderColor: '#F6D9D4' }}>
      <View style={{ flexDirection: 'row', minHeight: z(124) }}>
        <View style={{ flex: 1, padding: z(16) }}>
          <Text style={{ fontSize: 12, color: G.sub }}>Sponsored · {ad.sponsor}</Text>
          <Text style={{ fontSize: 17, color: G.title, fontWeight: '500', marginTop: z(6), lineHeight: 23 }} numberOfLines={2}>{ad.title}</Text>
          {!!ad.subtitle && <Text style={{ fontSize: 13.5, color: G.sub, marginTop: z(3) }} numberOfLines={1}>{ad.subtitle}</Text>}
          <View style={{ alignSelf: 'flex-start', marginTop: z(10), backgroundColor: ad.color || '#B3261E', borderRadius: z(16), paddingHorizontal: z(14), paddingVertical: z(6) }}>
            <Text style={{ fontSize: 13.5, color: '#fff', fontWeight: '500' }}>{ad.cta || 'Order now'}</Text>
          </View>
        </View>
        <View style={{ width: z(124), backgroundColor: ad.color || '#B3261E', alignItems: 'center', justifyContent: 'center' }}>
          {ad.image ? <Image source={{ uri: ad.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            : <Text style={{ fontSize: 58 }}>{ad.emoji || '🍗'}</Text>}
        </View>
      </View>
    </Pressable>
  );
}

const BILL_SYMBOLS = { electricity: 'bolt', dth: 'tv', broadband: 'router', water: 'water_drop', gas: 'propane_tank', fastag: 'directions_car', creditcard: 'credit_card', insurance: 'shield', recharge: 'smartphone' };

export default function HomeTab({ onTab, onNearBottom }) {
  const { user, home, refreshHome, settings, toast } = useApp();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const f = settings?.features || {};
  const sec = settings?.homeSections || {};
  const appName = settings?.appName || 'GGPay';

  const people = [...(home?.people || []), ...(home?.businesses || [])]
    .filter((u, i, arr) => arr.findIndex((x) => x.id === u.id) === i);
  const shown = expanded ? people.slice(0, 19) : people.slice(0, 7);
  const soon = (what) => toast(`${what} is coming soon to ${appName}`);
  const hero = home?.banners?.[0];

  const tiles = [
    f.scan !== false && ['scan', 'Scan any\nQR code', () => router.push('/scan')],
    f.payContacts !== false && ['pay', 'Pay\nanyone', () => router.push({ pathname: '/search', params: { mode: 'contacts' } })],
    f.bankTransfer !== false && ['bank', 'Bank\ntransfer', () => router.push('/bank-transfer')],
    f.recharge !== false && ['mobile', 'Mobile\nrecharge', () => router.push('/recharge')],
  ].filter(Boolean);

  const onScroll = (e) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    onNearBottom?.(contentOffset.y + layoutMeasurement.height > contentSize.height - z(70));
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: z(24) }}
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={64}
      refreshControl={<RefreshControl refreshing={refreshing} colors={[C.blue]} progressViewOffset={insets.top}
        onRefresh={async () => { setRefreshing(true); await refreshHome(); setRefreshing(false); }} />}
    >
      <LinearGradient colors={['#A6DBFF', G.hero]} style={{ paddingTop: insets.top + z(8) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: z(16), gap: z(12) }}>
          <Pressable onPress={() => router.push({ pathname: '/search', params: { mode: 'all' } })}
            style={{ flex: 1, height: z(56), borderRadius: z(28), backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: z(20) }}>
            <Sym name="search" size={26} color={G.title} />
            <Text style={{ marginLeft: z(16), color: G.sub, fontSize: 19 }}>Pay anyone on UPI</Text>
          </Pressable>
          <Pressable onPress={() => onTab('you')}>
            <Avatar user={user} size={36} />
          </Pressable>
        </View>
        <Hero banner={hero} />
      </LinearGradient>

      {!!settings?.announcement && (
        <View style={{ marginHorizontal: z(16), marginTop: z(12), backgroundColor: C.amberSoft, borderRadius: z(14), padding: z(12), flexDirection: 'row', gap: z(10), alignItems: 'center' }}>
          <Sym name="campaign" size={22} color={C.amber} />
          <Text style={{ flex: 1, color: C.text, fontSize: 14 }}>{settings.announcement}</Text>
        </View>
      )}

      <View style={{ flexDirection: 'row', paddingHorizontal: z(10), marginTop: z(20) }}>
        {tiles.map(([kind, label, onPress]) => (
          <Pressable key={kind} onPress={onPress} style={{ width: '25%', alignItems: 'center' }}>
            {({ pressed }) => (
              <>
                <View style={{ width: z(84), height: z(84), borderRadius: z(26), backgroundColor: pressed ? '#BFD5FB' : G.tile, alignItems: 'center', justifyContent: 'center' }}>
                  <TileIcon kind={kind} />
                </View>
                <Text style={{ fontSize: 17.5, color: G.title, textAlign: 'center', marginTop: z(10), lineHeight: 23 }}>{label}</Text>
              </>
            )}
          </Pressable>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: z(22), gap: z(12), marginTop: z(24) }}>
        {f.checkBalance !== false && <Pill icon={<Sym name="account_balance" size={26} color={G.blue} />} top="Bank balance" bottom="Check" onPress={() => router.push('/balance')} />}
        <Pill icon={<Sym name="schedule" size={26} color="#1E8E3E" />} top="Transactions" bottom="See all" onPress={() => router.push('/history')} />
        <Pill icon={<View><Sym name="rocket_launch" size={26} color={G.blue} /><View style={{ position: 'absolute', left: z(1), bottom: z(2), width: z(7), height: z(7), borderRadius: z(4), backgroundColor: '#F4511E' }} /></View>}
          top="UPI Lite" bottom="Activate" bottomColor={G.blue} onPress={() => soon('UPI Lite')} />
        {f.rewards !== false && <Pill icon={<Sym name="emoji_events" size={26} color="#E8A100" />} top="Rewards" bottom={home?.unscratched ? 'New' : 'View'} onPress={() => router.push('/rewards')} />}
        <Pill icon={<UpiMark />} top="UPI ID" bottom={user?.upiId ? `${user.upiId.slice(0, 10)}...` : ''}
          onPress={async () => { await Clipboard.setStringAsync(user?.upiId || ''); toast('UPI ID copied'); }} />
      </ScrollView>

      {home?.pendingRequests?.map((r) => (
        <Pressable key={r.id} onPress={() => router.push(`/chat/${r.fromUserId}`)}
          style={{ marginHorizontal: z(16), marginTop: z(16), padding: z(12), flexDirection: 'row', alignItems: 'center', gap: z(12), backgroundColor: '#EEF3FD', borderRadius: z(18) }}>
          <Avatar user={r.from} size={40} />
          <Text style={{ flex: 1, color: G.title, fontSize: 15 }} numberOfLines={2}>{r.from?.name} requested ₹{r.amount}{r.note ? ` · ${r.note}` : ''}</Text>
          <Text style={{ color: G.blue, fontWeight: '500', fontSize: 15 }}>Pay</Text>
        </Pressable>
      ))}

      {sec.people !== false && f.payContacts !== false && (
        <>
          <SectionTitle>Send money</SectionTitle>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: z(6) }}>
            {shown.map((u) => (
              <Pressable key={u.id} onPress={() => router.push(`/chat/${u.id}`)} style={{ width: '25%', alignItems: 'center', marginBottom: z(20) }}>
                <Avatar user={u} size={58} />
                <Text style={{ fontSize: 16, color: G.title, marginTop: z(9), textAlign: 'center', paddingHorizontal: z(3), lineHeight: 21 }} numberOfLines={2}>{u.name}</Text>
              </Pressable>
            ))}
            {people.length > 7 && (
              <Pressable onPress={() => setExpanded(!expanded)} style={{ width: '25%', alignItems: 'center', marginBottom: z(20) }}>
                <View style={{ width: z(58), height: z(58), borderRadius: z(29), borderWidth: 1, borderColor: '#C4C7C5', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
                  <Sym name={expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'} size={28} color={G.blue} />
                </View>
                <Text style={{ fontSize: 16, color: G.title, marginTop: z(9) }}>{expanded ? 'Less' : 'More'}</Text>
              </Pressable>
            )}
          </View>
        </>
      )}

      {sec.bills !== false && (f.bills !== false || f.recharge !== false) && (
        <>
          <SectionTitle right={(
            <Pressable onPress={() => router.push('/bills')} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: G.blue, fontSize: 18, fontWeight: '500' }}>Manage</Text>
              <Sym name="chevron_right" size={24} color={G.blue} />
            </Pressable>
          )}>Bills & recharges</SectionTitle>
          {!!home?.recentBills?.length && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: z(6), marginTop: z(6) }}>
              {home.recentBills.map((b) => (
                <Circle key={b.id} label={b.name} bg={b.color} badge={b.due ? 'Due' : null}
                  onPress={() => (b.kind === 'recharge' ? router.push('/recharge') : router.push({ pathname: '/bills', params: { category: b.category } }))}>
                  {b.kind === 'recharge'
                    ? <Text style={{ color: '#fff', fontWeight: '700', fontSize: b.name.length > 10 ? 13 : 17 }}>{b.name.split(' ')[0]}</Text>
                    : <Sym name={BILL_SYMBOLS[b.category] || 'receipt_long'} size={28} color="#fff" />}
                </Circle>
              ))}
            </View>
          )}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: z(6) }}>
            {f.recharge !== false && <Circle icon="smartphone" label={'Mobile\nrecharge'} onPress={() => router.push('/recharge')} />}
            <Circle icon="tv" label={'DTH /\nCable TV'} onPress={() => router.push({ pathname: '/bills', params: { category: 'dth' } })} />
            <Circle icon="lightbulb" label="Electricity" onPress={() => router.push({ pathname: '/bills', params: { category: 'electricity' } })} />
            <Circle icon="credit_card" label={'Credit\ncards'} onPress={() => router.push({ pathname: '/bills', params: { category: 'creditcard' } })} />
          </View>
        </>
      )}

      <SectionTitle>Credit cards & loans</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: z(6) }}>
        <Circle icon="speed" label={'CIBIL\nscore'} onPress={() => soon('CIBIL score')} />
        <Circle label={'Personal\nloan'} onPress={() => soon('Personal loan')}>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Sym name="shopping_bag" size={28} color={G.navy} />
            <Text style={{ position: 'absolute', top: z(9), fontSize: 11, fontWeight: '700', color: G.navy }}>₹</Text>
          </View>
        </Circle>
        <Circle icon="credit_card" label={'Flex credit\ncard'} onPress={() => soon('Flex credit card')} />
        <Circle icon="jewelry" label={'Gold\nloan'} onPress={() => soon('Gold loan')} />
      </View>

      {sec.offers !== false && (
        <>
          <SectionTitle>Offers & rewards</SectionTitle>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: z(6) }}>
            {f.rewards !== false && (
              <Circle label="Rewards" dot={home?.unscratched > 0} onPress={() => router.push('/rewards')}>
                <LinearGradient colors={['#FDD663', '#F29900']} style={{ width: z(58), height: z(58), alignItems: 'center', justifyContent: 'center' }}>
                  <Sym name="emoji_events" size={28} color="#fff" />
                </LinearGradient>
              </Circle>
            )}
            <Circle label="Offers" onPress={() => router.push('/offers')}>
              <LinearGradient colors={['#F6AEA9', '#E8453C']} style={{ width: z(58), height: z(58), alignItems: 'center', justifyContent: 'center' }}>
                <Sym name="sell" size={26} color="#fff" />
              </LinearGradient>
            </Circle>
            <Circle label="Referrals" onPress={() => router.push('/refer')}>
              <LinearGradient colors={['#A8C7FA', '#4285F4']} style={{ width: z(58), height: z(58), alignItems: 'center', justifyContent: 'center' }}>
                <Sym name="devices" size={26} color="#fff" />
              </LinearGradient>
            </Circle>
            <Circle label={'Pocket\nmoney'} bg="#FDE293" onPress={() => soon('Pocket money')}>
              <Sym name="shield_with_heart" size={28} color="#E37400" />
            </Circle>
          </View>
        </>
      )}

      <AdCard ad={settings?.adCard} />

      {sec.manage !== false && (
        <>
          <SectionTitle>Manage your money</SectionTitle>
          {[
            ['history', 'See transaction history', () => router.push('/history')],
            f.checkBalance !== false && ['account_balance', 'Check bank balance', () => router.push('/balance')],
          ].filter(Boolean).map(([icon, title, onPress]) => (
            <Pressable key={title} onPress={onPress} android_ripple={{ color: '#eee' }} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: z(22), paddingVertical: z(20), gap: z(24) }}>
              <Sym name={icon} size={28} color={G.blue} />
              <Text style={{ flex: 1, fontSize: 20, color: G.title }} numberOfLines={1}>{title}</Text>
              <Sym name="chevron_right" size={24} color={G.sub} />
            </Pressable>
          ))}
        </>
      )}
    </ScrollView>
  );
}
