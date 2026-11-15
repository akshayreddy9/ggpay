import { forwardRef } from 'react';
import { Text as RNText, TextInput as RNTextInput, StyleSheet } from 'react-native';
import { SCALE } from '../lib/theme';

// Google Sans Flex in three static weights, picked from the style's fontWeight.
export const FONTS = {
  'GoogleSans-Regular': require('../assets/fonts/GoogleSans-Regular.ttf'),
  'GoogleSans-Medium': require('../assets/fonts/GoogleSans-Medium.ttf'),
  'GoogleSans-Bold': require('../assets/fonts/GoogleSans-Bold.ttf'),
};

// Picks the font file for the weight and scales sizes to the screen width.
function adapt(style) {
  const flat = StyleSheet.flatten(style) || {};
  const out = {};
  if (!flat.fontFamily) {
    const w = flat.fontWeight === 'bold' ? 700 : Number(flat.fontWeight || 400);
    out.fontFamily = w >= 700 ? 'GoogleSans-Bold' : w >= 500 ? 'GoogleSans-Medium' : 'GoogleSans-Regular';
    out.fontWeight = 'normal';
  }
  out.fontSize = (flat.fontSize || 14) * SCALE;
  if (flat.lineHeight) out.lineHeight = flat.lineHeight * SCALE;
  return [style, out];
}

export const Text = forwardRef(function Text({ style, ...props }, ref) {
  return <RNText ref={ref} {...props} style={adapt(style)} />;
});

export const TextInput = forwardRef(function TextInput({ style, ...props }, ref) {
  return <RNTextInput ref={ref} {...props} style={adapt(style)} />;
});
