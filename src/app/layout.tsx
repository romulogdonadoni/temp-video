import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "VideoVault | Compartilhamento e Player de Vídeos Temporários",
  description: "Faça upload e compartilhe vídeos temporários com expiração automática via Cloudflare R2 e AWS DynamoDB.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 bg-mesh antialiased flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-zinc-900 bg-zinc-950/80 py-6 text-center text-xs text-zinc-500">
          <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span>© 2026 VideoVault • Powered by Cloudflare R2 & AWS DynamoDB</span>
            <div className="flex items-center gap-4 text-zinc-400">
              <span className="hover:text-white transition-colors">Segurança End-to-End</span>
              <span>•</span>
              <span className="hover:text-white transition-colors">Zero Taxas de Saída (Egress)</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
