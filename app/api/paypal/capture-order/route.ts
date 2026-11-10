import { NextResponse } from 'next/server';
import { paypalAccessToken, paypalApiBase } from '@/lib/paypal';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const { orderID } = await request.json();
    if (typeof orderID !== 'string' || !orderID) return NextResponse.json({ error: 'Commande invalide.' }, { status: 400 });
    const token = await paypalAccessToken();
    const response = await fetch(`${paypalApiBase()}/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      cache: 'no-store'
    });
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: 'Le paiement n’a pas été confirmé par PayPal.' }, { status: 400 });

    const capture = data.purchase_units?.[0]?.payments?.captures?.[0];
    if (capture?.status !== 'COMPLETED' || capture?.amount?.currency_code !== 'EUR') {
      return NextResponse.json({ error: 'Le paiement n’est pas confirmé.' }, { status: 400 });
    }

    // Store only confirmed captures. The SQL function prevents duplicate capture IDs.
    const supabase = supabaseAdmin();
    const { error } = await supabase.rpc('record_cagnotte_donation', {
      p_capture_id: capture.id,
      p_amount: Number(capture.amount.value)
    });
    if (error) throw error;
    return NextResponse.json({ status: 'COMPLETED', amount: capture.amount.value });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Paiement reçu, mais la mise à jour de la cagnotte a échoué. Contactez l’organisateur avec votre reçu PayPal.' }, { status: 500 });
  }
}
