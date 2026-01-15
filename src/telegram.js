const { formatAmount } = require('./templates');

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

async function sendTelegramMessage(text) {
      try {
              const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                                    chat_id: process.env.TELEGRAM_CHAT_ID,
                                    text,
                                    parse_mode: 'HTML'
                        })
              });

        const result = await response.json();
              if (!result.ok) {
                        console.error('Telegram error:', result);
              }
              return result;
      } catch (error) {
              console.error('Failed to send Telegram message:', error);
      }
}

// Notification about new failed payment
async function notifyNewFailedPayment(payment) {
      const text = `
      🔴 <b>Payment Failed</b>

      Customer: ${payment.customer_name || 'Unknown'}
      Email: ${payment.customer_email}
      Amount: ${formatAmount(payment.amount_due, payment.currency)}

      Email #1 sent automatically.
        `.trim();

  return sendTelegramMessage(text);
}

// Notification when email is sent (for any email number)
async function notifyEmailSent(payment, emailNumber) {
      const emailLabels = {
              1: '📧 Email #1 (First reminder)',
              2: '📧📧 Email #2 (Second reminder)',
              3: '🚨 Email #3 (FINAL warning)'
      };

  const text = `
  ${emailLabels[emailNumber] || `📧 Email #${emailNumber}`}

  Customer: ${payment.customer_name || 'Unknown'}
  Email: ${payment.customer_email}
  Amount: ${formatAmount(payment.amount_due, payment.currency)}
  Emails sent: ${emailNumber}/3

  ${emailNumber === 3 ? '⏰ <b>48 hours until subscription cancellation!</b>' : ''}
    `.trim();

  return sendTelegramMessage(text);
}

// Notification about final warning (Email #3)
async function notifyFinalWarning(payment) {
      const text = `
      🚨 <b>FINAL WARNING SENT</b>

      Customer: ${payment.customer_name || 'Unknown'}
      Email: ${payment.customer_email}
      Amount: ${formatAmount(payment.amount_due, payment.currency)}

      ⏰ <b>48 hours left!</b>
      Customer received final warning.
      Decide whether to cancel subscription manually if not paid.
        `.trim();

  return sendTelegramMessage(text);
}

// Notification when customer paid
async function notifyPaymentResolved(payment) {
      const text = `
      ✅ <b>Payment Resolved!</b>

      Customer: ${payment.customer_name || 'Unknown'}
      Email: ${payment.customer_email}
      Amount: ${formatAmount(payment.amount_due, payment.currency)}

      Customer paid, removed from dunning queue.
        `.trim();

  return sendTelegramMessage(text);
}

module.exports = {
      sendTelegramMessage,
      notifyNewFailedPayment,
      notifyEmailSent,
      notifyFinalWarning,
      notifyPaymentResolved
};
