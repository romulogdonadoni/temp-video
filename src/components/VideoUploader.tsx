"use client";

import { useState, useRef } from "react";
import { Upload, FileVideo, Clock, Lock, Flame, Download, AlertCircle, Check, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatBytes } from "@/lib/utils";

export default function VideoUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [expirationHours, setExpirationHours] = useState("24");
  const [password, setPassword] = useState("");
  const [enablePassword, setEnablePassword] = useState(false);
  const [burnAfterReading, setBurnAfterReading] = useState(false);
  const [allowDownload, setAllowDownload] = useState(true);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [successVideoId, setSuccessVideoId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      if (selected.type.startsWith("video/")) {
        setFile(selected);
        setErrorMsg("");
      } else {
        setErrorMsg("Por favor, selecione um arquivo de vídeo (MP4, MOV, WebM).");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type.startsWith("video/")) {
        setFile(selected);
        setErrorMsg("");
      } else {
        setErrorMsg("Por favor, selecione um arquivo de vídeo (MP4, MOV, WebM).");
      }
    }
  };

  const handleStartUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10);
    setErrorMsg("");

    try {
      const res = await fetch("/api/upload/presigned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: file.name,
          size: file.size,
          mimeType: file.type || "video/mp4",
          expirationHours: Number(expirationHours),
          password: enablePassword && password.trim() ? password.trim() : undefined,
          burnAfterReading,
          allowDownload,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.uploadUrl) {
        throw new Error(data.error || "Não foi possível preparar o upload.");
      }

      setUploadProgress(30);

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", data.uploadUrl, true);
        if (file.type) {
          xhr.setRequestHeader("Content-Type", file.type);
        }

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round(30 + (event.loaded / event.total) * 65);
            setUploadProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadProgress(100);
            resolve();
          } else {
            reject(new Error(`Erro ao enviar arquivo`));
          }
        };

        xhr.onerror = () => reject(new Error("Conexão interrompida durante o envio"));
        xhr.send(file);
      });

      setSuccessVideoId(data.videoId);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Ocorreu um erro ao enviar o seu vídeo.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto border-zinc-800 bg-zinc-950 shadow-xl">
      <CardHeader className="pb-4 border-b border-zinc-900">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              Enviar Vídeo Temporário
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400 mt-1">
              Envie sem criar conta. Escolha quando o vídeo deve ser apagado.
            </CardDescription>
          </div>
          <Badge variant="emerald" className="gap-1 text-[10px]">
            <ShieldCheck className="h-3 w-3" />
            Link Privado
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-5">
        {!file && !successVideoId ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex min-h-[210px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all ${
              dragActive
                ? "border-indigo-500 bg-indigo-950/30 scale-[1.01]"
                : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/80"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800/50 mb-3">
              <Upload className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-zinc-100">Arraste seu vídeo aqui</p>
            <p className="text-xs text-zinc-400 mt-1">ou clique para escolher do seu celular ou computador</p>
            <span className="mt-3 text-[11px] text-zinc-500 font-mono">Suporta MP4, WebM, MOV ou MKV</span>
          </div>
        ) : file && !successVideoId ? (
          <div className="space-y-5">
            {/* Informações do Arquivo */}
            <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/60 p-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-950 text-indigo-400 border border-indigo-800/50">
                  <FileVideo className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-100 truncate max-w-[220px] sm:max-w-xs">{file.name}</p>
                  <p className="text-[11px] text-zinc-400 font-mono">{formatBytes(file.size)}</p>
                </div>
              </div>
              {!isUploading && (
                <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
                  Trocar
                </Button>
              )}
            </div>

            {/* Tempo de Expiração */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-indigo-400" />
                Por quanto tempo o vídeo ficará disponível?
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: "1", label: "1 Hora" },
                  { value: "6", label: "6 Horas" },
                  { value: "24", label: "24 Horas" },
                  { value: "168", label: "7 Dias" },
                ].map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    variant={expirationHours === opt.value ? "primary" : "outline"}
                    size="sm"
                    disabled={isUploading}
                    onClick={() => setExpirationHours(opt.value)}
                    className="text-xs"
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Opções de Privacidade */}
            <div className="space-y-3 pt-3 border-t border-zinc-900">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-amber-400" />
                    Proteger com Senha
                  </span>
                  <span className="text-[11px] text-zinc-400 block">Exige uma senha secreta para assistir</span>
                </div>
                <Switch
                  checked={enablePassword}
                  onCheckedChange={setEnablePassword}
                  disabled={isUploading}
                />
              </div>

              {enablePassword && (
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Crie uma senha de acesso..."
                  className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                />
              )}

              <div className="flex items-center justify-between pt-1">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5 text-pink-400" />
                    Modo Autodestruição (Burn After Reading)
                  </span>
                  <span className="text-[11px] text-zinc-400 block">Apaga o vídeo assim que o 1º espectador assistir</span>
                </div>
                <Switch
                  checked={burnAfterReading}
                  onCheckedChange={setBurnAfterReading}
                  disabled={isUploading}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                    <Download className="h-3.5 w-3.5 text-indigo-400" />
                    Permitir Download
                  </span>
                  <span className="text-[11px] text-zinc-400 block">Permite que quem receber consiga baixar o vídeo</span>
                </div>
                <Switch
                  checked={allowDownload}
                  onCheckedChange={setAllowDownload}
                  disabled={isUploading}
                />
              </div>
            </div>

            {/* Barra de Progresso */}
            {isUploading && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-semibold text-zinc-300">
                  <span>Enviando vídeo com segurança...</span>
                  <span className="font-mono text-indigo-400">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {errorMsg && (
              <div className="flex items-center gap-2 rounded-md border border-red-900/50 bg-red-950/40 p-3 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        ) : (
          /* Sucesso Pós Upload */
          <div className="text-center py-6 space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
              <Check className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-zinc-100">Seu Vídeo Está Pronto!</h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                O link temporário foi gerado. Compartilhe com quem quiser antes que expire.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Button variant="primary" size="lg" asChild>
                <a href={`/watch/${successVideoId}`}>
                  Ver Vídeo & Copiar Link <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {file && !successVideoId && (
        <CardFooter className="border-t border-zinc-900 pt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setFile(null)} disabled={isUploading}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleStartUpload} disabled={isUploading}>
            {isUploading ? "Enviando Vídeo..." : "Gerar Link de Compartilhamento"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
