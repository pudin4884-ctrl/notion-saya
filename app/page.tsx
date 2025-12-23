"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";

// Memanggil BlockNoteView secara dinamis agar tidak error "window is not defined"
const BlockNoteView = dynamic(
  () => import("@blocknote/mantine").then((mod) => mod.BlockNoteView),
  { ssr: false }
);

export default function App() {
  const [tema, setTema] = useState<"light" | "dark">("light");
  const [sudahSiap, setSudahSiap] = useState(false);

  const editor = useCreateBlockNote();

  // Memastikan kode hanya berjalan di browser (Client Side)
  useEffect(() => {
    setSudahSiap(true);
    
    const muatData = async () => {
      const dataLama = localStorage.getItem("isi-catatan");
      if (dataLama && editor) {
        try {
          const isi = JSON.parse(dataLama);
          editor.replaceBlocks(editor.document, isi);
        } catch (e) {
          console.error("Gagal memuat data:", e);
        }
      }
    };

    muatData();
  }, [editor]);

  const simpanCatatan = () => {
    if (editor) {
      const isi = JSON.stringify(editor.document);
      localStorage.setItem("isi-catatan", isi);
    }
  };

  const buatBaru = () => {
    if (typeof window !== "undefined" && confirm("Mulai catatan baru? Catatan lama akan dihapus.")) {
      localStorage.removeItem("isi-catatan");
      window.location.reload();
    }
  };

  // Jika belum di browser, jangan tampilkan apa-apa dulu
  if (!sudahSiap) return null;

  return (
    <div style={{ 
      display: "flex", 
      height: "100vh", 
      backgroundColor: tema === "light" ? "#ffffff" : "#1f1f1f",
      color: tema === "light" ? "#37352f" : "#ffffff",
      fontFamily: "sans-serif"
    }}>
      {/* Sidebar */}
      <div style={{ 
        width: "250px", 
        backgroundColor: tema === "light" ? "#f7f7f5" : "#2f2f2f", 
        borderRight: "1px solid " + (tema === "light" ? "#e5e5e5" : "#444"), 
        padding: "20px" 
      }}>
        <p style={{ fontWeight: "bold", marginBottom: "20px" }}>📁 Menu Utama</p>
        <button onClick={buatBaru} style={{ width: "100%", padding: "10px", marginBottom: "10px", cursor: "pointer", borderRadius: "5px", border: "1px solid #888", backgroundColor: "transparent", color: "inherit" }}>
          ➕ Catatan Baru
        </button>
        <button onClick={() => setTema(tema === "light" ? "dark" : "light")} style={{ width: "100%", padding: "10px", cursor: "pointer", borderRadius: "5px", border: "none", backgroundColor: "#37352f", color: "white" }}>
          {tema === "light" ? "🌙 Mode Gelap" : "☀️ Mode Terang"}
        </button>
      </div>

      {/* Area Mengetik */}
      <div style={{ flex: 1, padding: "50px", overflowY: "auto" }}>
        <h1 style={{ marginBottom: "20px", fontSize: "30px", fontWeight: "bold" }}>
          Notion Saya 📝
        </h1>
        <BlockNoteView 
          editor={editor} 
          onChange={simpanCatatan} 
          theme={tema} 
        />
      </div>
    </div>
  );
}