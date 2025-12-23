"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";

// 1. Memanggil BlockNoteView secara dinamis (Sangat Penting agar Vercel tidak Error)
const BlockNoteView = dynamic(
  () => import("@blocknote/mantine").then((mod) => mod.BlockNoteView),
  { ssr: false }
);

export default function App() {
  const [tema, setTema] = useState<"light" | "dark">("light");
  const [sudahSiap, setSudahSiap] = useState(false);

  // 2. Inisialisasi editor dengan tipe 'any' agar TypeScript tidak protes saat build
  const editor: any = useCreateBlockNote();

  // 3. Gunakan useEffect untuk menandakan browser sudah siap
  useEffect(() => {
    setSudahSiap(true);
  }, []);

  // 4. Efek untuk memuat data dari localStorage setelah editor & browser siap
  useEffect(() => {
    if (sudahSiap && editor) {
      const dataLama = localStorage.getItem("isi-catatan");
      if (dataLama) {
        try {
          const isi = JSON.parse(dataLama);
          editor.replaceBlocks(editor.document, isi);
        } catch (e) {
          console.error("Gagal memuat data:", e);
        }
      }
    }
  }, [sudahSiap, editor]);

  // 5. Fungsi Simpan
  const simpanCatatan = () => {
    if (editor) {
      const isi = JSON.stringify(editor.document);
      localStorage.setItem("isi-catatan", isi);
    }
  };

  // 6. Fungsi Buat Baru
  const buatBaru = () => {
    if (confirm("Mulai catatan baru? Catatan lama akan dihapus.")) {
      localStorage.removeItem("isi-catatan");
      window.location.reload();
    }
  };

  // Tampilan kosong sementara agar tidak terjadi Error "window is not defined"
  if (!sudahSiap) return null;

  return (
    <div style={{ 
      display: "flex", 
      height: "100vh", 
      backgroundColor: tema === "light" ? "#ffffff" : "#1f1f1f",
      color: tema === "light" ? "#37352f" : "#ffffff",
      transition: "background 0.3s ease"
    }}>
      {/* Sidebar */}
      <div style={{ 
        width: "250px", 
        backgroundColor: tema === "light" ? "#f7f7f5" : "#2f2f2f", 
        borderRight: "1px solid " + (tema === "light" ? "#e5e5e5" : "#444"), 
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}>
        <p style={{ fontWeight: "bold", marginBottom: "10px" }}>📁 Menu Utama</p>
        <button onClick={buatBaru} style={{ padding: "10px", cursor: "pointer", borderRadius: "6px", border: "1px solid #888", background: "white", color: "black" }}>
          ➕ Catatan Baru
        </button>
        <button onClick={() => setTema(tema === "light" ? "dark" : "light")} style={{ padding: "10px", cursor: "pointer", borderRadius: "6px", border: "none", backgroundColor: "#37352f", color: "white" }}>
          {tema === "light" ? "🌙 Mode Gelap" : "☀️ Mode Terang"}
        </button>
      </div>

      {/* Area Mengetik */}
      <div style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "30px" }}>
          Notion Saya 📝
        </h1>
        {/* Hanya tampilkan Editor jika editor sudah siap */}
        {editor && (
          <BlockNoteView 
            editor={editor} 
            onChange={simpanCatatan} 
            theme={tema} 
          />
        )}
      </div>
    </div>
  );
}