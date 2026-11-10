import { NextResponse } from 'next/server';
import { paypalAccessToken, paypalApiBase } from '@/lib/paypal';

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();
    const value = Number(amount);
    if (!Number.isFinite(value) || value < 1 || value > 2000 || Math.round(value * 100) !== value * 100) {
      return NextResponse.json({ error: 'Montant invalide.' }, { status: 400 });
    }
    const token = await paypalAccessToken();
    const response = await fetch(`${paypalApiBase()}/v2/checkout/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: 'cagnotte-voyage-djibouti',
          description: 'Don solidaire - aide au voyage pour rejoindre son épouse à Djibouti',
          amount: { currency_code: 'EUR', value: value.toFixed(2) }
        }]
      }),
      cache: 'no-store'
    });
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: 'PayPal n’a pas pu créer le paiement.' }, { status: 502 });
    return NextResponse.json({ id: data.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Service de paiement momentanément indisponible.' }, { status: 500 });
  }
}
