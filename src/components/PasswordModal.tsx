"use client";

import { useState } from "react";
import { Lock, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PasswordModalProps {
  videoId: string;
  videoTitle: string;
  onSuccess: (passwordToken: string) => void;
}

export default function PasswordModal({ videoId, videoTitle, onSuccess }: PasswordModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/video/${videoId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onSuccess(password);
      } else {
        setError(data.error || "Senha incorreta.");
      }
    } catch {
      setError("Erro ao comunicar com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <Lock className="h-4 w-4 text-amber-400" />
            Vídeo Protegido
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400 truncate">
            {videoTitle}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Digite a Senha de Acesso
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
              autoFocus
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded border border-red-900/50 bg-red-950/30 p-2.5 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={isLoading || !password.trim()}>
            {isLoading ? "Verificando..." : "Desbloquear Vídeo"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
