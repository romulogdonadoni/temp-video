"use client";

import { useRef, useState, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Download,
  Share2,
  Settings,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { formatBytes } from "@/lib/utils";

interface VideoPlayerProps {
  src: string;
  title: string;
  size?: number;
  viewsCount?: number;
  allowDownload?: boolean;
  onShareClick?: () => void;
}

export default function VideoPlayer({
  src,
  title,
  size,
  viewsCount = 0,
  allowDownload = true,
  onShareClick,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (values: number[]) => {
    const targetTime = values[0];
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const handleVolumeChange = (values: number[]) => {
    const val = values[0];
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextState = !isMuted;
    setIsMuted(nextState);
    videoRef.current.muted = nextState;
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const formatSec = (sec: number) => {
    if (isNaN(sec)) return "00:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full space-y-3">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        className="relative aspect-video w-full overflow-hidden rounded-lg bg-zinc-950 border border-zinc-800"
      >
        <video
          ref={videoRef}
          src={src}
          onClick={togglePlay}
          className="h-full w-full object-contain cursor-pointer"
          playsInline
        />

        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900/90 text-zinc-100 border border-zinc-700 hover:scale-105 transition-transform"
          >
            <Play className="h-6 w-6 translate-x-0.5 fill-current" />
          </button>
        )}

        {/* Video Bar */}
        <div
          className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent p-3 sm:p-4 transition-opacity duration-200 ${
            showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="mb-2">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
            />
          </div>

          <div className="flex items-center justify-between gap-3 text-zinc-200">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={togglePlay}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>

              <div className="flex items-center gap-1.5 w-24">
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={toggleMute}>
                  {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.05}
                  onValueChange={handleVolumeChange}
                />
              </div>

              <span className="text-[11px] font-mono text-zinc-400 ml-1">
                {formatSec(currentTime)} / {formatSec(duration)}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 px-2 font-mono text-[11px]">
                    <Settings className="h-3.5 w-3.5 mr-1" />
                    {playbackSpeed}x
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {[0.5, 1, 1.25, 1.5, 2].map((speed) => (
                    <DropdownMenuItem
                      key={speed}
                      onClick={() => changeSpeed(speed)}
                      className={playbackSpeed === speed ? "font-bold text-indigo-400" : ""}
                    >
                      {speed}x
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {onShareClick && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onShareClick}>
                  <Share2 className="h-4 w-4" />
                </Button>
              )}

              {allowDownload && (
                <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                  <a href={src} download={title} target="_blank" rel="noreferrer">
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              )}

              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Control Info Bar */}
      <div className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-950 p-3">
        <div>
          <h2 className="text-xs font-semibold text-zinc-100">{title}</h2>
          <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5 font-mono">
            {size && <span>{formatBytes(size)}</span>}
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3 text-zinc-400" />
              {viewsCount} views
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onShareClick && (
            <Button variant="outline" size="sm" onClick={onShareClick}>
              <Share2 className="h-3.5 w-3.5 mr-1.5" />
              Compartilhar
            </Button>
          )}
          {allowDownload && (
            <Button variant="secondary" size="sm" asChild>
              <a href={src} download={title} target="_blank" rel="noreferrer">
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Download
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
