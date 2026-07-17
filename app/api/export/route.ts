import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function GET(req: Request) {
  // Proteksi Auth
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');
  const nama = searchParams.get('nama');
  const npk = searchParams.get('npk');

  try {
    const includeAll = searchParams.get('include_all') === 'true';

    let query = supabaseAdmin
      .from('overtime_records')
      .select('*');
      
    if (!includeAll) {
      query = query.eq('is_validated', true);
    }
    
    query = query.order('tanggal', { ascending: true });

    if (nama) query = query.ilike('nama', `%${nama}%`);
    if (npk) query = query.eq('npk', npk);
    
    let periodeText = "Semua Waktu";
    
    if (startDate) {
      query = query.gte('tanggal', startDate);
    }
    if (endDate) {
      query = query.lte('tanggal', endDate);
    }
    
    if (startDate && endDate) {
      periodeText = `${format(new Date(startDate), 'dd MMM yyyy', { locale: localeId })} - ${format(new Date(endDate), 'dd MMM yyyy', { locale: localeId })}`;
    } else if (startDate) {
      periodeText = `Sejak ${format(new Date(startDate), 'dd MMM yyyy', { locale: localeId })}`;
    } else if (endDate) {
      periodeText = `Hingga ${format(new Date(endDate), 'dd MMM yyyy', { locale: localeId })}`;
    }

    const { data, error } = await query;

    if (error) throw error;

    // Build Excel
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Thermal PP');

    // Kolom
    sheet.columns = [
      { key: 'no', width: 5 },
      { key: 'tanggal', width: 15 },
      { key: 'nama', width: 25 },
      { key: 'npk', width: 15 },
      { key: 'divisi', width: 25 },
      { key: 'start', width: 10 },
      { key: 'out', width: 10 },
      { key: 'jam_lembur', width: 12 },
      { key: 'ket_hari', width: 18 },
      { key: 'keterangan', width: 30 }
    ];

    // Baris 1: Judul
    sheet.mergeCells('A1:J1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'REKAPAN LEMBUR OPERATOR DIVISI THERMAL POWER PLANT';
    titleCell.font = { bold: true, size: 13, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1D4ED8' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Baris 2: Periode
    sheet.mergeCells('A2:J2');
    const subtitleCell = sheet.getCell('A2');
    subtitleCell.value = `Periode: ${periodeText}`;
    subtitleCell.font = { bold: true };
    subtitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    subtitleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Baris 3: Kosong
    sheet.addRow([]);

    // Baris 4: Header Kolom
    const headers = ['No', 'Tanggal', 'Nama', 'NPK', 'Divisi', 'Start', 'Out', 'Jam Lembur', 'Keterangan Hari', 'Keterangan / Bukti'];
    const headerRow = sheet.addRow(headers);
    
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });

    // Baris Data
    let totalJam = 0;
    
    data?.forEach((row, i) => {
      const dataRow = sheet.addRow([
        i + 1,
        format(new Date(row.tanggal), 'dd-MM-yyyy'),
        row.nama?.toUpperCase(),
        row.npk,
        row.divisi,
        row.start_time.substring(0, 5),
        row.out_time.substring(0, 5),
        row.jam_lembur,
        row.ket_hari,
        row.keterangan || '-'
      ]);

      totalJam += row.jam_lembur;

      const isEven = i % 2 === 0;
      dataRow.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
        if (!isEven) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        }
        if (colNumber === 1 || colNumber === 6 || colNumber === 7 || colNumber === 8) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        }
      });
    });

    // Baris Terakhir (Total)
    const totalRow = sheet.addRow(['TOTAL', '', '', '', '', '', '', totalJam, '', '']);
    sheet.mergeCells(`A${totalRow.number}:G${totalRow.number}`);
    
    totalRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'right' };
    totalRow.getCell(1).font = { bold: true };
    totalRow.getCell(8).font = { bold: true };
    totalRow.getCell(8).alignment = { vertical: 'middle', horizontal: 'center' };
    
    totalRow.eachCell((cell, colNumber) => {
      if (colNumber <= 8) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } }; // light green
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
      }
    });

    // Generate file
    const buffer = await workbook.xlsx.writeBuffer();

    const safePeriodeText = periodeText.replace(/[^a-zA-Z0-9 -]/g, '').replace(/ /g, '_');
    const filename = `Rekapan_Lembur_TPP_${safePeriodeText}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });

  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
