import { Dimensions, Platform } from 'react-native';

// In the browser preview the app lives in a phone-sized frame.
export const PHONE_WIDTH = 412;
// Sizes in the code were measured on a 412dp-wide screen; z() scales them to the real phone.
export const SCALE = Math.min(1, (Platform.OS === 'web' ? Math.min(Dimensions.get('window').width, PHONE_WIDTH) : Dimensions.get('window').width) / PHONE_WIDTH);
export const z = (n) => Math.round(n * SCALE * 2) / 2;

export const screenWidth = () => (Platform.OS === 'web' ? Math.min(Dimensions.get('window').width, PHONE_WIDTH) : Dimensions.get('window').width);

export const C = {
  blue: '#1A73E8',
  blueDark: '#0B57D0',
  blueSoft: '#E8F0FE',
  blueTint: '#D3E3FD',
  text: '#1F1F1F',
  muted: '#5F6368',
  faint: '#80868B',
  line: '#E8EAED',
  bg: '#FFFFFF',
  surface: '#F1F4F9',
  green: '#188038',
  greenSoft: '#E6F4EA',
  red: '#D93025',
  redSoft: '#FCE8E6',
  amber: '#B06000',
  amberSoft: '#FEF7E0',
  gYellow: '#FBBC04',
  gRed: '#EA4335',
  gGreen: '#34A853',
  gBlue: '#4285F4',
};

export const shadow = {
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};
