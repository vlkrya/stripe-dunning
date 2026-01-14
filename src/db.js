const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../data/dunning.db');
let db, SQL;

async function initDb() {
    SQL = await initSqlJs();
    try {
          if (fs.existsSync(dbPath)) {
                  db = new SQL.Database(fs.readFileSync(dbPath));
          } else {
                  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
                  db = new SQL.Database();
          }
    } catch (e) { db = new SQL.Database(); }
    db.run(`CREATE TABLE IF NOT EXISTS failed_payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
            stripe_customer_id TEXT NOT NULL,
                stripe_invoice_id TEXT UNIQUE NOT NULL,
                    customer_email TEXT NOT NULL,
                        customer_name TEXT,
                            amount_due INTEGER,
                                currency TEXT DEFAULT 'usd',
                                    emails_sent INTEGER DEFAULT 0,
                                        last_email_at DATETIME,
                                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                status TEXT DEFAULT 'active'
                                                  )`);
    saveDb();
    return db;
}

function saveDb() {
    fs.writeFileSync(dbPath, Buffer.from(db.export()));
}

function addFailedPayment({ customerId, invoiceId, email, name, amountDue, currency }) {
    try {
          db.run(`INSERT OR IGNORE INTO failed_payments (stripe_customer_id, stripe_invoice_id, customer_email, customer_name, amount_due, currency) VALUES (?, ?, ?, ?, ?, ?)`, [customerId, invoiceId, email, name, amountDue, currency]);
          const changes = db.getRowsModified();
          saveDb();
          return { changes };
    } catch (e) { return { changes: 0 }; }
}

function markEmailSent(invoiceId) {
    db.run(`UPDATE failed_payments SET emails_sent = emails_sent + 1, last_email_at = CURRENT_TIMESTAMP WHERE stripe_invoice_id = ?`, [invoiceId]);
    saveDb();
}

function removeByInvoice(invoiceId) {
    db.run(`UPDATE failed_payments SET status = 'resolved' WHERE stripe_invoice_id = ?`, [invoiceId]);
    saveDb();
}

function removeByCustomer(customerId) {
    db.run(`UPDATE failed_payments SET status = 'cancelled' WHERE stripe_customer_id = ?`, [customerId]);
    saveDb();
}

function resultToObjects(result) {
    if (!result || !result.length) return [];
    return result[0].values.map(row => {
          const obj = {};
          result[0].columns.forEach((col, i) => obj[col] = row[i]);
          return obj;
    });
}

function getDueForEmail(emailNumber, days) {
    return resultToObjects(db.exec(`SELECT * FROM failed_payments WHERE status = 'active' AND emails_sent = ${emailNumber - 1} AND datetime(created_at, '+${days} days') <= datetime('now')`));
}

function getAllActive() {
    return resultToObjects(db.exec(`SELECT * FROM failed_payments WHERE status = 'active'`));
}

function getByInvoice(invoiceId) {
    const r = resultToObjects(db.exec(`SELECT * FROM failed_payments WHERE stripe_invoice_id = '${invoiceId}'`));
    return r[0] || null;
}

module.exports = { initDb, addFailedPayment, markEmailSent, removeByInvoice, removeByCustomer, getDueForEmail, getAllActive, getByInvoice };
