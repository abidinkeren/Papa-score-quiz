# Aplikasi Papan Skor Kuis Cepat Tangkas Berkelompok

Aplikasi papan skor interaktif cerdas cermat / kuis cepat tangkas modern untuk 3 tingkatan (Kelas 7, 8, dan 9) dengan masing-masing 6 kelompok, dilengkapi mode proyektor panggung layar penuh, panel kendali juri/operator, timer hitung mundur terintegrasi, efek suara audio Web Audio API, serta audit trail riwayat skor dan ekspor hasil.

## User Review & Critical Decisions

> [!IMPORTANT]
> Konfigurasi default berikut telah disiapkan untuk memastikan lomba berjalan lancar tanpa kendala teknis di panggung:

- **Struktur Tingkatan & Kelompok**: 3 Tingkat (Kelas 7, Kelas 8, Kelas 9), masing-masing 6 kelompok (Regu A s/d F dengan warna aksen unik dan nama kustom yang dapat diedit langsung).
- **Mode Tampilan Ganda**:
  1. *Mode Panggung (Stage Presentation)*: Tampilan bersih, kontras tinggi, kartu skor megah beranimasi untuk layar proyektor panggung.
  2. *Mode Operator / Juri (Control Deck)*: Tampilan kontrol cepat untuk operator dengan tombol penambah/pengurang skor instan, pemilih babak, timer, dan log aksi.
  3. *Mode Rekapitulasi Semua Tingkat (All-Levels Matrix)*: Tabel komparasi nilai tingkat 7, 8, dan 9 secara simultan untuk pengumuman hasil akhir / juara umum.
- **Sistem Suara & Audio**: Menggunakan Web Audio API terintegrasi tanpa ketergantungan file audio eksternal (suara buzzer bel cepat tangkas, chime benar, buzz salah, dan peringatan waktu habis).
- **Penyimpanan Data**: Tersimpan otomatis di `localStorage` per tingkat dan per kelompok agar data aman jika halaman tertutup atau tidak sengaja ter-refresh.

---

## 1. Overview & Core Concept

- **Apa yang Dibangun**: Aplikasi live scoreboard lomba cepat tangkas / cerdas cermat berbasis web yang responsif, dirancang khusus untuk operator lomba dan audiens panggung.
- **Pengguna Sasaran**: Guru, dewan juri, panitia lomba, siswa peserta (tingkat SMP/MTs kelas 7, 8, 9), dan penonton lomba.
- **Nilai Utama**: Mempercepat pencatatan nilai secara transparan, menghilangkan potensi kesalahan hitung manual, memberikan visual panggung yang profesional dengan animasi peringkat dan suara interaktif.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Pemilihan Tingkat & Babak**: Operator memilih tingkat yang sedang bertanding (Tingkat 7, 8, atau 9) dan babak yang aktif (Babak Wajib, Babak Lemparan, atau Babak Rebutan).
2. **Pemberian Nilai Instan**:
   - Operator menekan tombol penambahan cepat (+10, +20, +25, +50, +100) atau pengurangan (-10, -25, -50, -100).
   - Opsi input kustom untuk angka spesifik.
   - Opsi "Jawaban Benar" (+ poin babak) dan "Jawaban Salah" (pengurangan poin di babak rebutan) dengan efek suara instan.
3. **Pengoperasian Timer & Buzzer**:
   - Tombol cepat timer: 5 detik (rebutan), 10 detik, 15 detik (lemparan), 30 detik (soal wajib).
   - Suara bel/buzzer kuis yang nyaring saat kelompok memencet bel rebutan atau saat waktu habis.
4. **Mode Panggung Layar Penuh (Projector Mode)**:
   - Satu klik untuk menyembunyikan kontrol operator dan menampilkan kartu 6 kelompok secara imersif.
   - Highlight dinamis untuk pimpinan klasemen (Peringkat 1, 2, 3 dengan aksen emas, perak, perunggu).
   - Efek animasi angka skor saat bertambah/berkurang (*motion number counter*).
5. **Audit Trail & Ekspor**:
   - Riwayat pencatatan setiap perubahan skor (Undo kesalahan input dalam 1 klik).
   - Tombol Ekspor CSV dan Cetak Laporan Resmi Berita Acara Nilai.

### Visual Identity & Theme

- **Palet Warna**:
  - *Dominant Canvas (60%)*: Slate gelap bernuansa arena panggung (`bg-slate-950` / `bg-slate-900`) untuk kontras panggung maksimal, dengan opsi toggle mode terang (`bg-slate-50` / `bg-white`) untuk cetak dan administrasi.
  - *Structural Surfaces (30%)*: Panel bertekstur kartu tim (`bg-slate-800/80` dengan border hairline `border-slate-700/60`).
  - *Aksen Kelompok (10%)*: 6 warna pembeda tegas untuk tiap regu:
    - Regu A: Amber / Emas (`#f59e0b`)
    - Regu B: Biru Safir (`#3b82f6`)
    - Regu C: Hijau Zamrud (`#10b981`)
    - Regu D: Merah Ruby (`#ef4444`)
    - Regu E: Ungu Ametis (`#8b5cf6`)
    - Regu F: Sian Langit (`#06b6d4`)
- **Tipografi**:
  - Display face: `Plus Jakarta Sans` / `Outfit` untuk tajuk dan nama regu.
  - Skor & Timer: `font-mono tabular-nums` berukuran besar (`text-4xl` s/d `text-6xl`) untuk keterbacaan jarak jauh dari bangku penonton.

---

## 3. Key Product Decisions & Trade-Offs

- **Sintesis Audio Web Audio API**:
  - *Pilihan*: Menggunakan synthesizer AudioContext bawaan browser (gelombang osilator frekuensi ganda) untuk buzzer, chime, dan bel alarm.
  - *Alasan*: Tidak ada risiko aset MP3 gagal termuat di jaringan offline/lemah, nol latensi respon saat ditekan.
- **Pemisahan Mode Operator vs Mode Panggung**:
  - *Pilihan*: Tab toggle terintegrasi dengan opsi pembukaan jendela sekunder / mode fullscreen.
  - *Alasan*: Operator dapat mengontrol input di laptop tanpa mengganggu kenyamanan penonton di layar proyektor.
- **Undo / Riwayat Nilai Transparan**:
  - *Pilihan*: Menyimpan riwayat perubahan nilai (*log transaction*) setiap kali ada penambahan/pengurangan.
  - *Alasan*: Jika juri keliru mengklik regu atau nominal poin, dapat di-undo segera tanpa menghitung manual.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Root App (State & Sync)                  │
│  - Active Grade (7 / 8 / 9)                                │
│  - Active View (Stage Display / Operator Deck / All Grades) │
│  - Active Round (Wajib / Lemparan / Rebutan)                │
│  - Timer State (Time Remaining, Running, Sound Status)      │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
       ┌───────▼────────┐             ┌────────▼────────┐
       │  LocalStorage  │             │  Web Audio API  │
       │  Persistence   │             │  Synthesizer    │
       └────────────────┘             └─────────────────┘
               │                               │
┌──────────────┴───────────────────────────────┴──────────────┐
│                      Core Components                        │
├──────────────────────────────┬──────────────────────────────┤
│ 1. Header & Navigation       │ 2. Stage Scoreboard Grid     │
│    - Grade Switcher (7/8/9)  │    - 6 Regu Cards (A s/d F)  │
│    - View Mode Switcher      │    - Live Rank & Medal Badges│
│    - Quick Timer Widget      │    - Animated Score Counter  │
├──────────────────────────────┼──────────────────────────────┤
│ 3. Operator Control Deck     │ 4. History Log & Tools       │
│    - Quick Point Action Pad  │    - Transaction History Log │
│    - Round-based Scorer      │    - Undo Functionality      │
│    - Team Renaming Modal     │    - CSV Export & Print View │
└──────────────────────────────┴──────────────────────────────┘
```

### Data Model & State Definition

```typescript
interface Team {
  id: string;          // 'team-a', 'team-b', etc.
  defaultName: string; // 'Regu A', 'Regu B'
  name: string;        // Editable custom name
  color: string;       // Hex / Tailwind accent
  score: number;       // Current total score
  roundScores: {
    wajib: number;
    lemparan: number;
    rebutan: number;
  };
}

interface GradeData {
  grade: 7 | 8 | 9;
  title: string;       // "Tingkat Kelas 7"
  teams: Team[];
  history: ScoreHistoryEntry[];
}

interface ScoreHistoryEntry {
  id: string;
  timestamp: number;
  grade: 7 | 8 | 9;
  teamId: string;
  teamName: string;
  delta: number;
  round: 'wajib' | 'lemparan' | 'rebutan';
  note?: string;
}
```

---

## 5. Verification & Acceptance Criteria

1. **Struktur Data**: Tersedia 3 tingkat (7, 8, 9) dengan masing-masing 6 kelompok independen.
2. **Keterbacaan & Tampilan**: Papan skor terlihat jelas di layar besar dengan peringkat 1, 2, dan 3 yang otomatis terhitung.
3. **Keandalan Kontrol**: Tombol skor bekerja mulus dengan proteksi undo.
4. **Dukungan Audio**: Efek suara bel/buzzer dan timer berfungsi tanpa dependensi luar.
5. **Kompilasi Bersih**: Bebas error linting dan build (`compile_applet` & `lint_applet` lolos).
