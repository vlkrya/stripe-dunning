const { formatAmount } = require('./templates');

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

async function sendTelegramMessage(text) {
    try {
          const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' })
          });
          return await response.json();
    } catch (error) {
          console.error('Failed to send Telegram message:', error);
    }
}

async function notifyNewFailedPayment(payment) {
    return sendTelegramMessage(`Payment Failed\n\nCustomer: ${payment.customer_name || 'Unknown'}\nEmail: ${payment.customer_email}\nAmount: ${formatAmount(payment.amount_due, payment.currency)}\n\nEmail #1 sent automatically.`);
}

async function notifyFinalWarning(payment) {
    return sendTelegramMessage(`FINAL WARNING SENT\n\nCustomer: ${payment.customer_name || 'Unknown'}\nEmail: ${payment.customer_email}\nAmount: ${formatAmount(payment.amount_due, payment.currency)}\n\n48 hours until cancellation!`);
}

async function notifyPaymentResolved(payment) {
    return sendTelegramMessage(`Payment Resolved!\n\nCustomer: ${payment.customer_name || 'Unknown'}\nEmail: ${payment.customer_email}\nAmount: ${formatAmount(payment.amount_due, payment.currency)}`);
}

module.exports = { sendTelegramMessage, notifyNewFailedPayment, notifyFinalWarning, notifyPaymentResolved };
