"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";

// Load BlockNoteView secara dinamis dan matikan SSR (Server Side Rendering)
const BlockNoteView = dynamic(
  () => import("@blocknote/mantine").then((mod) => mod.BlockNoteView),
  { ssr: false }
);

export default function App() {
  const [tema, setTema] = useState<"light" | "dark">("light");
  const [isClient, setIsClient] = useState(false);
  
  const editor: any = useCreateBlockNote();

  // Pastikan kode hanya berjalan setelah komponen menempel di browser
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && editor && typeof window !== "undefined") {
      const dataLama = localStorage.getItem("isi-catatan");
      if (dataLama) {
        try {
          const isi = JSON.parse(dataLama);
          editor.replaceBlocks(editor.document, isi);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [isClient, editor]);

  const simpanCatatan = () => {
    if (editor && typeof window !== "undefined") {
      localStorage.setItem("isi-catatan", JSON.stringify(editor.document));
    }
  };

  // JANGAN merender apapun jika bukan di client (ini kunci agar tidak error lagi)
  if (!isClient) return null;

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: tema === "light" ? "#fff" : "#1f1f1f", color: tema === "light" ? "#000" : "#fff" }}>
      <div style={{ width: "200px", padding: "20px", borderRight: "1px solid #ccc" }}>
        <button onClick={() => setTema(tema === "light" ? "dark" : "light")} style={{ padding: "10px", cursor: "pointer" }}>
          {tema === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>
      <div style={{ flex: 1, padding: "40px" }}>
        <h1>Notion Saya 📝</h1>
        <BlockNoteView editor={editor} onChange={simpanCatatan} theme={tema} />
      </div>
    </div>
  );
}