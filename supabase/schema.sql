create table if not exists public.loans (
  id           bigint generated always as identity primary key,
  member_name  text        not null,
  member_nim   text        not null,
  book_title   text        not null,
  book_author  text,
  loan_date    date        not null default current_date,
  due_date     date        not null,
  return_date  date,
  status       text        not null default 'Dipinjam'
               check (status in ('Dipinjam', 'Dikembalikan', 'Terlambat')),
  notes        text,
  created_at   timestamptz not null default now(),
  constraint due_after_loan check (due_date >= loan_date)
);

create index if not exists loans_status_idx on public.loans (status);

-- Akses hanya lewat server (service_role key), blokir akses langsung dari anon
alter table public.loans enable row level security;

-- Data contoh
insert into public.loans (member_name, member_nim, book_title, book_author, loan_date, due_date, return_date, status) values
  ('Andi Pratama',  '21120123140001', 'Clean Code',                    'Robert C. Martin', current_date - 5,  current_date + 9,  null,             'Dipinjam'),
  ('Siti Rahma',    '21120123140002', 'Pemrograman Web dengan Node.js', 'Budi Raharjo',     current_date - 20, current_date - 6,  null,             'Terlambat'),
  ('Budi Santoso',  '21120123140003', 'Algoritma dan Struktur Data',    'Rinaldi Munir',    current_date - 15, current_date - 1,  current_date - 2, 'Dikembalikan');
