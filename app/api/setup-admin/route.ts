import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function GET() {
  const email = 'admin@bai.id';
  const password = 'admin'; // simple default
  
  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .insert([{ email, password_hash: hashedPassword, nama: 'Administrator' }]);

  if (error) {
    if (error.code === '23505') { // unique violation
       return NextResponse.json({ message: "Admin user already exists!" });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Admin user created successfully!" });
}
