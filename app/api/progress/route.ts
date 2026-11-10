import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const supabase = supabaseAdmin();
    const { data, error } = await supabase.from('cagnotte_totals').select('total_eur, donor_count').eq('id', 1).single();
    if (error) throw error;
    return NextResponse.json({ total: Number(data.total_eur), donors: Number(data.donor_count) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ total: 0, donors: 0, configured: false }, { headers: { 'Cache-Control': 'no-store' } });
  }
}
