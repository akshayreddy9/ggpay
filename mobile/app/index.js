import { useEffect } from 'react';
import { View } from 'react-native';
import { Text } from '../components/Text';
import { router } from 'expo-router';
import { useApp } from '../lib/store';
import { Logo } from '../components/Logo';

// Splash: animate the logo, then route to the right place.
export default function Splash() {
  const { booted, user, accounts, settings } = useApp();

  useEffect(() => {
    if (!booted) return undefined;
    const t = setTimeout(() => {
      if (!user) router.replace('/welcome');
      else if (!user.profileComplete) router.replace('/setup-profile');
      else if (!accounts.length) router.replace('/link-bank');
      else router.replace('/home');
    }, 700);
    return () => clearTimeout(t);
  }, [booted, user, accounts.length]);

  // Same size and place as the native splash image (160dp), so there is no jump or flash.
  return (
    <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
      <Logo size={160} raw />
      <Text style={{ position: 'absolute', bottom: 48, color: '#9AA0A6', fontSize: 24, fontWeight: '500', letterSpacing: 0.3 }}>{settings?.appName || 'GGPay'}</Text>
    </View>
  );
}
