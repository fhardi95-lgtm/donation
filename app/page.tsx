'use client';

import { useEffect, useMemo, useState } from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';

type Progress = { total: number; donors: number };
const GOAL = 2000;
const format = (value: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);

function Campaign() {
  const [amount, setAmount] = useState(10);
  const [custom, setCustom] = useState('');
  const [progress, setProgress] = useState<Progress>({ total: 0, donors: 0 });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const selectedAmount = custom.trim() ? Number(custom) : amount;
  const percent = Math.min(100, Math.round((progress.total / GOAL) * 100));
  const validAmount = Number.isFinite(selectedAmount) && selectedAmount >= 1 && selectedAmount <= 2000;

  async function refreshProgress() {
    try {
      const response = await fetch('/api/progress', { cache: 'no-store' });
      const data = await response.json();
      setProgress({ total: Number(data.total) || 0, donors: Number(data.donors) || 0 });
    } catch { /* The campaign page remains usable while progress is unavailable. */ }
    finally { setLoading(false); }
  }
  useEffect(() => { void refreshProgress(); }, []);

  const paypalOptions = useMemo(() => ({
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test',
    currency: 'EUR',
    intent: 'capture' as const
  }), []);

  return <main className="page-shell">
    <div className="top-mark"><span className="mark-heart">♥</span> CAGNOTTE SOLIDAIRE</div>
    <section className="campaign-card">
      <div className="hero" role="img" aria-label="Des mains réunies autour d’un cœur rouge">
        <div className="hero-glow" />
        <div className="heart-art">♥</div>
        <div className="hero-caption">La solidarité nous rapproche</div>
      </div>
      <div className="content">
        <div className="eyebrow">ENSEMBLE, FAISONS LA DIFFÉRENCE</div>
        <h1>Aidons un frère à retrouver son épouse <span>❤️</span></h1>
        <p className="intro">Un jeune marié souhaite rejoindre son épouse à Djibouti pour commencer leur vie ensemble. Aujourd’hui, notre solidarité peut l’aider à franchir cette étape.</p>

        <div className="progress-head"><span>Objectif de la collecte</span><strong>{format(GOAL)}</strong></div>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${percent}%` }} /></div>
        <div className="raised-row"><strong>{format(progress.total)}</strong><span>{percent} %</span></div>
        <p className="small-muted">{loading ? 'Chargement de la collecte…' : `${progress.donors} ${progress.donors > 1 ? 'contributeurs' : 'contributeur'} · ${format(Math.max(0, GOAL - progress.total))} restants`}</p>

        <div className="divider" />
        <h2>Votre soutien peut faire la différence</h2>
        <p className="body-copy">Ses revenus sont modestes et les charges du quotidien s’accumulent. Malgré ses efforts, il lui est très difficile d’économiser suffisamment pour financer son voyage. Chaque contribution, selon vos moyens, l’aidera à se rapprocher de son épouse.</p>
        <p className="gentle-note">Il n’y a aucun montant obligatoire. Si vous ne pouvez pas donner, partager cette cagnotte est déjà un précieux soutien.</p>

        <h2 className="donation-title">Choisissez votre contribution</h2>
        <div className="amount-grid">
          {[5, 10, 20, 50].map(value => <button key={value} className={`amount-button ${!custom && amount === value ? 'selected' : ''}`} onClick={() => { setAmount(value); setCustom(''); setMessage(''); }}>{format(value)}</button>)}
        </div>
        <label className="custom-label" htmlFor="custom-amount">Ou indiquez un montant libre (€)</label>
        <input id="custom-amount" className="custom-input" inputMode="decimal" type="number" min="1" max="2000" step="0.01" placeholder="Autre montant" value={custom} onChange={e => { setCustom(e.target.value); setMessage(''); }} />
        {!validAmount && <p className="error">Choisissez un montant compris entre 1 € et 2 000 €.</p>}

        <div className="paypal-wrap">
          {process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? <PayPalScriptProvider options={paypalOptions}>
            <PayPalButtons style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay', height: 48 }}
              disabled={!validAmount}
              createOrder={async () => {
                const response = await fetch('/api/paypal/create-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: selectedAmount.toFixed(2) }) });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Impossible de créer le paiement.');
                return data.id;
              }}
              onApprove={async data => {
                setMessage('Confirmation du paiement…');
                const response = await fetch('/api/paypal/capture-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderID: data.orderID }) });
                const result = await response.json();
                if (!response.ok) { setMessage(result.error || 'Le paiement doit être vérifié.'); return; }
                setMessage('Merci infiniment pour votre générosité. Votre don a bien été confirmé. ❤️');
                setCustom(''); setAmount(10); await refreshProgress();
              }}
              onError={() => setMessage('Une erreur est survenue avec PayPal. Veuillez réessayer.')}
              onCancel={() => setMessage('Paiement annulé. Aucun montant n’a été prélevé.')}
            />
          </PayPalScriptProvider> : <div className="setup-notice">Le paiement PayPal sera activé après configuration des identifiants dans le fichier <code>.env.local</code>.</div>}
        </div>
        {message && <p className="payment-message" role="status">{message}</p>}
        <div className="secure-line">🔒 Paiement traité par PayPal · Vos informations bancaires ne transitent pas par ce site.</div>
        <div className="divider" />
        <blockquote>« Celui qui soulage un croyant d’une difficulté, Allah le soulagera d’une difficulté au Jour de la Résurrection. »</blockquote>
        <p className="closing">Qu’Allah récompense chaque geste, mette la baraka dans vos biens et facilite leurs retrouvailles. <strong>BarakAllahu fikoum. 🤲</strong></p>
      </div>
    </section>
    <footer>Une initiative de solidarité · Merci de donner librement, selon vos moyens.</footer>
  </main>;
}

export default function Home() { return <Campaign />; }
