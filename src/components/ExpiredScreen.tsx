"use client";

import Link from "next/link";
import { Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function ExpiredScreen({ message }: { message?: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center border-zinc-800 bg-zinc-950">
        <CardHeader className="pb-2">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
            <Clock className="h-5 w-5" />
          </div>
          <CardTitle className="text-base font-semibold text-zinc-100">Vídeo Expirado ou Removido</CardTitle>
          <CardDescription className="text-xs text-zinc-400 mt-1">
            {message || "O período de retenção programado para este arquivo terminou. O conteúdo foi excluído do Cloudflare R2."}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center gap-2 pt-4">
          <Button variant="primary" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              Página Inicial
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
