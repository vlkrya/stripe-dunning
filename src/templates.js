// Форматируем сумму
function formatAmount(cents, currency = 'usd') {
          const amount = (cents / 100).toFixed(2);
          const symbols = { usd: '$', eur: '€', rub: '₽' };
          return `${symbols[currency] || '$'}${amount}`;
}

// Email #1 — Сразу после неудачного платежа
function email1(customer, amount, currency) {
          const name = customer.name || 'there';
          return {
                      subject: 'Issue with your recent payment',
                      text: `Hi ${name},

                      I noticed your recent payment of ${formatAmount(amount, currency)} for Outreach Today didn't go through.

                      This usually happens due to insufficient funds, an expired card, or a temporary bank hold. Nothing to worry about — we'll automatically retry in a few days.

                      If you'd like to update your payment details beforehand, just reply to this email and I'll send you a direct link.

                      Thanks,
                      Anastasia
                      Customer Support, Outreach Today`
          };
}

// Email #2 — Через 3 дня
function email2(customer, amount, currency) {
          const name = customer.name || 'there';
          return {
                      subject: 'Following up on your payment',
                      text: `Hi ${name},

                      Just a quick follow-up — we still haven't been able to process your payment of ${formatAmount(amount, currency)}.

                      Your account is still active, but to avoid any interruption please update your payment method when you get a chance.

                      Reply to this email if you need a payment link or have any questions. Happy to help.

                      Best,
                      Anastasia
                      Customer Support, Outreach Today`
          };
}

// Email #3 — Через 7 дней (финальное предупреждение)
function email3(customer, amount, currency) {
          const name = customer.name || 'there';
          return {
                      subject: 'Your Outreach Today subscription',
                      text: `Hi ${name},

                      I wanted to reach out one more time regarding your outstanding payment of ${formatAmount(amount, currency)}.

                      Unfortunately, if we're unable to process the payment within the next 48 hours, your subscription will be cancelled and you'll lose access to your account.

                      If there's anything I can help with — whether it's a payment issue or you'd like to discuss your subscription — please reply to this email. I'm here to help.

                      Best,
                      Anastasia
                      Customer Support, Outreach Today`
          };
}

// Выбор шаблона по номеру
function getEmailTemplate(emailNumber, customer, amount, currency) {
          const templates = { 1: email1, 2: email2, 3: email3 };
          return templates[emailNumber](customer, amount, currency);
}

module.exports = { getEmailTemplate, formatAmount };
