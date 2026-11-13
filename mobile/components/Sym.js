import createIconSet from '@expo/vector-icons/createIconSet';
import glyphMap from './symbols-map.json';

// Google Material Symbols (outlined and filled), the icon style used by the reference app.
export const SYMBOL_FONTS = {
  MaterialSymbols: require('../assets/fonts/MaterialSymbols.ttf'),
  MaterialSymbolsFill: require('../assets/fonts/MaterialSymbolsFill.ttf'),
};

const Outlined = createIconSet(glyphMap, 'MaterialSymbols', SYMBOL_FONTS.MaterialSymbols);
const Filled = createIconSet(glyphMap, 'MaterialSymbolsFill', SYMBOL_FONTS.MaterialSymbolsFill);

export const hasSymbol = (name) => glyphMap[name] != null;

export function Sym({ fill, ...props }) {
  return fill ? <Filled {...props} /> : <Outlined {...props} />;
}
