function formatAmount(cents, currency = 'usd') {
    const amount = (cents / 100).toFixed(2);
    const symbols = { usd: '$', eur: '€', rub: '₽' };
    return `${symbols[currency] || '$'}${amount}`;
}

function email1(customer, amount, currency) {
    return {
          subject: 'Payment failed — action required',
          html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Hi ${customer.name || 'there'},</h2>
                      <p>We tried to process your payment of <strong>${formatAmount(amount, currency)}</strong> for your Outreach Today subscription, but it didn't go through.</p>
                            <p>This can happen for a few reasons:</p>
                                  <ul><li>Insufficient funds</li><li>Expired card</li><li>Bank declined the transaction</li></ul>
                                        <p><strong>What to do:</strong></p>
                                              <p>Please update your payment method or ensure your card has sufficient funds.</p>
                                                    <a href="https://billing.stripe.com/p/login/xxx" style="display: inline-block; background: #5469d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Update Payment Method</a>
                                                          <p>If you have any questions, just reply to this email.</p>
                                                                <p>Best,<br>Outreach Today Team</p>
                                                                    </div>`
    };
}

function email2(customer, amount, currency) {
    return {
          subject: '⚠️ Your subscription is at risk',
          html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Hi ${customer.name || 'there'},</h2>
                      <p>We still haven't been able to process your payment of <strong>${formatAmount(amount, currency)}</strong>.</p>
                            <p style="background: #fff3cd; border: 1px solid #ffc107; padding: 16px; border-radius: 6px;"><strong>⚠️ Important:</strong> Please update your payment information to avoid any interruption to your service.</p>
                                  <p>Your Outreach Today account and all your saved emails are still safe, but we need you to take action.</p>
                                        <a href="https://billing.stripe.com/p/login/xxx" style="display: inline-block; background: #5469d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Update Payment Method Now</a>
                                              <p>Need help? Just reply to this email.</p>
                                                    <p>Best,<br>Outreach Today Team</p>
                                                        </div>`
    };
}

function email3(customer, amount, currency) {
    return {
          subject: '🚨 Final notice: 48 hours to save your account',
          html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #d9534f;">Hi ${customer.name || 'there'},</h2>
                      <p>This is our final reminder about your overdue payment of <strong>${formatAmount(amount, currency)}</strong>.</p>
                            <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 16px; border-radius: 6px; margin: 16px 0;">
                                    <strong>🚨 Your subscription will be cancelled in 48 hours</strong>
                                            <p style="margin: 8px 0 0 0;">If we don't receive payment, your account will be deactivated.</p>
                                                  </div>
                                                        <a href="https://billing.stripe.com/p/login/xxx" style="display: inline-block; background: #d9534f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Pay Now & Keep Your Account</a>
                                                              <p>If you're having trouble, please reply to this email immediately.</p>
                                                                    <p>Best,<br>Outreach Today Team</p>
                                                                        </div>`
    };
}

function getEmailTemplate(emailNumber, customer, amount, currency) {
    const templates = { 1: email1, 2: email2, 3: email3 };
    return templates[emailNumber](customer, amount, currency);
}

module.exports = { getEmailTemplate, formatAmount };
