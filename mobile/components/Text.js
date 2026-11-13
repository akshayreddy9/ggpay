import { forwardRef } from 'react';
import { Text as RNText, TextInput as RNTextInput, StyleSheet } from 'react-native';

// Google Sans Flex in three static weights, picked from the style's fontWeight.
export const FONTS = {
  'GoogleSans-Regular': require('../assets/fonts/GoogleSans-Regular.ttf'),
  'GoogleSans-Medium': require('../assets/fonts/GoogleSans-Medium.ttf'),
  'GoogleSans-Bold': require('../assets/fonts/GoogleSans-Bold.ttf'),
};

function family(style) {
  const flat = StyleSheet.flatten(style) || {};
  if (flat.fontFamily) return null;
  const w = flat.fontWeight === 'bold' ? 700 : Number(flat.fontWeight || 400);
  return w >= 700 ? 'GoogleSans-Bold' : w >= 500 ? 'GoogleSans-Medium' : 'GoogleSans-Regular';
}

export const Text = forwardRef(function Text({ style, ...props }, ref) {
  const f = family(style);
  return <RNText ref={ref} {...props} style={f ? [style, { fontFamily: f, fontWeight: 'normal' }] : style} />;
});

export const TextInput = forwardRef(function TextInput({ style, ...props }, ref) {
  const f = family(style);
  return <RNTextInput ref={ref} {...props} style={f ? [style, { fontFamily: f, fontWeight: 'normal' }] : style} />;
});
