import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('active_only') === 'true';

    let query = supabaseAdmin
      .from('operators')
      .select('*')
      .order('nama', { ascending: true });

    if (activeOnly) {
      query = query.eq('aktif', true);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('GET /api/operators error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nama, npk } = body;

    if (!nama || !npk) {
      return NextResponse.json({ error: "Nama dan NPK wajib diisi" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('operators')
      .insert([{ nama, npk, aktif: true }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // unique violation
        return NextResponse.json({ error: "NPK tersebut sudah terdaftar" }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('POST /api/operators error:', error);
    return NextResponse.json({ error: error.message || "Gagal menambahkan operator" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: "ID operator tidak ditemukan" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('operators')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Operator berhasil dihapus" });
  } catch (error: any) {
    console.error('DELETE /api/operators error:', error);
    return NextResponse.json({ error: error.message || "Gagal menghapus operator" }, { status: 500 });
  }
}
