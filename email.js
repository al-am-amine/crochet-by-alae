import emailjs from '@emailjs/browser'

// Sends an order-notification email to Alae's designated site email
// (configured once inside the EmailJS template itself — see README) using
// EmailJS's free client-side service (no backend server needed).
// The customer's own email (if she typed one) is passed as reply_to, so
// Alae can hit "Reply" in her inbox and it goes straight to the customer.
//
// Required template variables in your EmailJS template (use these exact
// names, wrapped in {{double_braces}}, in the template's subject/body):
//   {{customer_name}} {{customer_phone}} {{customer_email}} {{commune}}
//   {{address}} {{order_summary}} {{total}} {{reply_to}}
export async function sendOrderNotification({
  customerName,
  phone,
  email,
  commune,
  address,
  orderSummary,
  total,
}) {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

  // If EmailJS isn't configured yet, skip quietly rather than breaking
  // the order flow — WhatsApp/Instagram routing still goes through fine.
  if (!serviceId || !templateId || !publicKey) {
    console.warn('EmailJS is not configured — skipping order-notification email.')
    return { sent: false }
  }

  try {
    await emailjs.send(
      serviceId,
      templateId,
      {
        customer_name: customerName,
        customer_phone: phone,
        customer_email: email || 'لم تُدخل الزبونة بريداً إلكترونياً',
        commune,
        address,
        order_summary: orderSummary,
        total: total ?? 'السعر حسب الطلب',
        reply_to: email || '',
      },
      { publicKey },
    )
    return { sent: true }
  } catch (err) {
    console.error('Failed to send order-notification email', err)
    return { sent: false }
  }
}
