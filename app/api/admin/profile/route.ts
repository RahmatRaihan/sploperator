import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { emailBaru, passwordLama, passwordBaru } = await req.json();

    if (!passwordLama) {
      return NextResponse.json({ error: "Password lama wajib diisi untuk keamanan" }, { status: 400 });
    }

    // Ambil data admin dari database berdasarkan email di session
    const { data: adminUser, error: fetchError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', session.user.email)
      .single();

    if (fetchError || !adminUser) {
      return NextResponse.json({ error: "Admin tidak ditemukan" }, { status: 404 });
    }

    // Verifikasi password lama
    const isPasswordValid = await bcrypt.compare(passwordLama, adminUser.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Password lama salah" }, { status: 400 });
    }

    const updates: any = {};

    // Validasi dan set password baru jika ada
    if (passwordBaru) {
      if (passwordBaru.length < 5) {
        return NextResponse.json({ error: "Password baru minimal 5 karakter" }, { status: 400 });
      }
      updates.password_hash = await bcrypt.hash(passwordBaru, 10);
    }

    // Validasi dan set email baru jika ada
    if (emailBaru && emailBaru !== adminUser.email) {
      // Cek apakah email sudah dipakai
      const { data: existingEmail } = await supabaseAdmin
        .from('admin_users')
        .select('id')
        .eq('email', emailBaru)
        .single();
        
      if (existingEmail) {
        return NextResponse.json({ error: "Email sudah digunakan oleh admin lain" }, { status: 400 });
      }
      updates.email = emailBaru;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Tidak ada data yang diubah" }, { status: 400 });
    }

    const { error: updateError } = await supabaseAdmin
      .from('admin_users')
      .update(updates)
      .eq('id', adminUser.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true, message: "Profil berhasil diperbarui. Silakan login kembali dengan email/password baru jika diubah." });
  } catch (error: any) {
    console.error('Profile change error:', error);
    return NextResponse.json({ error: "Terjadi kesalahan sistem saat memperbarui profil" }, { status: 500 });
  }
}
