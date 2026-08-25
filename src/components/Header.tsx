"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, Zap } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm shadow-sm transition-transform group-hover:scale-105">
            VV
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-zinc-100 leading-tight">
              VideoVault
            </span>
            <span className="text-[11px] text-zinc-400">
              Vídeos Temporários & Privados
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1 font-medium text-[11px]">
            <Shield className="h-3 w-3 text-emerald-400" />
            100% Privado
          </Badge>
          <Badge variant="secondary" className="gap-1 font-medium text-[11px] hidden sm:inline-flex">
            <Clock className="h-3 w-3 text-indigo-400" />
            Expiração Automática
          </Badge>
          <Badge variant="secondary" className="gap-1 font-medium text-[11px] hidden md:inline-flex">
            <Zap className="h-3 w-3 text-amber-400" />
            Sem Cadastro
          </Badge>
        </div>
      </div>
    </header>
  );
}
