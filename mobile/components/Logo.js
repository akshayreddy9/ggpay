import { View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

// Same mark as the launcher icon: two white "send" chevrons with four coloured dots.
export function Logo({ size = 48, rounded = true }) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Rect width="100" height="100" rx={rounded ? 24 : 0} fill="#1A73E8" />
        <Path d="M26 28 L46 48 L26 68 M48 28 L68 48 L48 68" stroke="#fff" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {['#4285F4', '#34A853', '#FBBC04', '#EA4335'].map((c, i) => <Circle key={c} cx={56 + i * 7} cy="80" r="2.6" fill={c} />)}
      </Svg>
    </View>
  );
}
