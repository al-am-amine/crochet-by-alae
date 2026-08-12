import { supabase } from './supabaseClient'

// Fetches only the channels the admin has enabled. Each row in
// `contact_channels` looks like: { type: 'whatsapp' | 'instagram' | 'phone' | 'tiktok',
// value: '2135...' or a DM link, enabled: true/false }
export async function getEnabledChannels() {
  const { data, error } = await supabase
    .from('contact_channels')
    .select('type, value')
    .eq('enabled', true)

  if (error) {
    console.error('Failed to load contact channels', error)
    return []
  }
  return data ?? []
}

function buildOrderText(order) {
  const lines = [
    `مرحباً، أريد طلب المنتج التالي:`,
    order.productName ? `المنتج: ${order.productName}` : null,
    order.color ? `اللون: ${order.color}` : null,
    order.size ? `المقاس: ${order.size}` : null,
    order.notes ? `ملاحظات: ${order.notes}` : null,
    order.customerName ? `الاسم: ${order.customerName}` : null,
    order.commune ? `البلدية: ${order.commune}` : null,
    order.address ? `العنوان: ${order.address}` : null,
  ].filter(Boolean)
  return lines.join('\n')
}

// Call this when the customer taps an order/confirm button for a given channel.
export async function sendOrderViaChannel(channel, order) {
  const text = buildOrderText(order)

  if (channel.type === 'whatsapp') {
    const url = `https://wa.me/${channel.value}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
    return { copied: false }
  }

  if (channel.type === 'instagram') {
    // Instagram DM links don't support pre-filled message text, so we
    // copy the order details to the clipboard and open the chat —
    // the UI should show a toast telling the customer to paste it.
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Clipboard API can fail (e.g. no HTTPS/permission) — the customer
      // can still read and retype from the confirmation screen.
    }
    window.open(channel.value, '_blank')
    return { copied: true }
  }

  if (channel.type === 'phone') {
    window.location.href = `tel:${channel.value}`
    return { copied: false }
  }

  return { copied: false }
}
