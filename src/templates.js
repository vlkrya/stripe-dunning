function formatAmount(cents, currency = 'usd') {
      const amount = (cents / 100).toFixed(2);
      const symbols = { usd: '$', eur: '€', rub: '₽' };
      return `${symbols[currency] || '$'}${amount}`;
}

// Email #1 - Friendly first reminder
function email1(customer, amount, currency) {
      return {
              subject: 'Quick heads up about your payment',
              html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333;">Hi ${customer.name || 'there'},</h2>
                          <p>We hope you're doing well! We wanted to let you know that we had a small hiccup processing your recent payment of <strong>${formatAmount(amount, currency)}</strong>.</p>
                                <p>This happens sometimes and is usually easy to fix. Here are a few common reasons:</p>
                                      <ul>
                                              <li>The card on file may have expired</li>
                                                      <li>There might be insufficient funds</li>
                                                              <li>Your bank may have flagged the transaction</li>
                                                                    </ul>
                                                                          <p><strong>What you can do:</strong></p>
                                                                                <p>Simply update your payment method or check with your bank, and we'll automatically retry the payment.</p>
                                                                                      <p style="text-align: center; margin: 30px 0;">
                                                                                              <a href="https://billing.stripe.com/p/login/xxx" style="display: inline-block; background: #5469d4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Update Payment Method</a>
                                                                                                    </p>
                                                                                                          <p>If you have any questions, feel free to reply to this email — we're happy to help!</p>
                                                                                                                <p>Best regards,<br>The Support Team</p>
                                                                                                                    </div>`
      };
}

// Email #2 - Gentle follow-up
function email2(customer, amount, currency) {
      return {
              subject: 'Following up on your account',
              html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333;">Hi ${customer.name || 'there'},</h2>
                          <p>We wanted to follow up on our previous email about the payment of <strong>${formatAmount(amount, currency)}</strong> that didn't go through.</p>
                                <p>We completely understand that life gets busy, and these things can slip through the cracks. To make sure you don't lose access to your account, please take a moment to update your payment information.</p>
                                      <p style="text-align: center; margin: 30px 0;">
                                              <a href="https://billing.stripe.com/p/login/xxx" style="display: inline-block; background: #5469d4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Update Payment Method</a>
                                                    </p>
                                                          <p>If you're experiencing any issues or have questions about your subscription, we're here to help. Just reply to this email and we'll get back to you as soon as possible.</p>
                                                                <p>Thank you for being with us!</p>
                                                                      <p>Best regards,<br>The Support Team</p>
                                                                          </div>`
      };
}

// Email #3 - Final friendly reminder
function email3(customer, amount, currency) {
      return {
              subject: 'Your subscription needs attention',
              html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333;">Hi ${customer.name || 'there'},</h2>
                          <p>We've been trying to reach you about the outstanding payment of <strong>${formatAmount(amount, currency)}</strong>.</p>
                                <p>We really value having you as a customer and don't want you to lose access to your account. This is our final reminder before we'll need to pause your subscription.</p>
                                      <p><strong>Please update your payment method within the next 48 hours</strong> to keep your account active.</p>
                                            <p style="text-align: center; margin: 30px 0;">
                                                    <a href="https://billing.stripe.com/p/login/xxx" style="display: inline-block; background: #5469d4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Update Payment Now</a>
                                                          </p>
                                                                <p>If there's anything preventing you from completing this payment, or if you'd like to discuss your options, please don't hesitate to reach out. We're here to help find a solution that works for you.</p>
                                                                      <p>Thank you for your attention to this matter.</p>
                                                                            <p>Warm regards,<br>The Support Team</p>
                                                                                </div>`
      };
}

module.exports = { formatAmount, email1, email2, email3 };
