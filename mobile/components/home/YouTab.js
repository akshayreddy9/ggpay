import { Image, Pressable, ScrollView, View } from 'react-native';
import { Text } from '../Text';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Sym } from '../ui';
import { useApp } from '../../lib/store';
import { confirmAction } from '../../lib/confirm';
import { C } from '../../lib/theme';
import { inr } from '../../lib/format';
import { G } from './HomeTab';

// Big profile picture: the photo, or a grey person silhouette like the reference app.
function ProfilePhoto({ user }) {
  const size = 110;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#DADCE0', borderWidth: 4, borderColor: '#fff', overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end' }}>
      {user.photo ? <Image source={{ uri: user.photo }} style={{ width: size, height: size }} /> : (
        <>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#9AA0A6', marginBottom: 6 }} />
          <View style={{ width: 76, height: 40, borderTopLeftRadius: 38, borderTopRightRadius: 38, backgroundColor: '#9AA0A6', marginBottom: -8 }} />
        </>
      )}
    </View>
  );
}

function Method({ icon, title, sub, filled, onPress }) {
  return (
    <Pressable onPress={onPress} style={{ flex: 1, alignItems: 'center' }}>
      {filled ? (
        <View style={{ width: 80, height: 80, alignItems: 'center', justifyContent: 'center' }}>
          <Sym name={icon} size={36} color={G.link} />
        </View>
      ) : (
        <View style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderStyle: 'dashed', borderColor: '#C4C7C5', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#D3E3FD', alignItems: 'center', justifyContent: 'center' }}>
            <Sym name={icon} size={28} color={G.link} />
          </View>
          <View style={{ position: 'absolute', right: -2, bottom: 2, width: 26, height: 26, borderRadius: 13, backgroundColor: G.link, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#F3F6FC' }}>
            <Sym name="add" size={18} color="#fff" />
          </View>
        </View>
      )}
      <Text style={{ fontSize: 18, color: G.title, textAlign: 'center', marginTop: 10, lineHeight: 23 }}>{title}</Text>
      <Text style={{ fontSize: 15.5, color: G.sub, textAlign: 'center', marginTop: 3 }}>{sub}</Text>
    </Pressable>
  );
}

function Item({ icon, title, sub, right, onPress, color = G.link }) {
  return (
    <Pressable onPress={onPress} android_ripple={{ color: '#eee' }} style={{ flexDirection: 'row', paddingHorizontal: 22, paddingVertical: 16, gap: 24 }}>
      <Sym name={icon} size={28} color={color} style={{ marginTop: 1 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 20, color: color === C.red ? C.red : G.title, lineHeight: 27 }}>{title}</Text>
        {!!sub && <Text style={{ fontSize: 16.5, color: G.sub, marginTop: 3, lineHeight: 23 }}>{sub}</Text>}
      </View>
      {right}
    </Pressable>
  );
}

export default function YouTab() {
  const { user, accounts, home, settings, toast, signOut } = useApp();
  const insets = useSafeAreaInsets();
  if (!user) return null;
  const soon = (what) => toast(`${what} is coming soon to GGPay`);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#FCEFD2', '#FBF1DD', '#FFFFFF']} style={{ paddingTop: insets.top + 8, paddingBottom: 30 }}>
        <View style={{ position: 'absolute', left: -60, right: -60, bottom: 10, height: 110, borderTopLeftRadius: 400, borderTopRightRadius: 400, backgroundColor: '#E6F0DC' }} />
        <View style={{ position: 'absolute', left: -40, width: 200, bottom: 40, height: 60, borderTopRightRadius: 200, backgroundColor: '#EFF5E8' }} />
        <View style={{ position: 'absolute', right: 24, bottom: 96, alignItems: 'center' }}>
          <View style={{ width: 22, height: 34, borderRadius: 11, backgroundColor: '#B5D99C' }} />
          <View style={{ width: 2, height: 12, backgroundColor: '#A1887F' }} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 8 }}>
          <Pressable hitSlop={10} onPress={() => router.push('/settings')} style={{ padding: 8 }}><Sym name="more_vert" size={26} color={G.title} /></Pressable>
        </View>
        <View style={{ flexDirection: 'row', paddingHorizontal: 22, alignItems: 'flex-end', marginTop: 8 }}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={{ fontSize: 36, color: G.title, lineHeight: 44 }} numberOfLines={2}>{user.name}</Text>
            <Pressable onPress={async () => { await Clipboard.setStringAsync(user.upiId); toast('UPI ID copied'); }}>
              <Text style={{ fontSize: 20.5, color: G.title, marginTop: 14, lineHeight: 30 }}>UPI ID: {user.upiId}</Text>
            </Pressable>
            <Text style={{ fontSize: 20.5, color: G.title, marginTop: 12 }}>{user.phone}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, alignSelf: 'flex-start', backgroundColor: '#D3E3FD', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 5 }}>
              <Sym name="check_circle" fill size={18} color={G.link} />
              <Text style={{ color: G.link, fontSize: 16, fontWeight: '500' }}>UPI number</Text>
            </View>
          </View>
          <Pressable onPress={() => router.push('/edit-profile')} style={{ marginBottom: 30 }}>
            <ProfilePhoto user={user} />
            <Pressable onPress={() => router.push('/my-qr')} style={{ position: 'absolute', right: -6, bottom: 0, backgroundColor: '#fff', borderRadius: 10, padding: 5, elevation: 2, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 3 }}>
              <Sym name="qr_code_2" size={26} color={G.title} />
            </Pressable>
          </Pressable>
        </View>
      </LinearGradient>

      <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 18, marginTop: 6 }}>
        <Pressable onPress={() => router.push('/rewards')} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFE8C7', borderRadius: 36, paddingHorizontal: 20, height: 84 }}>
          <Sym name="emoji_events" size={28} color="#5C4300" />
          <View>
            <Text style={{ fontSize: 23, color: G.title }}>{inr(home?.rewardsTotal || 0)}</Text>
            <Text style={{ fontSize: 16, color: '#5C4300', fontWeight: '500' }}>{home?.unscratched ? `${home.unscratched} rewards` : 'Get rewards'}</Text>
          </View>
        </Pressable>
        <Pressable onPress={() => router.push('/refer')} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#C2E7FF', borderRadius: 36, paddingHorizontal: 20, height: 84 }}>
          <Sym name="group" size={28} color="#004A77" />
          <View>
            <Text style={{ fontSize: 23, color: G.title }}>Get {inr(settings?.referralBonus || 0)}</Text>
            <Text style={{ fontSize: 16, color: '#004A77', fontWeight: '500' }}>Refer a friend</Text>
          </View>
        </Pressable>
      </View>

      <View style={{ marginHorizontal: 16, marginTop: 20, backgroundColor: '#F3F6FC', borderRadius: 24, paddingVertical: 20 }}>
        <Pressable onPress={() => router.push('/bank-accounts')} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 }}>
          <Text style={{ flex: 1, fontSize: 21.5, color: G.title, fontWeight: '500' }}>Set up payment methods 1/3</Text>
          <Sym name="chevron_right" size={28} color={G.link} />
        </Pressable>
        <View style={{ flexDirection: 'row', paddingHorizontal: 6 }}>
          <Method filled icon="account_balance" title={'Bank\naccount'} sub={`${accounts.length} account${accounts.length === 1 ? '' : 's'}`} onPress={() => router.push('/bank-accounts')} />
          <Method icon="credit_card" title={'RuPay credit\ncard'} sub="Pay with UPI" onPress={() => soon('RuPay credit card on UPI')} />
          <Method icon="bolt" title="UPI Lite" sub="Pay PIN-free" onPress={() => soon('UPI Lite')} />
        </View>
      </View>

      <View style={{ marginTop: 14 }}>
        <Item icon="credit_card" title="Pay with credit or debit cards" sub="Pay bills with your card"
          right={<Text style={{ color: G.link, fontSize: 18, fontWeight: '500', marginTop: 2 }}>Add</Text>} onPress={() => soon('Card payments')} />
        <Item icon="qr_code_2" title="Your QR code" sub="Use to receive money from any UPI app" onPress={() => router.push('/my-qr')} />
        <Item icon="autopay" title="Autopay" sub="No pending requests" onPress={() => soon('Autopay')} />
        <Item icon="volunteer_activism" title="Set up pocket money" sub="Help your family pay without a bank account" onPress={() => soon('Pocket money')} />
        <Item icon="settings" title="Settings" onPress={() => router.push('/settings')} />
        <Item icon="account_circle" title="Manage GGPay account" onPress={() => router.push('/edit-profile')} />
        <Item icon="history" title="Transaction history" onPress={() => router.push('/history')} />
        <Item icon="notifications" title="Notifications" sub={home?.unreadNotifications ? `${home.unreadNotifications} unread` : null} onPress={() => router.push('/notifications')} />
        <Item icon="help" title="Get help" onPress={() => router.push('/help')} />
        <Item icon="logout" title="Sign out" color={C.red}
          onPress={() => confirmAction('Sign out?', 'You will need to verify your number again to sign in.', 'Sign out', () => signOut())} />
      </View>
    </ScrollView>
  );
}
