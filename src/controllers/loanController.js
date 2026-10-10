import { LoanModel } from '../models/loanModel.js';

export const VALID_STATUS = ['Dipinjam', 'Dikembalikan', 'Terlambat'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const isDate = (v) => typeof v === 'string' && DATE_RE.test(v) && !Number.isNaN(Date.parse(v));
const isText = (v) => typeof v === 'string' && v.trim().length > 0;
const today = () => new Date().toISOString().slice(0, 10);

const parseId = (raw) => (/^\d+$/.test(raw) ? Number(raw) : null);

const fail = (res, code, message, details) =>
  res.status(code).json({ success: false, message, ...(details && { errors: details }) });

const serverError = (res, err) => {
  console.error(err);
  return fail(res, 500, 'Terjadi kesalahan pada server', [err.message]);
};

// Validasi body. partial=true untuk PATCH (semua field opsional)
function validate(body, { partial = false } = {}) {
  const errors = [];
  const data = {};

  for (const f of ['member_name', 'member_nim', 'book_title']) {
    if (body[f] === undefined) {
      if (!partial) errors.push(`${f} wajib diisi`);
    } else if (!isText(body[f])) errors.push(`${f} harus berupa teks tidak kosong`);
    else data[f] = body[f].trim();
  }

  for (const f of ['book_author', 'notes']) {
    if (body[f] !== undefined) {
      if (body[f] !== null && typeof body[f] !== 'string') errors.push(`${f} harus berupa teks`);
      else data[f] = body[f];
    }
  }

  for (const f of ['loan_date', 'return_date']) {
    if (body[f] !== undefined) {
      if (body[f] === null && f === 'return_date') data[f] = null;
      else if (!isDate(body[f])) errors.push(`${f} harus berformat YYYY-MM-DD`);
      else data[f] = body[f];
    }
  }

  if (body.due_date === undefined) {
    if (!partial) errors.push('due_date wajib diisi');
  } else if (!isDate(body.due_date)) errors.push('due_date harus berformat YYYY-MM-DD');
  else data.due_date = body.due_date;

  if (body.status !== undefined) {
    if (!VALID_STATUS.includes(body.status)) errors.push(`status harus salah satu dari: ${VALID_STATUS.join(', ')}`);
    else data.status = body.status;
  }

  return { errors, data };
}

export const LoanController = {
  // GET /loans?status=&member_name=&book_title=
  async getLoans(req, res) {
    try {
      const { status, member_name, book_title } = req.query;
      if (status && !VALID_STATUS.includes(status)) {
        return fail(res, 400, `Nilai status tidak valid. Gunakan: ${VALID_STATUS.join(', ')}`);
      }
      const loans = await LoanModel.findAll({ status, member_name, book_title });
      res.json({ success: true, count: loans.length, data: loans });
    } catch (err) {
      serverError(res, err);
    }
  },

  // GET /loans/:id
  async getLoanById(req, res) {
    const id = parseId(req.params.id);
    if (id === null) return fail(res, 400, 'ID harus berupa angka');
    try {
      const loan = await LoanModel.findById(id);
      if (!loan) return fail(res, 404, `Peminjaman dengan id ${id} tidak ditemukan`);
      res.json({ success: true, data: loan });
    } catch (err) {
      serverError(res, err);
    }
  },

  // POST /loans
  async createLoan(req, res) {
    const { errors, data } = validate(req.body ?? {});
    if (errors.length) return fail(res, 400, 'Validasi gagal', errors);
    const loanDate = data.loan_date ?? today();
    if (data.due_date < loanDate) {
      return fail(res, 400, 'Validasi gagal', ['due_date tidak boleh sebelum loan_date']);
    }
    try {
      // Status awal selalu "Dipinjam" kecuali dikirim eksplisit
      const loan = await LoanModel.create({ status: 'Dipinjam', ...data, loan_date: loanDate });
      res.status(201).json({ success: true, message: 'Peminjaman berhasil dicatat', data: loan });
    } catch (err) {
      serverError(res, err);
    }
  },

  // PUT /loans/:id (ganti data) & PATCH /loans/:id (ubah sebagian)
  updateLoan(partial) {
    return async (req, res) => {
      const id = parseId(req.params.id);
      if (id === null) return fail(res, 400, 'ID harus berupa angka');
      const { errors, data } = validate(req.body ?? {}, { partial });
      if (errors.length) return fail(res, 400, 'Validasi gagal', errors);
      if (!Object.keys(data).length) return fail(res, 400, 'Tidak ada field yang diubah');

      // Jika dikembalikan dan return_date belum diisi, isi otomatis dengan hari ini
      if (data.status === 'Dikembalikan' && data.return_date === undefined) data.return_date = today();

      try {
        const updated = await LoanModel.update(id, data);
        if (!updated) return fail(res, 404, `Peminjaman dengan id ${id} tidak ditemukan`);
        res.json({ success: true, message: 'Peminjaman berhasil diperbarui', data: updated });
      } catch (err) {
        serverError(res, err);
      }
    };
  },

  // DELETE /loans/:id
  async deleteLoan(req, res) {
    const id = parseId(req.params.id);
    if (id === null) return fail(res, 400, 'ID harus berupa angka');
    try {
      const deleted = await LoanModel.remove(id);
      if (!deleted) return fail(res, 404, `Peminjaman dengan id ${id} tidak ditemukan`);
      res.json({ success: true, message: 'Peminjaman berhasil dihapus', data: deleted });
    } catch (err) {
      serverError(res, err);
    }
  },
};
