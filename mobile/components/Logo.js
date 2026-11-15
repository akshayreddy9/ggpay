import { Image, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useApp } from '../lib/store';
import { z } from '../lib/theme';

// App logo: the image uploaded in the admin panel, or the built-in mark
// (two white "send" chevrons with four coloured dots). `raw` skips screen scaling.
export function Logo({ size = 48, rounded = true, raw }) {
  const app = useApp();
  const d = raw ? size : z(size);
  const icon = app?.settings?.appIcon;
  if (icon) return <Image source={{ uri: icon }} style={{ width: d, height: d, borderRadius: rounded ? d * 0.24 : 0 }} />;
  return (
    <View style={{ width: d, height: d }}>
      <Svg width={d} height={d} viewBox="0 0 100 100">
        <Rect width="100" height="100" rx={rounded ? 24 : 0} fill="#1A73E8" />
        <Path d="M26 28 L46 48 L26 68 M48 28 L68 48 L48 68" stroke="#fff" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {['#4285F4', '#34A853', '#FBBC04', '#EA4335'].map((c, i) => <Circle key={c} cx={56 + i * 7} cy="80" r="2.6" fill={c} />)}
      </Svg>
    </View>
  );
}
