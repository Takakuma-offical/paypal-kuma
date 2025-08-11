const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// 環境変数からPayPalのClient IDとSecretを取得
const PAYPAL_CLIENT = "Aazw8hhatDVfCi2w8siwqyeCXCiSaB4HDnYzflVHGsxBbXy4niEPMiB2MXpzbPirf21yLpOMyp0s0_Iv";
const PAYPAL_SECRET = "EMUILL346CFkpZcjQ7xe2Zz6Hb8rKKr7RlOLwsBHgoPoXuhHySEUeMQ_abLQtmoEI8iyase8bLdY2_QL";
const PAYPAL_API = 'https://api-m.sandbox.paypal.com'; // sandbox用URL

// 購入用エンドポイント
app.post('/create-order', async (req, res) => {
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT}:${PAYPAL_SECRET}`).toString('base64');
    // PayPalアクセストークン取得
    const tokenRes = await axios.post(`${PAYPAL_API}/v1/oauth2/token`, 
      'grant_type=client_credentials', {
        headers: { 
          Authorization: `Basic ${auth}`, 
          'Content-Type': 'application/x-www-form-urlencoded' 
        }
    });

    const accessToken = tokenRes.data.access_token;

    // 注文作成
    const orderRes = await axios.post(`${PAYPAL_API}/v2/checkout/orders`, {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'JPY',
          value: '500'
        }
      }]
    }, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    res.json(orderRes.data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating order');
  }
});

// Webhook受信
app.post('/paypal/webhook', (req, res) => {
  console.log('Webhook received:', req.body);
  // ここでreq.bodyを検証してDB更新
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
