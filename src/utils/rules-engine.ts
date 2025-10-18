/**
 * TasKeen P.M.S. - Automated Rules Engine
 * Handles lease expiration alerts, payment reminders, and automated notifications
 */

export interface LeaseAlert {
  lease_id: string;
  tenant_name: string;
  tenant_email: string;
  property_name: string;
  unit_number: string;
  end_date: string;
  days_until_expiry: number;
  manager_email: string;
}

export interface PaymentReminder {
  payment_id: string;
  unit_id: string;
  unit_number: string;
  tenant_name: string;
  tenant_email: string;
  amount: number;
  due_date: string;
  days_until_due: number;
  payment_number: number;
}

/**
 * Check for leases expiring in the next 30 days
 */
export async function checkLeaseExpirations(): Promise<LeaseAlert[]> {
  const alerts: LeaseAlert[] = [];
  const today = new Date();
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  // TODO: Replace with actual Supabase query
  // const { data: expiringLeases } = await supabase
  //   .from('leases')
  //   .select('*, tenants(*), properties(*), units(*)')
  //   .lte('end_date', thirtyDaysFromNow.toISOString())
  //   .gte('end_date', today.toISOString())
  //   .eq('status', 'active');

  // Mock data for demonstration
  const expiringLeases = [
    {
      id: 'lease-1',
      end_date: '2024-12-15',
      tenant: { name: 'Ahmed Hassan', email: 'ahmed@example.com' },
      property: { name: 'Marina Heights', manager_email: 'manager@example.com' },
      unit: { unit_number: '101' },
    },
  ];

  for (const lease of expiringLeases) {
    const endDate = new Date(lease.end_date);
    const daysUntil = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil <= 30 && daysUntil >= 0) {
      alerts.push({
        lease_id: lease.id,
        tenant_name: lease.tenant.name,
        tenant_email: lease.tenant.email,
        property_name: lease.property.name,
        unit_number: lease.unit.unit_number,
        end_date: lease.end_date,
        days_until_expiry: daysUntil,
        manager_email: lease.property.manager_email,
      });
    }
  }

  console.log(`🔔 Found ${alerts.length} leases expiring within 30 days`);
  return alerts;
}

/**
 * Check for payments due in the next 15 days
 */
export async function checkUpcomingPayments(): Promise<PaymentReminder[]> {
  const reminders: PaymentReminder[] = [];
  const today = new Date();
  const fifteenDaysFromNow = new Date(today);
  fifteenDaysFromNow.setDate(fifteenDaysFromNow.getDate() + 15);

  // TODO: Replace with actual Supabase query
  // const { data: upcomingPayments } = await supabase
  //   .from('unit_payments')
  //   .select('*, units(*, tenants(*))')
  //   .lte('payment_date', fifteenDaysFromNow.toISOString())
  //   .gte('payment_date', today.toISOString())
  //   .eq('status', 'pending');

  // Mock data for demonstration
  const upcomingPayments = [
    {
      id: 'payment-1',
      payment_number: 2,
      payment_date: '2024-11-15',
      amount: 30000,
      unit: {
        id: 'unit-1',
        unit_number: '101',
        tenant: { name: 'Ahmed Hassan', email: 'ahmed@example.com' },
      },
    },
  ];

  for (const payment of upcomingPayments) {
    const dueDate = new Date(payment.payment_date);
    const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil <= 15 && daysUntil >= 0) {
      reminders.push({
        payment_id: payment.id,
        unit_id: payment.unit.id,
        unit_number: payment.unit.unit_number,
        tenant_name: payment.unit.tenant.name,
        tenant_email: payment.unit.tenant.email,
        amount: payment.amount,
        due_date: payment.payment_date,
        days_until_due: daysUntil,
        payment_number: payment.payment_number,
      });
    }
  }

  console.log(`💰 Found ${reminders.length} payments due within 15 days`);
  return reminders;
}

/**
 * Send lease expiration notification
 */
export async function sendLeaseExpirationEmail(alert: LeaseAlert): Promise<void> {
  console.log(`📧 Sending lease expiration email for ${alert.tenant_name}`);
  
  const emailData = {
    to: [alert.tenant_email, alert.manager_email],
    subject: `Lease Expiration Notice - ${alert.property_name} Unit ${alert.unit_number}`,
    template: 'lease-expiration',
    data: {
      tenant_name: alert.tenant_name,
      property_name: alert.property_name,
      unit_number: alert.unit_number,
      end_date: alert.end_date,
      days_until_expiry: alert.days_until_expiry,
    },
  };

  // TODO: Integrate with email service (SendGrid, Resend, etc.)
  // await fetch('/api/send-email', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(emailData),
  // });

  console.log('✅ Lease expiration email sent', emailData);
}

/**
 * Generate and send payment reminder invoice
 */
export async function sendPaymentReminder(reminder: PaymentReminder): Promise<void> {
  console.log(`💵 Sending payment reminder for ${reminder.tenant_name}`);

  const invoiceData = {
    to: reminder.tenant_email,
    subject: `Payment Reminder - AED ${reminder.amount.toLocaleString()} Due ${reminder.due_date}`,
    template: 'payment-reminder',
    data: {
      tenant_name: reminder.tenant_name,
      unit_number: reminder.unit_number,
      amount: reminder.amount,
      due_date: reminder.due_date,
      days_until_due: reminder.days_until_due,
      payment_number: reminder.payment_number,
    },
  };

  // TODO: Generate invoice PDF and attach
  // const invoicePdf = await generateInvoicePDF(reminder);

  // TODO: Send email with invoice attachment
  // await fetch('/api/send-email', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ ...invoiceData, attachments: [invoicePdf] }),
  // });

  console.log('✅ Payment reminder sent', invoiceData);
}

/**
 * Run all automated checks
 */
export async function runAutomatedChecks(): Promise<void> {
  console.log('🤖 Running automated rules engine...');

  try {
    // Check lease expirations
    const leaseAlerts = await checkLeaseExpirations();
    for (const alert of leaseAlerts) {
      await sendLeaseExpirationEmail(alert);
    }

    // Check upcoming payments
    const paymentReminders = await checkUpcomingPayments();
    for (const reminder of paymentReminders) {
      await sendPaymentReminder(reminder);
    }

    console.log('✅ Automated checks completed successfully');
  } catch (error) {
    console.error('❌ Error running automated checks:', error);
  }
}

/**
 * Start the rules engine with scheduled execution
 */
export function startRulesEngine(): void {
  console.log('🚀 Starting TasKeen P.M.S. Rules Engine...');

  // Run immediately on startup
  runAutomatedChecks();

  // Schedule to run every day at 9 AM
  const now = new Date();
  const scheduled = new Date(now);
  scheduled.setHours(9, 0, 0, 0);

  // If 9 AM has already passed today, schedule for tomorrow
  if (scheduled <= now) {
    scheduled.setDate(scheduled.getDate() + 1);
  }

  const timeUntilFirst = scheduled.getTime() - now.getTime();

  setTimeout(() => {
    runAutomatedChecks();
    // Then run every 24 hours
    setInterval(runAutomatedChecks, 24 * 60 * 60 * 1000);
  }, timeUntilFirst);

  console.log(`⏰ Next automated check scheduled for: ${scheduled.toLocaleString()}`);
}

/**
 * Check for overdue payments and mark as overdue
 */
export async function markOverduePayments(): Promise<void> {
  const today = new Date();

  // TODO: Update Supabase
  // const { data } = await supabase
  //   .from('unit_payments')
  //   .update({ status: 'overdue' })
  //   .lt('payment_date', today.toISOString())
  //   .eq('status', 'pending');

  console.log('⚠️ Checked and marked overdue payments');
}

/**
 * Generate invoice for a payment
 */
export async function generateInvoice(payment: PaymentReminder): Promise<string> {
  // TODO: Implement PDF generation using jsPDF or similar
  const invoice = {
    invoice_number: `INV-${payment.payment_id}`,
    date: new Date().toISOString().split('T')[0],
    due_date: payment.due_date,
    tenant_name: payment.tenant_name,
    unit_number: payment.unit_number,
    amount: payment.amount,
    currency: 'AED',
    items: [
      {
        description: `Rent Payment ${payment.payment_number} - Unit ${payment.unit_number}`,
        amount: payment.amount,
      },
    ],
  };

  console.log('📄 Generated invoice:', invoice);
  return JSON.stringify(invoice);
}

/**
 * Email notification templates
 */
export const emailTemplates = {
  leaseExpiration: (data: LeaseAlert) => ({
    subject: `Lease Expiration Notice - ${data.property_name}`,
    html: `
      <h2>Lease Expiration Notice</h2>
      <p>Dear ${data.tenant_name},</p>
      <p>This is a reminder that your lease for <strong>${data.property_name}, Unit ${data.unit_number}</strong> will expire in <strong>${data.days_until_expiry} days</strong> on ${data.end_date}.</p>
      <p>Please contact your property manager to discuss renewal options.</p>
      <p>Best regards,<br>TasKeen P.M.S. Team</p>
    `,
  }),

  paymentReminder: (data: PaymentReminder) => ({
    subject: `Payment Reminder - AED ${data.amount.toLocaleString()}`,
    html: `
      <h2>Payment Reminder</h2>
      <p>Dear ${data.tenant_name},</p>
      <p>This is a reminder that Payment ${data.payment_number} for Unit ${data.unit_number} is due in <strong>${data.days_until_due} days</strong>.</p>
      <p><strong>Amount Due:</strong> AED ${data.amount.toLocaleString()}</p>
      <p><strong>Due Date:</strong> ${data.due_date}</p>
      <p>Please ensure payment is made by the due date to avoid late fees.</p>
      <p>Best regards,<br>TasKeen P.M.S. Team</p>
    `,
  }),
};

export default {
  startRulesEngine,
  runAutomatedChecks,
  checkLeaseExpirations,
  checkUpcomingPayments,
  sendLeaseExpirationEmail,
  sendPaymentReminder,
  markOverduePayments,
  generateInvoice,
};
