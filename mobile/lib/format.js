const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Indian digit grouping: 12,34,567.89
export function groupIN(n) {
  const [int, dec] = Math.abs(Number(n) || 0).toFixed(2).split('.');
  const last3 = int.slice(-3);
  const rest = int.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return { int: (rest ? rest + ',' : '') + last3, dec };
}

export function inr(n, { decimals = 'auto' } = {}) {
  const { int, dec } = groupIN(n);
  const sign = Number(n) < 0 ? '-' : '';
  if (decimals === 'auto' && dec === '00') return `${sign}₹${int}`;
  return `${sign}₹${int}.${dec}`;
}

const pad = (n) => String(n).padStart(2, '0');

export function time(ts) {
  const d = new Date(ts);
  let h = d.getHours();
  const ap = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return `${h}:${pad(d.getMinutes())} ${ap}`;
}

export function shortDate(ts) {
  const d = new Date(ts);
  const now = new Date();
  const days = Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(ts).setHours(0, 0, 0, 0)) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${d.getDate()} ${MONTHS[d.getMonth()]}${d.getFullYear() !== now.getFullYear() ? ' ' + d.getFullYear() : ''}`;
}

export function fullDate(ts) {
  const d = new Date(ts);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${time(ts)}`;
}

// "4 November"
export function dayMonth(ts) {
  const d = new Date(ts);
  return `${d.getDate()} ${MONTHS_LONG[d.getMonth()]}`;
}

// "4 Nov 2026, 2:15 pm"
export function receiptDate(ts) {
  const d = new Date(ts);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${time(ts)}`;
}

export const MONTH_NAMES = MONTHS_LONG;

export function monthKey(ts) {
  const d = new Date(ts);
  return `${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

export function initials(name) {
  // One letter, like the reference app's avatars.
  return ((name || '?').trim()[0] || '?').toUpperCase();
}

export function firstName(name) {
  return (name || '').trim().split(/\s+/)[0];
}

export const TYPE_LABEL = {
  p2p: 'UPI payment', bank_transfer: 'Bank transfer', self: 'Self transfer', bill: 'Bill payment',
  recharge: 'Mobile recharge', cashback: 'Cashback', refund: 'Refund', admin: 'Adjustment',
};

export const BILL_CATEGORIES = [
  { key: 'electricity', label: 'Electricity', icon: 'lightning-bolt' },
  { key: 'dth', label: 'DTH / Cable TV', icon: 'satellite-uplink' },
  { key: 'broadband', label: 'Broadband', icon: 'router-wireless' },
  { key: 'water', label: 'Water', icon: 'water' },
  { key: 'gas', label: 'LPG / Gas', icon: 'gas-cylinder' },
  { key: 'fastag', label: 'FASTag', icon: 'car' },
  { key: 'creditcard', label: 'Credit card', icon: 'credit-card-outline' },
  { key: 'insurance', label: 'Insurance', icon: 'shield-check-outline' },
];
