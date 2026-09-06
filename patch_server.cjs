const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const diningRoutes = `
// DINING API
app.get('/api/restaurants/:restaurantId', (req, res) => {
  // In a real app, you would fetch from DB here if needed
  res.json({});
});
app.get('/api/restaurants/:restaurantId/menuItems', (req, res) => {
  res.json([]);
});
app.get('/api/restaurants/search-item', (req, res) => {
  res.json([]);
});
app.post('/api/restaurants/match-list', (req, res) => {
  res.json([]);
});
app.post('/api/restaurants/:restaurantId/subscription', (req, res) => {
  const { restaurantId } = req.params;
  const { plan } = req.body;
  
  if (!plan || !['monthly', 'yearly'].includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan selected.' });
  }

  // Mock successful Razorpay order creation
  res.json({
    orderId: 'order_' + Math.random().toString(36).substring(7),
    amount: plan === 'yearly' ? 599900 : 59900, // Amount in paise
    currency: 'INR'
  });
});
`;

code = code.replace("app.post('/api/shops/:shopId/subscription'", diningRoutes + "\napp.post('/api/shops/:shopId/subscription'");
fs.writeFileSync('server.ts', code);
