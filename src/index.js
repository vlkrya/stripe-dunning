require('dotenv').config();
const express = require('express');
const Stripe = require('stripe');
const cron = require('node-cron');
const db = require('./db');
const { sendDunningEmail } = require('./email');
const { notifyNewFailedPayment, notifyFinalWarning, notifyPaymentResolved } = require('./telegram');

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
          event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
          console.error('Webhook signature verification failed:', err.message);
          return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    console.log(`Received event: ${event.type}`);
    switch (event.type) {
      case 'invoice.payment_failed': {
              const invoice = event.data.object;
              const customer = await stripe.customers.retrieve(invoice.customer);
              const result = db.addFailedPayment({
                        customerId: invoice.customer,
                        invoiceId: invoice.id,
                        email: customer.email,
                        name: customer.name,
                        amountDue: invoice.amount_due,
                        currency: invoice.currency
              });
              if (result.changes > 0) {
                        const payment = db.getByInvoice(invoice.id);
                        await sendDunningEmail(payment, 1);
                        db.markEmailSent(invoice.id);
                        await notifyNewFailedPayment(payment);
              }
              break;
      }
      case 'invoice.paid': {
              const invoice = event.data.object;
              const payment = db.getByInvoice(invoice.id);
              if (payment && payment.status === 'active') {
                        db.removeByInvoice(invoice.id);
                        await notifyPaymentResolved(payment);
              }
              break;
      }
      case 'customer.subscription.deleted': {
              const subscription = event.data.object;
              db.removeByCustomer(subscription.customer);
              break;
      }
    }
    res.json({ received: true });
});

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'Stripe Dunning Service', activePayments: db.getAllActive().length });
});

app.get('/stats', (req, res) => {
    const active = db.getAllActive();
    res.json({ activeFailedPayments: active.length, payments: active.map(p => ({ email: p.customer_email, emailsSent: p.emails_sent, createdAt: p.created_at })) });
});

cron.schedule('0 * * * *', async () => {
    console.log('Running dunning check...');
    const dueForEmail2 = db.getDueForEmail(2, 3);
    for (const payment of dueForEmail2) {
          await sendDunningEmail(payment, 2);
          db.markEmailSent(payment.stripe_invoice_id);
    }
    const dueForEmail3 = db.getDueForEmail(3, 7);
    for (const payment of dueForEmail3) {
          await sendDunningEmail(payment, 3);
          db.markEmailSent(payment.stripe_invoice_id);
          await notifyFinalWarning(payment);
    }
});

async function main() {
    await db.initDb();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Dunning service running on port ${PORT}`));
}

main().catch(console.error);
