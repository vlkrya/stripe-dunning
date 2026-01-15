require('dotenv').config();
const express = require('express');
const Stripe = require('stripe');
const cron = require('node-cron');
const db = require('./db');
const { sendDunningEmail } = require('./email');
const { notifyNewFailedPayment, notifyFinalWarning, notifyPaymentResolved, notifyEmailSent } = require('./telegram');

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe webhook requires raw body
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

           // Handle events
           switch (event.type) {
                 case 'invoice.payment_failed': {
                             const invoice = event.data.object;

                             // Get customer data
                             const customer = await stripe.customers.retrieve(invoice.customer);

                             // Add to database
                             const result = db.addFailedPayment({
                                           customerId: invoice.customer,
                                           invoiceId: invoice.id,
                                           email: customer.email,
                                           name: customer.name,
                                           amountDue: invoice.amount_due,
                                           currency: invoice.currency
                             });

                             // If this is a new record (not duplicate)
                             if (result.changes > 0) {
                                           const payment = db.getByInvoice(invoice.id);

                               // Send Email #1 immediately
                               await sendDunningEmail(payment, 1);
                                           db.markEmailSent(invoice.id);

                               // Notify in Telegram
                               await notifyNewFailedPayment(payment);
                                           await notifyEmailSent(payment, 1);
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

// For other routes use JSON
app.use(express.json());

// Healthcheck
app.get('/', (req, res) => {
        res.json({ 
                     status: 'ok', 
                  service: 'Stripe Dunning Service',
                  activePayments: db.getAllActive().length
        });
});

// Stats (can be removed in production)
app.get('/stats', (req, res) => {
        const active = db.getAllActive();
        res.json({
                  activeFailedPayments: active.length,
                  payments: active.map(p => ({
                              email: p.customer_email,
                              emailsSent: p.emails_sent,
                              createdAt: p.created_at
                  }))
        });
});

// ============ CRON JOBS ============

// Check every hour who needs to receive email
cron.schedule('0 * * * *', async () => {
        console.log('Running dunning check...');

                // Email #2 - after 3 days
                const dueForEmail2 = db.getDueForEmail(2, 3);
        for (const payment of dueForEmail2) {
                  console.log(`Sending Email #2 to ${payment.customer_email}`);
                  await sendDunningEmail(payment, 2);
                  db.markEmailSent(payment.stripe_invoice_id);
                  await notifyEmailSent(payment, 2);
        }

                // Email #3 - after 7 days
                const dueForEmail3 = db.getDueForEmail(3, 7);
        for (const payment of dueForEmail3) {
                  console.log(`Sending Email #3 to ${payment.customer_email}`);
                  await sendDunningEmail(payment, 3);
                  db.markEmailSent(payment.stripe_invoice_id);
                  await notifyEmailSent(payment, 3);
                  await notifyFinalWarning(payment);
        }

                console.log('Dunning check complete');
});

// ============ TEST ENDPOINT ============
// Test all 3 emails with 1 minute interval (remove in production!)
app.get('/test-dunning', async (req, res) => {
          const email = req.query.email || 'test@example.com';
          const name = req.query.name || 'Test User';

          // Create fake payment data for testing
          const testPayment = {
                      customer_name: name,
                      customer_email: email,
                      amount_due: 2900,
                      currency: 'usd',
                      stripe_invoice_id: 'test_' + Date.now()
          };

          res.json({ message: 'Test started! Check your email and Telegram.', email });

          // Email #1 - immediately
          console.log('TEST: Sending Email #1...');
          await sendDunningEmail(testPayment, 1);
          await notifyEmailSent(testPayment, 1);

          // Email #2 - after 1 minute
          setTimeout(async () => {
                      console.log('TEST: Sending Email #2...');
                      await sendDunningEmail(testPayment, 2);
                      await notifyEmailSent(testPayment, 2);
          }, 60000);

          // Email #3 - after 2 minutes
          setTimeout(async () => {
                      console.log('TEST: Sending Email #3...');
                      await sendDunningEmail(testPayment, 3);
                      await notifyEmailSent(testPayment, 3);
                      await notifyFinalWarning(testPayment);
          }, 120000);
});


// ============ START SERVER ============

async function start() {
        // Initialize database first
  await db.initDb();

  const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
                  console.log(`Dunning service running on port ${PORT}`);
                  console.log(`Active failed payments: ${db.getAllActive().length}`);
        });
}

start().catch(console.error);
