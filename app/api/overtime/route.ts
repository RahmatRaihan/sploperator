import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as z from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// We create an admin client to bypass RLS for uploads and inserts
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const postSchema = z.object({
  tanggal: z.string(),
  nama: z.string(),
  npk: z.string(),
  divisi: z.string(),
  start_time: z.string(),
  out_time: z.string(),
  jam_lembur: z.number(),
  ket_hari: z.enum(["Hari Kerja", "Hari Libur"]),
  keterangan: z.string().optional()
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // 1. Upload File if exists
    const file = formData.get('bukti_file') as File | null;
    let bukti_url = null;

    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('bukti_spl')
        .upload(filename, buffer, {
          contentType: file.type,
          upsert: false
        });
        
      if (uploadError) {
        throw new Error(`Upload file gagal: ${uploadError.message}`);
      }

      // 2. Get Public URL
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('bukti_spl')
        .getPublicUrl(filename);
        
      bukti_url = publicUrl;
    }

    // 3. Extract Fields and Validate
    const payload = {
      tanggal: formData.get('tanggal'),
      nama: formData.get('nama'),
      npk: formData.get('npk'),
      divisi: formData.get('divisi'),
      start_time: formData.get('start_time'),
      out_time: formData.get('out_time'),
      jam_lembur: Number(formData.get('jam_lembur')),
      ket_hari: formData.get('ket_hari'),
      keterangan: formData.get('keterangan'),
    };
    
    const data = postSchema.parse(payload);

    // 4. Insert to Database
    const { error } = await supabaseAdmin
      .from('overtime_records')
      .insert([{ ...data, bukti_url }]);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Data berhasil disimpan" });
  } catch (error: any) {
    console.error('POST /api/overtime error:', error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan sistem" }, 
      { status: 400 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const bulan = searchParams.get('bulan');
  const tahun = searchParams.get('tahun');
  const nama = searchParams.get('nama');
  const npk = searchParams.get('npk');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '25');
  const sort_by = searchParams.get('sort_by') || 'tanggal';
  const sort_order = searchParams.get('sort_order') || 'desc';

  try {
    let query = supabaseAdmin
      .from('overtime_records')
      .select('*', { count: 'exact' });

    if (nama) {
      query = query.ilike('nama', `%${nama}%`);
    }
    if (npk) {
      query = query.eq('npk', npk);
    }
    if (bulan && tahun) {
      const startDate = `${tahun}-${bulan.padStart(2, '0')}-01`;
      const endMonth = parseInt(bulan) === 12 ? 1 : parseInt(bulan) + 1;
      const endYear = parseInt(bulan) === 12 ? parseInt(tahun) + 1 : parseInt(tahun);
      const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;
      
      query = query.gte('tanggal', startDate).lt('tanggal', endDate);
    } else if (tahun) {
      const startDate = `${tahun}-01-01`;
      const endDate = `${parseInt(tahun) + 1}-01-01`;
      query = query.gte('tanggal', startDate).lt('tanggal', endDate);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    query = query.order(sort_by, { ascending: sort_order === 'asc' });
    if (sort_by !== 'tanggal') {
      query = query.order('tanggal', { ascending: false });
    }
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      data,
      meta: {
        total: count,
        page,
        limit,
        totalPages: count ? Math.ceil(count / limit) : 0
      }
    });
  } catch (error: any) {
    console.error('GET /api/overtime error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: "ID data lembur tidak ditemukan" }, { status: 400 });
    }

    // Ambil record lama untuk mendapatkan URL bukti
    const { data: existingRecord } = await supabaseAdmin
      .from('overtime_records')
      .select('bukti_url')
      .eq('id', id)
      .single();

    if (existingRecord?.bukti_url) {
      const oldFilename = existingRecord.bukti_url.split('/').pop();
      if (oldFilename) {
        await supabaseAdmin.storage.from('bukti_spl').remove([decodeURIComponent(oldFilename)]);
      }
    }

    const { error } = await supabaseAdmin
      .from('overtime_records')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Data berhasil dihapus" });
  } catch (error: any) {
    console.error('DELETE /api/overtime error:', error);
    return NextResponse.json(
      { error: error.message || "Gagal menghapus data" }, 
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const id = formData.get('id') as string;
    
    if (!id) {
      return NextResponse.json({ error: "ID data lembur tidak ditemukan" }, { status: 400 });
    }

    const payload: any = {
      tanggal: formData.get('tanggal'),
      nama: formData.get('nama'),
      npk: formData.get('npk'),
      divisi: formData.get('divisi'),
      start_time: formData.get('start_time'),
      out_time: formData.get('out_time'),
      jam_lembur: Number(formData.get('jam_lembur')),
      ket_hari: formData.get('ket_hari'),
      keterangan: formData.get('keterangan'),
    };

    const file = formData.get('bukti_file') as File | null;
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('bukti_spl')
        .upload(filename, buffer, { contentType: file.type, upsert: false });
        
      if (!uploadError) {
        // Hapus file lama jika ada dan jika upload file baru sukses
        const { data: existingRecord } = await supabaseAdmin
          .from('overtime_records')
          .select('bukti_url')
          .eq('id', id)
          .single();

        if (existingRecord?.bukti_url) {
          const oldFilename = existingRecord.bukti_url.split('/').pop();
          if (oldFilename) {
            await supabaseAdmin.storage.from('bukti_spl').remove([decodeURIComponent(oldFilename)]);
          }
        }

        const { data: { publicUrl } } = supabaseAdmin.storage.from('bukti_spl').getPublicUrl(filename);
        payload.bukti_url = publicUrl;
      }
    }

    const { error } = await supabaseAdmin
      .from('overtime_records')
      .update(payload)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Data berhasil diperbarui" });
  } catch (error: any) {
    console.error('PUT /api/overtime error:', error);
    return NextResponse.json({ error: error.message || "Gagal memperbarui data" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, is_validated } = await req.json();
    
    if (!id || typeof is_validated !== 'boolean') {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('overtime_records')
      .update({ is_validated })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Status validasi berhasil diperbarui" });
  } catch (error: any) {
    console.error('PATCH /api/overtime error:', error);
    return NextResponse.json({ error: error.message || "Gagal memperbarui validasi" }, { status: 500 });
  }
}
