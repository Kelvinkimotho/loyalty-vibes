require('dotenv').config()
const express = require('express')
const cors = require('cors')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const axios = require('axios')

const app = express()
app.use(express.json())

// CORS setup
const corsOptions = {
  origin: ['http://127.0.0.1:5500', 'http://localhost:3005'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}
app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

// Stripe Checkout
app.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'kes',
          product_data: { name: req.body.plan },
          unit_amount: req.body.amount * 100,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.DOMAIN}/success.html`,
      cancel_url: `${process.env.DOMAIN}/cancel.html`,
      metadata: req.body
    })

    res.json({ url: session.url, sessionId: session.id })
  } catch (error) {
    console.error('❌ Stripe error:', error)
    res.status(400).json({ error: error.message })
  }
})

app.post('/initiate-mpesa', async (req, res) => {
  console.log('📦 Incoming M-Pesa request body:', req.body)

  const { phone, amount, plan } = req.body
  if (!phone || !amount || !plan) {
    return res.status(400).json({ success: false, error: 'Missing phone, amount, or plan' })
  }

  try {
    const response = await axios.post(
      'https://api.sandbox.africastalking.com/version1/payment/mobile/checkout/request',
      {
        username: process.env.AT_USERNAME,
        productName: 'Sandbox', 
        phoneNumber: phone,
        currencyCode: 'KES',
        amount,
        metadata: { plan }
      },
      {
        headers: {
          apiKey: process.env.AT_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    )

    console.log('💰 M-Pesa Response:', response.data)
    res.json({ success: true, requestId: response.data.transactionId })

  } catch (error) {
    console.error('❌ M-Pesa initiation failed:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })

    res.status(400).json({
      success: false,
      error: error.response?.data?.description || error.message
    })
  }
})



app.post('/check-mpesa-status', async (req, res) => {
  const { requestId } = req.body
  if (!requestId) return res.status(400).json({ paid: false, failed: true, error: 'Missing requestId' })

  try {
    const response = await axios.get(
      `https://api.sandbox.africastalking.com/version1/payment/checkout/mobile/status/${requestId}`,
      {
        headers: { apiKey: process.env.AT_API_KEY }
      }
    )

    const status = response.data.status
    res.json({
      paid: status === 'Success',
      failed: ['Failed', 'Cancelled'].includes(status)
    })
  } catch (error) {
    console.error('❌ M-Pesa status check failed:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })

    res.status(400).json({
      success: false,
      error: error.response?.data?.description || error.message
    })
  }
})



app.listen(3005, () => {
  console.log('Server running on port 3005')
})
