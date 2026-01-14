const { Resend } = require('resend');
const { getEmailTemplate } = require('./templates');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendDunningEmail(payment, emailNumber) {
    const template = getEmailTemplate(emailNumber, { name: payment.customer_name, email: payment.customer_email }, payment.amount_due, payment.currency);
    try {
          const result = await resend.emails.send({
                  from: process.env.EMAIL_FROM,
                  to: payment.customer_email,
                  subject: template.subject,
                  html: template.html
          });
          console.log(`Email #${emailNumber} sent to ${payment.customer_email}`, result);
          return { success: true, result };
    } catch (error) {
          console.error(`Failed to send email to ${payment.customer_email}:`, error);
          return { success: false, error };
    }
}

module.exports = { sendDunningEmail };
