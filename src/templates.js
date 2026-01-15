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
                  subject: 'Quick heads up about your payment',
                  text: `Hey ${name}!

                  It's Anastasia from Outreach Today.

                  I just wanted to let you know that your payment of ${formatAmount(amount, currency)} didn't go through. This happens sometimes — it could be an expired card, insufficient funds, or just a temporary bank issue.

                  No worries though! Just update your payment info and we'll retry automatically.

                  If you have any questions or need help, just reply to this email. I'm here to help!

                  Best,
                  Anastasia
                  Outreach Today
                  https://outreach2day.com/`
        };
}

// Email #2 — Через 3 дня
function email2(customer, amount, currency) {
        const name = customer.name || 'there';
        return {
                  subject: 'Following up on your account',
                  text: `Hey ${name}!

                  It's Anastasia again from Outreach Today.

                  I noticed we still haven't been able to process your payment of ${formatAmount(amount, currency)}. I wanted to check in and make sure everything is okay on your end.

                  Your account and all your data are still safe — I just need you to update your payment method so we can keep your subscription active.

                  Is there anything I can help you with? Maybe you have questions about your subscription or need to make some changes? Just hit reply and let me know.

                  Best,
                  Anastasia
                  Outreach Today
                  https://outreach2day.com/`
        };
}

// Email #3 — Через 7 дней (финальное предупреждение)
function email3(customer, amount, currency) {
        const name = customer.name || 'there';
        return {
                  subject: 'Your subscription needs attention',
                  text: `Hey ${name},

                  It's Anastasia from Outreach Today one more time.

                  I really don't want to see you go, but I have to let you know that your subscription will be cancelled in 48 hours if we can't process your payment of ${formatAmount(amount, currency)}.

                  Once cancelled, you'll lose access to your account and all your saved data.

                  If you want to keep your account, please update your payment info as soon as possible.

                  If you've decided to cancel or if something came up, I totally understand. Just let me know by replying to this email so I know what's going on.

                  Hope to hear from you!

                  Best,
                  Anastasia
                  Outreach Today
                  https://outreach2day.com/`
        };
}

// Выбор шаблона по номеру
function getEmailTemplate(emailNumber, customer, amount, currency) {
        const templates = { 1: email1, 2: email2, 3: email3 };
        return templates[emailNumber](customer, amount, currency);
}

module.exports = { getEmailTemplate, formatAmount };
