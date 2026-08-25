import VideoUploader from "@/components/VideoUploader";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Clock, Lock, Flame, ShieldCheck, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-4xl py-10 px-4 sm:px-6 space-y-12">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center gap-2 mb-2">
          <Badge variant="secondary" className="gap-1 text-[11px]">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            100% Seguro & Privado
          </Badge>
          <Badge variant="secondary" className="gap-1 text-[11px]">
            <Zap className="h-3 w-3 text-amber-400" />
            Sem Criar Conta
          </Badge>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-5xl leading-tight">
          Compartilhe vídeos privados que{" "}
          <span className="text-indigo-400 underline decoration-indigo-500/30 underline-offset-4">
            se autodestroem
          </span>
        </h1>

        <p className="mx-auto max-w-xl text-sm text-zinc-400 leading-relaxed">
          Envie vídeos com data de expiração programada. Quando o tempo acaba, o vídeo é permanentemente deletado. Rápido, privado e sem complicações.
        </p>
      </div>

      {/* Componente de Upload */}
      <VideoUploader />

      {/* Benefícios para o Usuário Comum */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        <Card className="border-zinc-800 bg-zinc-950/60">
          <CardHeader className="p-4 space-y-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-950 text-indigo-400 border border-indigo-800/50 mb-1">
              <Clock className="h-4 w-4" />
            </div>
            <CardTitle className="text-xs font-bold text-zinc-100">Expiração Programada</CardTitle>
            <CardDescription className="text-[11px] text-zinc-400 leading-normal">
              Escolha 1 hora, 24 horas ou 7 dias. Passado o prazo, o vídeo desaparece sem deixar rastros.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/60">
          <CardHeader className="p-4 space-y-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-950 text-amber-400 border border-amber-800/50 mb-1">
              <Lock className="h-4 w-4" />
            </div>
            <CardTitle className="text-xs font-bold text-zinc-100">Proteção com Senha</CardTitle>
            <CardDescription className="text-[11px] text-zinc-400 leading-normal">
              Crie uma senha secreta para ter certeza de que apenas a pessoa certa vai conseguir assistir.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/60">
          <CardHeader className="p-4 space-y-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-pink-950 text-pink-400 border border-pink-800/50 mb-1">
              <Flame className="h-4 w-4" />
            </div>
            <CardTitle className="text-xs font-bold text-zinc-100">Autodestruição</CardTitle>
            <CardDescription className="text-[11px] text-zinc-400 leading-normal">
              Ative o modo *Burn After Reading* para que o vídeo seja excluído assim que for visto a 1ª vez.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/60">
          <CardHeader className="p-4 space-y-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800/50 mb-1">
              <Zap className="h-4 w-4" />
            </div>
            <CardTitle className="text-xs font-bold text-zinc-100">Sem Cadastro</CardTitle>
            <CardDescription className="text-[11px] text-zinc-400 leading-normal">
              Envie e assista direto no navegador do celular ou PC sem precisar instalar nada nem se cadastrar.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
