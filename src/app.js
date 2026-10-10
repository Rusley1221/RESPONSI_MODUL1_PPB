import express from 'express';
import loanRoutes from './routes/loanRoutes.js';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Smart Library API - Kelompok 40 berjalan',
    endpoints: ['GET /loans', 'GET /loans/:id', 'POST /loans', 'PUT /loans/:id', 'PATCH /loans/:id', 'DELETE /loans/:id'],
  });
});

app.use('/loans', loanRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} tidak ditemukan` });
});

// Error handler (termasuk JSON body yang rusak)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Body JSON tidak valid' });
  }
  console.error(err);
  res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
});

export default app;
