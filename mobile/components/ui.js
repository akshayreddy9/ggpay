import { ActivityIndicator, Image, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { hasSymbol, Sym } from './Sym';
import { router } from 'expo-router';
import { C, z } from '../lib/theme';
import { initials } from '../lib/format';

export { MaterialCommunityIcons as MCI, Sym };

// Material Icons names ("arrow-back") are drawn with Material Symbols ("arrow_back") when available.
export function MI({ name, ...props }) {
  const sym = name.replace(/-/g, '_');
  return hasSymbol(sym) ? <Sym name={sym} {...props} /> : <MaterialIcons name={name} {...props} />;
}

export function Screen({ children, style, edges = ['top', 'bottom'], bg = C.bg }) {
  return (
    <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor: bg }, style]}>
      {children}
    </SafeAreaView>
  );
}

export function Header({ title, subtitle, right, onBack, color = C.text, bg = 'transparent', back = true }) {
  return (
    <View style={[s.header, { backgroundColor: bg }]}>
      {back ? (
        <Pressable hitSlop={12} onPress={onBack || (() => (router.canGoBack() ? router.back() : router.replace('/home')))} style={s.headerBtn}>
          <MaterialIcons name="arrow-back" size={24} color={color} />
        </Pressable>
      ) : <View style={{ width: 8 }} />}
      <View style={{ flex: 1 }}>
        {!!title && <Text style={[s.headerTitle, { color }]} numberOfLines={1}>{title}</Text>}
        {!!subtitle && <Text style={[s.headerSub, { color: color === C.text ? C.muted : color }]} numberOfLines={1}>{subtitle}</Text>}
      </View>
      {right}
    </View>
  );
}

export function Avatar({ user, name, color, photo, size = 48, icon, style }) {
  const n = user?.name ?? name;
  const p = user?.photo ?? photo;
  const bg = user?.color ?? color ?? C.blue;
  const d = z(size);
  const dim = { width: d, height: d, borderRadius: d / 2 };
  if (p) return <Image source={{ uri: p }} style={[dim, style]} />;
  return (
    <View style={[dim, { backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }, style]}>
      {icon ? (hasSymbol(icon) ? <Sym name={icon} size={size * 0.5} color="#fff" /> : <MaterialCommunityIcons name={icon} size={z(size * 0.5)} color="#fff" />)
        : <Text style={{ color: '#fff', fontSize: size * 0.46 }}>{initials(n)}</Text>}
    </View>
  );
}

// Bank logo uploaded from the admin panel, or a coloured tile with the bank's short name.
export function BankLogo({ account, bank, size = 36 }) {
  const short = account?.bankShort ?? bank?.short ?? '';
  const color = account?.bankColor ?? bank?.color ?? C.blue;
  const logo = account?.bankLogo ?? bank?.logo;
  const d = z(size);
  if (logo) {
    return (
      <View style={{ width: d, height: d, borderRadius: d * 0.24, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E3E3E3', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <Image source={{ uri: logo }} style={{ width: d * 0.78, height: d * 0.78 }} resizeMode="contain" />
      </View>
    );
  }
  return (
    <View style={{ width: d, height: d, borderRadius: d * 0.24, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <MaterialCommunityIcons name="bank" size={d * 0.42} color="#fff" />
      {size >= 36 && <Text style={{ color: '#fff', fontSize: size * 0.2, fontWeight: '700', marginTop: -1 }} numberOfLines={1}>{short.slice(0, 5)}</Text>}
    </View>
  );
}

export function Btn({ title, onPress, variant = 'primary', disabled, loading, icon, style, textStyle }) {
  const v = VARIANTS[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      android_ripple={{ color: 'rgba(0,0,0,0.08)' }}
      style={({ pressed }) => [s.btn, v.box, (disabled || loading) && { opacity: 0.45 }, pressed && { opacity: 0.85 }, style]}
    >
      {loading ? <ActivityIndicator color={v.text.color} /> : (
        <>
          {icon && <MaterialIcons name={icon} size={20} color={v.text.color} style={{ marginRight: 8 }} />}
          <Text style={[s.btnText, v.text, textStyle]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}
const VARIANTS = {
  primary: { box: { backgroundColor: C.blue }, text: { color: '#fff' } },
  outline: { box: { borderWidth: 1, borderColor: '#DADCE0', backgroundColor: '#fff' }, text: { color: C.blue } },
  tonal: { box: { backgroundColor: C.blueSoft }, text: { color: C.blueDark } },
  text: { box: { backgroundColor: 'transparent' }, text: { color: C.blue } },
  danger: { box: { borderWidth: 1, borderColor: '#DADCE0' }, text: { color: C.red } },
};

export function Row({ icon, iconColor = C.muted, left, title, subtitle, right, onPress, chevron, style, titleStyle }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} android_ripple={{ color: '#eee' }} style={({ pressed }) => [s.row, pressed && { backgroundColor: '#F8F9FA' }, style]}>
      {left || (icon ? <View style={s.rowIcon}><MaterialCommunityIcons name={icon} size={24} color={iconColor} /></View> : null)}
      <View style={{ flex: 1 }}>
        <Text style={[s.rowTitle, titleStyle]} numberOfLines={1}>{title}</Text>
        {!!subtitle && <Text style={s.rowSub} numberOfLines={2}>{subtitle}</Text>}
      </View>
      {right}
      {chevron && <MaterialIcons name="chevron-right" size={22} color={C.faint} />}
    </Pressable>
  );
}

export function Sheet({ visible, onClose, title, children }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={s.sheetBg} onPress={onClose} />
      <View style={[s.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={s.grabber} />
        {!!title && <Text style={s.sheetTitle}>{title}</Text>}
        {children}
      </View>
    </Modal>
  );
}

export function Loading({ style }) {
  return <View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }, style]}><ActivityIndicator size="large" color={C.blue} /></View>;
}

export function Empty({ icon = 'inbox-outline', title, subtitle, action }) {
  return (
    <View style={{ alignItems: 'center', padding: 40 }}>
      <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: C.blueSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <MaterialCommunityIcons name={icon} size={44} color={C.blue} />
      </View>
      <Text style={{ fontSize: 17, color: C.text, fontWeight: '500', textAlign: 'center' }}>{title}</Text>
      {!!subtitle && <Text style={{ fontSize: 14, color: C.muted, marginTop: 6, textAlign: 'center' }}>{subtitle}</Text>}
      {action}
    </View>
  );
}

export function SectionTitle({ children, right, style }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 24, marginBottom: 12 }, style]}>
      <Text style={{ flex: 1, fontSize: 18, fontWeight: '500', color: C.text }}>{children}</Text>
      {right}
    </View>
  );
}

export function StatusPill({ status }) {
  const map = { success: [C.greenSoft, C.green, 'Completed'], failed: [C.redSoft, C.red, 'Failed'], pending: [C.amberSoft, C.amber, 'Pending'] };
  const [bg, fg, label] = map[status] || map.pending;
  return <View style={{ backgroundColor: bg, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 }}><Text style={{ color: fg, fontSize: 12, fontWeight: '600' }}>{label}</Text></View>;
}

export const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, height: 56, gap: 8 },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  headerTitle: { fontSize: 20, fontWeight: '400' },
  headerSub: { fontSize: 13 },
  btn: { height: 48, borderRadius: 24, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  btnText: { fontSize: 15, fontWeight: '600', letterSpacing: 0.2 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 16 },
  rowIcon: { width: 40, alignItems: 'center' },
  rowTitle: { fontSize: 16, color: C.text },
  rowSub: { fontSize: 13, color: C.muted, marginTop: 2 },
  sheetBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 8, maxHeight: '85%' },
  grabber: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#DADCE0', alignSelf: 'center', marginBottom: 12 },
  sheetTitle: { fontSize: 18, fontWeight: '500', color: C.text, paddingHorizontal: 20, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#DADCE0', borderRadius: 8, paddingHorizontal: 14, height: 54, fontSize: 16, color: C.text, backgroundColor: '#fff' },
  label: { fontSize: 13, color: C.muted, marginBottom: 6, marginTop: 14 },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.line },
});
