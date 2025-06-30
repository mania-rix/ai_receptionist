import { NextResponse } from 'next/server';
//import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase';
import { createDigitalBusinessCard, verifyDigitalCard } from '@/lib/picaos';
import { recordCardAudit } from '@/lib/algorand';

export async function POST(req: Request) {
  console.log('[API:digital-cards] POST request');
  try {
    const { name, title, company, email, phone, image_url } = await req.json();
    console.log('[API:digital-cards] POST payload:', { name, title, company, email });
    
    const cookieStore = cookies();
    const supabase = supabaseServer(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[API:digital-cards] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create digital business card
    const card = await createDigitalBusinessCard({
      name,
      title,
      company,
      email,
      phone,
      // In a real implementation, we would handle file upload
      // For demo, we just use the provided image URL
    });

    // Record audit log on blockchain
    await recordCardAudit(card.id, user.id, {
      name,
      company,
      ipfs_hash: card.ipfs_hash
    });

    console.log('[API:digital-cards] Card created:', card.id);
    return NextResponse.json({ card });
  } catch (error) {
    console.error('[API:digital-cards] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to create digital card' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  console.log('[API:digital-cards] GET request');
  try {
    const cookieStore = cookies();
    const supabase = supabaseServer(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[API:digital-cards] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In a real implementation, we would fetch cards from database
    // For demo, we return mock data
    const cards = [
      {
        id: 'demo_card_1',
        name: 'Dr. Sarah Johnson',
        title: 'Chief Medical Officer',
        company: 'BlvckWall Medical AI',
        email: 'sarah.johnson@blvckwall.ai',
        phone: '+1 (555) 123-4567',
        image_url: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=300',
        ipfs_hash: 'QmDemo123456789SarahJohnson',
        qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://ipfs.io/ipfs/QmDemo123456789SarahJohnson',
        verification_url: 'https://picaos.com/verify/QmDemo123456789SarahJohnson',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'demo_card_2',
        name: 'Michael Chen',
        title: 'AI Solutions Architect',
        company: 'BlvckWall AI',
        email: 'michael.chen@blvckwall.ai',
        phone: '+1 (555) 987-6543',
        image_url: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300',
        ipfs_hash: 'QmDemo987654321MichaelChen',
        qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://ipfs.io/ipfs/QmDemo987654321MichaelChen',
        verification_url: 'https://picaos.com/verify/QmDemo987654321MichaelChen',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];

    console.log('[API:digital-cards] GET response:', cards.length);
    return NextResponse.json({ cards });
  } catch (error) {
    console.error('[API:digital-cards] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch digital cards' },
      { status: 500 }
    );
  }
}