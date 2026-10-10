import { supabase } from '../config/db.js';

const TABLE = 'loans';
const today = () => new Date().toISOString().slice(0, 10);

// Peminjaman berstatus "Dipinjam" yang melewati due_date otomatis menjadi "Terlambat"
async function syncOverdue() {
  const { error } = await supabase
    .from(TABLE)
    .update({ status: 'Terlambat' })
    .eq('status', 'Dipinjam')
    .lt('due_date', today());
  if (error) throw error;
}

export const LoanModel = {
  async findAll({ status, member_name, book_title } = {}) {
    await syncOverdue();
    let query = supabase.from(TABLE).select('*').order('id', { ascending: true });
    if (status) query = query.eq('status', status);
    if (member_name) query = query.ilike('member_name', `%${member_name}%`);
    if (book_title) query = query.ilike('book_title', `%${book_title}%`);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async findById(id) {
    await syncOverdue();
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(payload) {
    const { data, error } = await supabase.from(TABLE).insert(payload).select().single();
    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const { data, error } = await supabase
      .from(TABLE)
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { data, error } = await supabase.from(TABLE).delete().eq('id', id).select().maybeSingle();
    if (error) throw error;
    return data;
  },
};
