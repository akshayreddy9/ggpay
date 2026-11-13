import { useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { Text } from '../Text';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Sym } from '../ui';
import { useApp } from '../../lib/store';
import { C, screenWidth } from '../../lib/theme';
import { inr } from '../../lib/format';

// Colours and type sizes measured from the reference recording.
export const G = {
  tile: '#D3E3FD',
  tileIcon: '#0842A0',
  headerTop: '#A8C7FA',
  headerBottom: '#D3E3FD',
  title: '#1F1F1F',
  sub: '#444746',
  link: '#0B57D0',
};

function SectionTitle({ children, right }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, marginTop: 34, marginBottom: 18 }}>
      <Text style={{ flex: 1, fontSize: 27, color: G.title }}>{children}</Text>
      {right}
    </View>
  );
}

// Round icon + label used in the 4-column grids.
function Circle({ icon, label, onPress, bg = G.tile, color = G.tileIcon, children, badge, dot }) {
  return (
    <Pressable onPress={onPress} style={{ width: '25%', alignItems: 'center', marginBottom: 22 }}>
      <View>
        <View style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {children || <Sym name={icon} size={28} color={color} />}
        </View>
        {badge && (
          <View style={{ position: 'absolute', top: -12, alignSelf: 'center', backgroundColor: '#FFDF99', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 1 }}>
            <Text style={{ fontSize: 12.5, color: '#5C4300', fontWeight: '500' }}>{badge}</Text>
          </View>
        )}
        {dot && <View style={{ position: 'absolute', top: -2, right: -2, width: 13, height: 13, borderRadius: 7, backgroundColor: C.blue }} />}
      </View>
      <Text style={{ fontSize: 16, color: G.title, textAlign: 'center', marginTop: 9, paddingHorizontal: 2, lineHeight: 21 }} numberOfLines={2}>{label}</Text>
    </Pressable>
  );
}

function Banner({ items }) {
  const width = screenWidth();
  const [index, setIndex] = useState(0);
  const list = useRef(null);

  useEffect(() => {
    if (!items || items.length < 2) return undefined;
    const t = setInterval(() => {
      setIndex((i) => {
        const next = (i + 1) % items.length;
        list.current?.scrollToOffset({ offset: next * width, animated: true });
        return next;
      });
    }, 4500);
    return () => clearInterval(t);
  }, [items, width]);

  if (!items?.length) return <View style={{ height: 18 }} />;
  return (
    <FlatList
      ref={list}
      data={items}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      keyExtractor={(b) => b.id}
      onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
      getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
      extraData={index}
      renderItem={({ item }) => (
        <Pressable onPress={() => router.push('/offers')} style={{ width, height: 150, paddingLeft: 22, paddingRight: 8, paddingTop: 18, flexDirection: 'row' }}>
          <View style={{ flex: 1, paddingRight: 4 }}>
            <Text style={{ fontSize: 21, fontWeight: '500', color: G.title }} numberOfLines={2}>{item.title}</Text>
            <Text style={{ fontSize: 15.5, color: G.title, marginTop: 6, lineHeight: 20 }} numberOfLines={2}>{item.subtitle}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 }}>
              <Text style={{ fontSize: 16, color: G.link, fontWeight: '500' }}>{item.cta || 'Know more'}</Text>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: G.link, alignItems: 'center', justifyContent: 'center' }}>
                <Sym name="arrow_forward" size={18} color="#fff" />
              </View>
            </View>
          </View>
          <View style={{ width: 128, alignItems: 'center', justifyContent: 'flex-end' }}>
            <View style={{ position: 'absolute', top: 6, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.5)' }} />
            <Text style={{ fontSize: 70, lineHeight: 96 }}>{item.emoji}</Text>
          </View>
        </Pressable>
      )}
    />
  );
}

function Chip({ icon, iconColor, top, bottom, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#C4C7C5', borderRadius: 34, paddingLeft: 12, paddingRight: 26, height: 66 }, pressed && { backgroundColor: '#F2F5FA' }]}>
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F0FE', alignItems: 'center', justifyContent: 'center' }}>
        <Sym name={icon} fill size={22} color={iconColor} />
      </View>
      <View>
        <Text style={{ fontSize: 15.5, color: G.sub }}>{top}</Text>
        <Text style={{ fontSize: 16.5, color: G.title, fontWeight: '500', marginTop: 1 }}>{bottom}</Text>
      </View>
    </Pressable>
  );
}

const BILL_SYMBOLS = { electricity: 'bolt', dth: 'tv', broadband: 'router', water: 'water_drop', gas: 'propane_tank', fastag: 'directions_car', creditcard: 'credit_card', insurance: 'shield', recharge: 'smartphone' };

export default function HomeTab({ onTab }) {
  const { user, home, refreshHome, settings, toast } = useApp();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const f = settings?.features || {};
  const sec = settings?.homeSections || {};

  const people = [...(home?.people || []), ...(home?.businesses || [])]
    .filter((u, i, arr) => arr.findIndex((x) => x.id === u.id) === i);
  const shown = expanded ? people.slice(0, 19) : people.slice(0, 7);
  const soon = (what) => toast(`${what} is coming soon to GGPay`);

  const tiles = [
    f.scan !== false && ['qr_code_scanner', 'Scan any\nQR code', () => router.push('/scan')],
    f.payContacts !== false && ['person', 'Pay\nanyone', () => router.push({ pathname: '/search', params: { mode: 'contacts' } })],
    f.bankTransfer !== false && ['account_balance', 'Bank\ntransfer', () => router.push('/bank-transfer')],
    f.recharge !== false && ['mobile_charge', 'Mobile\nrecharge', () => router.push('/recharge')],
  ].filter(Boolean);

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 150 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} colors={[C.blue]} progressViewOffset={insets.top}
        onRefresh={async () => { setRefreshing(true); await refreshHome(); setRefreshing(false); }} />}
    >
      <LinearGradient colors={[G.headerTop, G.headerBottom]} style={{ paddingTop: insets.top + 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 14 }}>
          <Pressable onPress={() => router.push({ pathname: '/search', params: { mode: 'all' } })}
            style={{ flex: 1, height: 56, borderRadius: 28, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 }}>
            <Sym name="search" size={26} color={G.title} />
            <Text style={{ marginLeft: 16, color: G.sub, fontSize: 19.5 }}>Pay anyone on UPI</Text>
          </Pressable>
          <Pressable onPress={() => onTab('you')}>
            <Avatar user={user} size={36} />
            {home?.unreadNotifications > 0 && <View style={{ position: 'absolute', right: -2, top: -2, width: 11, height: 11, borderRadius: 6, backgroundColor: C.gRed, borderWidth: 2, borderColor: '#fff' }} />}
          </Pressable>
        </View>
        <Banner items={home?.banners} />
      </LinearGradient>

      {!!settings?.announcement && (
        <View style={{ marginHorizontal: 16, marginTop: 14, backgroundColor: C.amberSoft, borderRadius: 14, padding: 12, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <Sym name="campaign" size={22} color={C.amber} />
          <Text style={{ flex: 1, color: C.text, fontSize: 14.5 }}>{settings.announcement}</Text>
        </View>
      )}

      <View style={{ flexDirection: 'row', paddingHorizontal: 10, marginTop: 20 }}>
        {tiles.map(([icon, label, onPress]) => (
          <Pressable key={label} onPress={onPress} style={{ width: '25%', alignItems: 'center' }}>
            {({ pressed }) => (
              <>
                <View style={{ width: 84, height: 84, borderRadius: 26, backgroundColor: pressed ? '#BFD5FB' : G.tile, alignItems: 'center', justifyContent: 'center' }}>
                  <Sym name={icon} size={36} color={G.tileIcon} />
                </View>
                <Text style={{ fontSize: 17.5, color: G.title, textAlign: 'center', marginTop: 10, lineHeight: 23 }}>{label}</Text>
              </>
            )}
          </Pressable>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 22, gap: 12, marginTop: 24 }}>
        {f.checkBalance !== false && <Chip icon="account_balance" iconColor={G.link} top="Bank balance" bottom="Check" onPress={() => router.push('/balance')} />}
        <Chip icon="history" iconColor={C.green} top="Transactions" bottom="See all" onPress={() => router.push('/history')} />
        {f.rewards !== false && <Chip icon="emoji_events" iconColor="#E37400" top="Rewards" bottom={inr(home?.rewardsTotal || 0)} onPress={() => router.push('/rewards')} />}
        <Chip icon="qr_code_2" iconColor={G.link} top="Your QR" bottom="Receive money" onPress={() => router.push('/my-qr')} />
      </ScrollView>

      {home?.pendingRequests?.map((r) => (
        <Pressable key={r.id} onPress={() => router.push(`/chat/${r.fromUserId}`)}
          style={{ marginHorizontal: 16, marginTop: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#EEF3FD', borderRadius: 20 }}>
          <Avatar user={r.from} size={42} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: G.title, fontSize: 16 }}>{r.from?.name} requested {inr(r.amount)}</Text>
            {!!r.note && <Text style={{ color: G.sub, fontSize: 14 }}>{r.note}</Text>}
          </View>
          <Text style={{ color: G.link, fontWeight: '500', fontSize: 16 }}>Pay</Text>
        </Pressable>
      ))}

      {sec.people !== false && f.payContacts !== false && (
        <>
          <SectionTitle>Send money</SectionTitle>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 6 }}>
            {shown.map((u) => (
              <Pressable key={u.id} onPress={() => router.push(`/chat/${u.id}`)} style={{ width: '25%', alignItems: 'center', marginBottom: 20 }}>
                <Avatar user={u} size={58} />
                <Text style={{ fontSize: 16, color: G.title, marginTop: 9, textAlign: 'center', paddingHorizontal: 3, lineHeight: 21 }} numberOfLines={2}>{u.name}</Text>
              </Pressable>
            ))}
            {people.length > 7 && (
              <Pressable onPress={() => setExpanded(!expanded)} style={{ width: '25%', alignItems: 'center', marginBottom: 20 }}>
                <View style={{ width: 58, height: 58, borderRadius: 29, borderWidth: 1, borderColor: '#C4C7C5', alignItems: 'center', justifyContent: 'center' }}>
                  <Sym name={expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'} size={30} color={G.link} />
                </View>
                <Text style={{ fontSize: 16, color: G.title, marginTop: 9 }}>{expanded ? 'Less' : 'More'}</Text>
              </Pressable>
            )}
          </View>
        </>
      )}

      {sec.bills !== false && (f.bills !== false || f.recharge !== false) && (
        <>
          <SectionTitle right={(
            <Pressable onPress={() => router.push('/bills')} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: G.link, fontSize: 18, fontWeight: '500' }}>Manage</Text>
              <Sym name="chevron_right" size={24} color={G.link} />
            </Pressable>
          )}>Bills & recharges</SectionTitle>
          {!!home?.recentBills?.length && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 6, marginTop: 6 }}>
              {home.recentBills.map((b) => (
                <Circle key={b.id} label={b.name} bg={b.color} badge={b.due ? 'Due' : null}
                  onPress={() => (b.kind === 'recharge' ? router.push('/recharge') : router.push({ pathname: '/bills', params: { category: b.category } }))}>
                  {b.kind === 'recharge'
                    ? <Text style={{ color: '#fff', fontWeight: '700', fontSize: b.name.length > 10 ? 15 : 19 }}>{b.name.split(' ')[0]}</Text>
                    : <Sym name={BILL_SYMBOLS[b.category] || 'receipt_long'} size={30} color="#fff" />}
                </Circle>
              ))}
            </View>
          )}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 6 }}>
            {f.recharge !== false && <Circle icon="smartphone" label={'Mobile\nrecharge'} onPress={() => router.push('/recharge')} />}
            <Circle icon="tv" label={'DTH /\nCable TV'} onPress={() => router.push({ pathname: '/bills', params: { category: 'dth' } })} />
            <Circle icon="lightbulb" label="Electricity" onPress={() => router.push({ pathname: '/bills', params: { category: 'electricity' } })} />
            <Circle icon="water_drop" label="Water" onPress={() => router.push({ pathname: '/bills', params: { category: 'water' } })} />
          </View>
        </>
      )}

      <SectionTitle>Credit cards & loans</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 6 }}>
        <Circle icon="speed" label="CIBIL score" onPress={() => soon('CIBIL score')} />
        <Circle icon="money_bag" label={'Personal\nloan'} onPress={() => soon('Personal loan')} />
        <Circle icon="credit_card_gear" label={'Flex credit\ncard'} onPress={() => router.push({ pathname: '/bills', params: { category: 'creditcard' } })} />
        <Circle icon="diamond" label="Gold loan" onPress={() => soon('Gold loan')} />
      </View>

      {sec.offers !== false && (
        <>
          <SectionTitle>Offers & rewards</SectionTitle>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 6 }}>
            {f.rewards !== false && (
              <Circle label="Rewards" dot={home?.unscratched > 0} onPress={() => router.push('/rewards')}>
                <LinearGradient colors={['#FDD663', '#F29900']} style={{ width: 58, height: 58, alignItems: 'center', justifyContent: 'center' }}>
                  <Sym name="emoji_events" fill size={30} color="#fff" />
                </LinearGradient>
              </Circle>
            )}
            <Circle label="Offers" onPress={() => router.push('/offers')}>
              <LinearGradient colors={['#F28B82', '#D93025']} style={{ width: 58, height: 58, alignItems: 'center', justifyContent: 'center' }}>
                <Sym name="sell" fill size={28} color="#fff" />
              </LinearGradient>
            </Circle>
            <Circle label="Referrals" onPress={() => router.push('/refer')}>
              <LinearGradient colors={['#8AB4F8', '#1A73E8']} style={{ width: 58, height: 58, alignItems: 'center', justifyContent: 'center' }}>
                <Sym name="devices" fill size={28} color="#fff" />
              </LinearGradient>
            </Circle>
            <Circle label={'Pocket\nmoney'} bg="#FEEFC3" onPress={() => soon('Pocket money')}>
              <Sym name="volunteer_activism" fill size={30} color="#E37400" />
            </Circle>
          </View>
        </>
      )}

      <Pressable onPress={() => soon('CIBIL score')} style={{ marginHorizontal: 16, marginTop: 12, borderRadius: 20, backgroundColor: '#F3F6FC', padding: 20, flexDirection: 'row', alignItems: 'center', minHeight: 150 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 17.5, color: G.title, lineHeight: 25 }}>Your CIBIL score for {new Date().toLocaleString('en-US', { month: 'long' })} is ready</Text>
          <Text style={{ fontSize: 16.5, color: G.link, fontWeight: '500', marginTop: 28 }}>Check now</Text>
        </View>
        <LinearGradient colors={['#E8F0FE', '#C2E7FF']} style={{ width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' }}>
          <Sym name="speed" size={56} color={G.link} />
        </LinearGradient>
      </Pressable>

      {sec.manage !== false && (
        <>
          <SectionTitle>Manage your money</SectionTitle>
          {[
            ['history', 'See transaction history', () => router.push('/history')],
            f.checkBalance !== false && ['account_balance', 'Check bank balance', () => router.push('/balance')],
            ['credit_card', 'Bank accounts & UPI PIN', () => router.push('/bank-accounts')],
            ['notifications', 'Notifications', () => router.push('/notifications')],
          ].filter(Boolean).map(([icon, title, onPress]) => (
            <Pressable key={title} onPress={onPress} android_ripple={{ color: '#eee' }} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, paddingVertical: 20, gap: 24 }}>
              <Sym name={icon} size={28} color={G.link} />
              <Text style={{ flex: 1, fontSize: 20, color: G.title }}>{title}</Text>
              <Sym name="chevron_right" size={26} color={G.sub} />
            </Pressable>
          ))}
        </>
      )}
    </ScrollView>
  );
}
