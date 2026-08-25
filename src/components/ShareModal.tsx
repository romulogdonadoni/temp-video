"use client";

import { useState } from "react";
import { Copy, Check, Share2, Code, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  videoTitle: string;
}

export default function ShareModal({ isOpen, onClose, videoId, videoTitle }: ShareModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  const baseUrl = (envUrl && envUrl.trim())
    ? envUrl
    : (typeof window !== "undefined" ? window.location.origin : "");
    
  const shareUrl = `${baseUrl.replace(/\/$/, "")}/watch/${videoId}`;
  const embedCode = `<iframe src="${shareUrl}" width="100%" height="450" frameborder="0" allowfullscreen></iframe>`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const shareWhatsApp = `https://api.whatsapp.com/send?text=${encodeURIComponent(`Assista ao vídeo temporário: "${videoTitle}" em ${shareUrl}`)}`;
  const shareTelegram = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Vídeo: ${videoTitle}`)}`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <Share2 className="h-4 w-4 text-indigo-400" />
            Compartilhar Vídeo
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400">
            Link direto temporário e código de incorporação HTML.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">Link Direto</TabsTrigger>
            <TabsTrigger value="embed">Embed HTML</TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4 pt-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-zinc-200 focus:outline-none select-all"
              />
              <Button variant="primary" size="sm" onClick={handleCopyLink} className="shrink-0">
                {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span className="ml-1.5">{copiedLink ? "Copiado" : "Copiar"}</span>
              </Button>
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href={shareWhatsApp} target="_blank" rel="noreferrer">
                  <Send className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
                  WhatsApp
                </a>
              </Button>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href={shareTelegram} target="_blank" rel="noreferrer">
                  <Send className="h-3.5 w-3.5 mr-1.5 text-sky-400" />
                  Telegram
                </a>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="embed" className="space-y-3 pt-3">
            <textarea
              readOnly
              rows={3}
              value={embedCode}
              className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2.5 font-mono text-xs text-zinc-300 focus:outline-none select-all"
            />
            <Button variant="primary" size="sm" onClick={handleCopyEmbed} className="w-full">
              {copiedEmbed ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Code className="h-3.5 w-3.5" />}
              <span className="ml-1.5">{copiedEmbed ? "Iframe Copiado!" : "Copiar Código Embed"}</span>
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
