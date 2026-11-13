// Demo data so the app looks populated on first launch.
const { id, hashSecret, digits } = require('./db');

const AVATAR_COLORS = ['#1A73E8', '#E8710A', '#188038', '#D93025', '#9334E6', '#12B5CB', '#E52592', '#F9AB00', '#5F6368', '#1E8E3E'];

const BANKS = [
  { name: 'State Bank of India', short: 'SBI', color: '#22409A', ifscPrefix: 'SBIN' },
  { name: 'HDFC Bank', short: 'HDFC', color: '#004C8F', ifscPrefix: 'HDFC' },
  { name: 'ICICI Bank', short: 'ICICI', color: '#F37E20', ifscPrefix: 'ICIC' },
  { name: 'Axis Bank', short: 'AXIS', color: '#97144D', ifscPrefix: 'UTIB' },
  { name: 'Kotak Mahindra Bank', short: 'KOTAK', color: '#ED1C24', ifscPrefix: 'KKBK' },
  { name: 'Bank of Baroda', short: 'BOB', color: '#F15A29', ifscPrefix: 'BARB' },
  { name: 'Punjab National Bank', short: 'PNB', color: '#A6192E', ifscPrefix: 'PUNB' },
  { name: 'Canara Bank', short: 'CANARA', color: '#0091D5', ifscPrefix: 'CNRB' },
  { name: 'Union Bank of India', short: 'UBI', color: '#E31E24', ifscPrefix: 'UBIN' },
  { name: 'Yes Bank', short: 'YES', color: '#0060AA', ifscPrefix: 'YESB' },
];

const PEOPLE = [
  ['Rahul Sharma', '9876543210', 'rahul.sharma@gmail.com'],
  ['Priya Reddy', '9876543211', 'priya.reddy@gmail.com'],
  ['Arjun Kumar', '9876543212', 'arjun.k@gmail.com'],
  ['Sneha Patel', '9876543213', 'sneha.patel@gmail.com'],
  ['Vikram Singh', '9876543214', 'vikram.singh@gmail.com'],
  ['Ananya Iyer', '9876543215', 'ananya.iyer@gmail.com'],
  ['Karthik Rao', '9876543216', 'karthik.rao@gmail.com'],
  ['Meera Nair', '9876543217', 'meera.nair@gmail.com'],
  ['Rohit Verma', '9876543218', 'rohit.verma@gmail.com'],
  ['Divya Joshi', '9876543219', 'divya.joshi@gmail.com'],
];

const MERCHANTS = [
  ['Sri Balaji Kirana Store', '9000000001', 'Groceries'],
  ['Chai Point', '9000000002', 'Food & drinks'],
  ['Apollo Pharmacy', '9000000003', 'Health'],
  ['Reliance Fresh', '9000000004', 'Groceries'],
  ['Cafe Coffee Day', '9000000005', 'Food & drinks'],
  ['Indian Oil Petrol Pump', '9000000006', 'Fuel'],
];

const NOTES = ['Dinner', 'Movie tickets', 'Rent share', 'Cab', 'Lunch', 'Birthday gift', 'Petrol', 'Groceries', 'Trip', '', '', 'Thanks!', 'Snacks', 'Recharge'];

function upiHandle(name) {
  return name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 12) + '@ggpay';
}

function buildSeed() {
  const now = Date.now();
  const DAY = 86400000;
  const db = {
    users: [], accounts: [], transactions: [], requests: [], rewards: [], campaigns: [],
    offers: [], banners: [], banks: [], billers: [], operators: [], plans: [],
    notifications: [], tickets: [], auditLogs: [], admins: [], sessions: {}, adminSessions: {}, otps: {},
    settings: {
      appName: 'GGPay',
      maintenanceMode: false,
      maintenanceMessage: 'We are upgrading our systems. Please try again in a little while.',
      demoOtp: true,
      otpCode: '123456',
      perTxLimit: 100000,
      dailyLimit: 200000,
      newAccountBalance: 25000,
      referralBonus: 201,
      announcement: '',
      features: { scan: true, payContacts: true, bankTransfer: true, selfTransfer: true, bills: true, recharge: true, rewards: true, requests: true, checkBalance: true },
      homeSections: { people: true, businesses: true, bills: true, offers: true, manage: true },
    },
  };

  db.banks = BANKS.map((b) => ({ id: id('bnk'), ...b, active: true }));
  const bankAt = (i) => db.banks[i % db.banks.length];

  const pin = hashSecret('1234');
  const addUser = (name, phone, email, i, merchant) => {
    const u = {
      id: id('usr'), name, phone, email: email || '', upiId: upiHandle(name), photo: null,
      color: AVATAR_COLORS[i % AVATAR_COLORS.length], isMerchant: !!merchant, merchantCategory: merchant || '',
      blocked: false, profileComplete: true, referralCode: name.split(' ')[0].toUpperCase().slice(0, 5) + digits(3),
      createdAt: now - (90 - i) * DAY,
    };
    db.users.push(u);
    const bank = bankAt(i * 3);
    db.accounts.push({
      id: id('acc'), userId: u.id, bankId: bank.id, accountNo: digits(12), ifsc: bank.ifscPrefix + '0' + digits(6),
      type: 'Savings', balance: merchant ? 150000 : 20000 + Math.round(Math.random() * 60000),
      primary: true, linked: true, pinHash: pin, createdAt: u.createdAt,
    });
    return u;
  };
  PEOPLE.forEach(([n, p, e], i) => addUser(n, p, e, i));
  MERCHANTS.forEach(([n, p, c], i) => addUser(n, p, '', i + 3, c));

  // Rahul gets a second bank account to show multi-account flows.
  const rahul = db.users[0];
  db.accounts.push({
    id: id('acc'), userId: rahul.id, bankId: db.banks[1].id, accountNo: digits(12), ifsc: 'HDFC0' + digits(6),
    type: 'Savings', balance: 18450, primary: false, linked: true, pinHash: pin, createdAt: now - 60 * DAY,
  });

  const primary = (u) => db.accounts.find((a) => a.userId === u.id && a.primary);
  const people = db.users.filter((u) => !u.isMerchant);
  const merchants = db.users.filter((u) => u.isMerchant);

  for (let k = 0; k < 60; k++) {
    const toMerchant = k % 4 === 0;
    const from = k % 3 === 0 ? rahul : people[Math.floor(Math.random() * people.length)];
    let to = toMerchant ? merchants[k % merchants.length] : people[Math.floor(Math.random() * people.length)];
    if (to.id === from.id) to = from === rahul ? people[1] : rahul;
    const amount = toMerchant ? 20 + Math.round(Math.random() * 900) : 50 + Math.round(Math.random() * 4000);
    db.transactions.push({
      id: id('txn'), upiRef: digits(12), type: 'p2p', status: k % 17 === 5 ? 'failed' : 'success',
      fromUserId: from.id, fromAccountId: primary(from).id, fromName: from.name,
      toUserId: to.id, toAccountId: primary(to).id, toName: to.name, toHandle: to.upiId,
      amount, note: toMerchant ? '' : NOTES[k % NOTES.length], category: toMerchant ? to.merchantCategory : 'Transfer',
      failureReason: k % 17 === 5 ? 'Bank server is not responding' : '',
      createdAt: now - Math.round(Math.random() * 60 * DAY), createdBy: 'seed', applied: false,
    });
  }
  db.transactions.sort((a, b) => b.createdAt - a.createdAt);

  db.requests.push({ id: id('req'), fromUserId: db.users[2].id, toUserId: rahul.id, amount: 350, note: 'Pizza last night', status: 'pending', createdAt: now - DAY / 3 });

  db.campaigns = [
    { id: id('cmp'), title: 'Cashback on payments', minAmount: 100, chance: 0.6, minCashback: 5, maxCashback: 75, active: true },
    { id: id('cmp'), title: 'Bill payment bonanza', minAmount: 200, chance: 0.8, minCashback: 10, maxCashback: 150, active: true, types: ['bill', 'recharge'] },
  ];
  db.rewards.push(
    { id: id('rwd'), userId: rahul.id, campaignId: db.campaigns[0].id, title: 'Cashback on payments', amount: 42, scratched: false, createdAt: now - DAY },
    { id: id('rwd'), userId: rahul.id, campaignId: db.campaigns[0].id, title: 'Cashback on payments', amount: 0, scratched: false, createdAt: now - 3 * DAY },
    { id: id('rwd'), userId: rahul.id, campaignId: db.campaigns[0].id, title: 'Cashback on payments', amount: 15, scratched: true, createdAt: now - 9 * DAY },
  );

  db.offers = [
    { id: id('off'), brand: 'Swiggy', title: 'Flat ₹100 off on food orders', description: 'On orders above ₹399 paid via GGPay UPI.', code: 'PAYNOVA100', color: '#FC8019', active: true },
    { id: id('off'), brand: 'MakeMyTrip', title: 'Up to ₹1,500 off on flights', description: 'Domestic flight bookings. Once per user.', code: 'FLYPN', color: '#E7352B', active: true },
    { id: id('off'), brand: 'BookMyShow', title: 'Buy 1 get 1 movie ticket', description: 'Valid on weekends, up to ₹200 off.', code: 'MOVIEPN', color: '#C4242B', active: true },
    { id: id('off'), brand: 'Myntra', title: '10% cashback on fashion', description: 'Maximum cashback ₹250.', code: 'STYLEPN', color: '#FF3F6C', active: true },
  ];

  db.banners = [
    { id: id('ban'), title: 'Earn flat ₹11 cashback', subtitle: "On your kid's first Pocket Money payment", cta: 'Set up now', color: '#0B57D0', emoji: '👨‍👦', active: true, order: 1 },
    { id: id('ban'), title: 'Get up to ₹500 cashback', subtitle: 'Pay your electricity bill and win scratch cards', cta: 'Pay now', color: '#0B57D0', emoji: '⚡', active: true, order: 2 },
    { id: id('ban'), title: 'Refer & earn ₹201', subtitle: 'Invite friends to GGPay', cta: 'Invite now', color: '#0B57D0', emoji: '🎁', active: true, order: 3 },
  ];

  const billers = {
    electricity: ['TS Southern Power (TSSPDCL)', 'BESCOM Bangalore', 'Tata Power Mumbai', 'MSEDCL Maharashtra', 'Adani Electricity'],
    dth: ['Tata Play', 'Airtel Digital TV', 'Dish TV', 'Sun Direct'],
    broadband: ['ACT Fibernet', 'Airtel Xstream Fiber', 'JioFiber', 'BSNL Broadband'],
    water: ['HMWSSB Hyderabad', 'Delhi Jal Board', 'BWSSB Bangalore'],
    gas: ['Indane Gas', 'HP Gas', 'Bharat Gas', 'Mahanagar Gas'],
    fastag: ['ICICI FASTag', 'Paytm FASTag', 'HDFC FASTag'],
    creditcard: ['HDFC Credit Card', 'SBI Card', 'ICICI Credit Card', 'Axis Credit Card'],
    insurance: ['LIC of India', 'HDFC Life', 'Star Health'],
  };
  const billerColors = ['#1A73E8', '#E8710A', '#188038', '#9334E6', '#D93025'];
  Object.entries(billers).forEach(([category, names]) =>
    names.forEach((name, i) => db.billers.push({ id: id('blr'), category, name, color: billerColors[i % billerColors.length], active: true })));

  db.operators = [
    { id: id('opr'), name: 'Jio', color: '#0F3CC9', active: true },
    { id: id('opr'), name: 'Airtel', color: '#E40000', active: true },
    { id: id('opr'), name: 'Vi', color: '#E9202D', active: true },
    { id: id('opr'), name: 'BSNL', color: '#1C75BC', active: true },
  ];
  const planTemplates = [
    [199, '28 days', '1.5 GB/day', 'Unlimited calls, 100 SMS/day', 'Popular'],
    [299, '28 days', '2 GB/day', 'Unlimited calls, 100 SMS/day', 'Best seller'],
    [479, '56 days', '1.5 GB/day', 'Unlimited calls, 100 SMS/day', ''],
    [719, '84 days', '2 GB/day', 'Unlimited calls + OTT subscription', 'Entertainment'],
    [1799, '365 days', '24 GB total', 'Unlimited calls, 3600 SMS', 'Annual'],
    [19, '1 day', '1 GB', 'Data add-on', 'Data'],
  ];
  db.operators.forEach((op) => planTemplates.forEach(([price, validity, data, description, tag]) =>
    db.plans.push({ id: id('pln'), operatorId: op.id, price: op.name === 'BSNL' ? price - 20 : price, validity, data, description, tag, active: true })));

  // A few past bills and recharges so the "Bills & recharges" row has history.
  const rahulAcc = primary(rahul);
  const pastBills = [
    [db.billers.find((b) => b.category === 'electricity'), 'bill', 1240, 'Consumer no. 1102345678', 'Electricity bill', 12],
    [db.operators.find((o) => o.name === 'Vi'), 'recharge', 299, 'Mobile 9876543211', '2 GB/day · 28 days', 18],
    [db.operators.find((o) => o.name === 'Airtel'), 'recharge', 199, 'Mobile 9876543210', '1.5 GB/day · 28 days', 25],
    [db.operators.find((o) => o.name === 'Jio'), 'recharge', 479, 'Mobile 9876543215', '1.5 GB/day · 56 days', 33],
  ];
  pastBills.forEach(([who, type, amount, handle, note, daysAgo]) => db.transactions.push({
    id: id('txn'), upiRef: digits(12), type, status: 'success', fromUserId: rahul.id, fromAccountId: rahulAcc.id, fromName: rahul.name, fromHandle: rahul.upiId,
    toUserId: null, toAccountId: null, toName: type === 'bill' ? who.name : `${who.name} Prepaid`, toHandle: handle, amount, note,
    category: type === 'bill' ? 'Bills' : 'Recharge', billerId: type === 'bill' ? who.id : undefined, billCategory: type === 'bill' ? who.category : undefined,
    operatorId: type === 'recharge' ? who.id : undefined, createdAt: now - daysAgo * DAY, createdBy: 'seed', applied: false, failureReason: '',
  }));
  db.transactions.sort((a, b) => b.createdAt - a.createdAt);

  db.notifications.push({ id: id('ntf'), userId: null, title: 'Welcome to GGPay!', body: 'Pay anyone, recharge and pay bills instantly with UPI.', createdAt: now - 2 * DAY, readBy: [] });

  db.tickets.push({
    id: id('tkt'), userId: rahul.id, subject: 'Money debited but payment failed', status: 'open', createdAt: now - 2 * DAY,
    replies: [{ from: 'user', text: 'My payment to Arjun failed but money was debited. Please help.', at: now - 2 * DAY }],
  });

  db.admins.push({ id: id('adm'), username: 'admin', name: 'Super Admin', passHash: hashSecret('admin123'), role: 'super', createdAt: now });

  // Apply seed transactions to balances so totals are consistent.
  for (const t of db.transactions) {
    if (t.status !== 'success') continue;
    const fa = db.accounts.find((a) => a.id === t.fromAccountId);
    const ta = db.accounts.find((a) => a.id === t.toAccountId);
    if (fa) fa.balance -= t.amount;
    if (ta) ta.balance += t.amount;
    t.applied = true;
  }
  db.accounts.forEach((a) => { if (a.balance < 1000) a.balance += 15000; a.balance = Math.round(a.balance * 100) / 100; });

  return db;
}

module.exports = { buildSeed, AVATAR_COLORS };
