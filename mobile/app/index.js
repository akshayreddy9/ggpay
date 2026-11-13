import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { Text } from '../components/Text';
import { router } from 'expo-router';
import { useApp } from '../lib/store';
import { Logo } from '../components/Logo';

// Splash: animate the logo, then route to the right place.
export default function Splash() {
  const { booted, user, accounts } = useApp();
  const scale = useRef(new Animated.Value(0.6)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const animDone = useRef(false);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start(() => { animDone.current = true; });
  }, [scale, fade]);

  useEffect(() => {
    if (!booted) return undefined;
    const t = setTimeout(() => {
      if (!user) router.replace('/welcome');
      else if (!user.profileComplete) router.replace('/setup-profile');
      else if (!accounts.length) router.replace('/link-bank');
      else router.replace('/home');
    }, 1100);
    return () => clearTimeout(t);
  }, [booted, user, accounts.length]);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ transform: [{ scale }], opacity: fade, alignItems: 'center' }}>
        <Logo size={120} />
      </Animated.View>
      <Text style={{ position: 'absolute', bottom: 56, color: '#5F6368', fontSize: 30, fontWeight: '500', letterSpacing: 0.5 }}>GGPay</Text>
    </View>
  );
}
