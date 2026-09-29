import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Volume2,
  VolumeX,
  RefreshCw,
  Share2,
  Copy,
  Check,
  Lock,
  Sparkles,
  Shield,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { logCall } from "../services/callService";

export function LiveCallView() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const isVideoParam = searchParams.get("video") === "true";
  const [isVideo, setIsVideo] = useState(isVideoParam);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<"connecting" | "ringing" | "connected">("connecting");
  const [copiedLink, setCopiedLink] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const durationTimerRef = useRef<any>(null);

  // Derive peer name from call ID
  const rawId = (id || "peer").replace("call_", "");
  const peerName = rawId.startsWith("Anon") ? rawId : `Anon #${rawId.replace(/[^0-9]/g, "") || "4819"}`;

  useEffect(() => {
    // Initial connection simulation & device initialization
    let isMounted = true;

    async function setupMedia() {
      try {
        if (navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: isVideo ? { facingMode: "user" } : false,
          });

          if (isMounted) {
            streamRef.current = stream;
            if (localVideoRef.current && isVideo) {
              localVideoRef.current.srcObject = stream;
            }
          }
        }
      } catch (e) {
        console.warn("Media device access note:", e);
      }
    }

    setupMedia();

    const ringTimer = setTimeout(() => {
      setCallStatus("ringing");
    }, 1000);

    const connectTimer = setTimeout(() => {
      setCallStatus("connected");
      durationTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }, 3000);

    return () => {
      isMounted = false;
      clearTimeout(ringTimer);
      clearTimeout(connectTimer);
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isVideo]);

  const handleEndCall = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);

    await logCall(
      currentUser,
      peerName,
      peerName,
      "👤",
      isVideo ? "video" : "audio",
      "completed",
      callDuration
    );

    navigate(-1);
  };

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
  };

  const toggleVideo = async () => {
    if (isVideo) {
      if (streamRef.current) {
        streamRef.current.getVideoTracks().forEach((t) => t.stop());
      }
      setIsVideo(false);
    } else {
      setIsVideo(true);
      try {
        if (navigator.mediaDevices?.getUserMedia) {
          const vStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          streamRef.current = vStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = vStream;
          }
        }
      } catch (e) {
        console.warn("Could not start video:", e);
      }
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b141a] text-[#e9edef] select-none relative overflow-hidden font-sans">
      {/* Background visual or Video */}
      {isVideo ? (
        <div className="absolute inset-0 z-0 bg-[#0b141a] flex items-center justify-center">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-[#111b21] via-[#0b141a] to-[#0b141a] z-0" />
      )}

      {/* Top Call Details Header */}
      <header className="relative z-10 px-4 pt-8 pb-4 flex flex-col items-center text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#111b21]/80 backdrop-blur-md rounded-full text-xs text-[#38bdf8] border border-[#202c33]">
          <Lock className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span>End-to-End Encrypted Call</span>
        </div>

        <h1 className="text-2xl font-semibold text-[#e9edef] tracking-tight">{peerName}</h1>

        <p className="text-sm font-medium text-[#8696a0]">
          {callStatus === "connecting"
            ? "Connecting..."
            : callStatus === "ringing"
            ? "Ringing..."
            : formatTime(callDuration)}
        </p>

        {/* Share call link chip */}
        <button
          onClick={handleCopyLink}
          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-[#202c33]/80 hover:bg-[#202c33] rounded-full text-xs text-[#e9edef] transition-colors border border-[#2a3942]"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-[#38bdf8]" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copiedLink ? "Call Link Copied" : "Share Call Link"}</span>
        </button>
      </header>

      {/* Center Avatar & Pulsing Wave Indicator */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-4">
        <div className="relative">
          {callStatus === "connected" && (
            <div className="absolute inset-0 rounded-full bg-[#0084ff]/20 animate-ping" />
          )}
          <div className="w-32 h-32 rounded-full bg-[#202c33] border-4 border-[#111b21] flex items-center justify-center text-6xl shadow-2xl relative z-10 overflow-hidden">
            👤
          </div>
        </div>

        {callStatus === "connected" && (
          <div className="flex items-center gap-1.5 mt-8">
            <span className="w-1 h-3 bg-[#0084ff] rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1 h-6 bg-[#0084ff] rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1 h-8 bg-[#0084ff] rounded-full animate-bounce" />
            <span className="w-1 h-5 bg-[#0084ff] rounded-full animate-bounce [animation-delay:-0.2s]" />
            <span className="w-1 h-2 bg-[#0084ff] rounded-full animate-bounce [animation-delay:-0.4s]" />
          </div>
        )}
      </div>

      {/* Bottom Floating Control Bar */}
      <footer className="relative z-10 pb-12 pt-4 px-6 flex items-center justify-center">
        <div className="bg-[#111b21]/90 backdrop-blur-xl border border-[#202c33] rounded-3xl px-6 py-4 flex items-center gap-6 shadow-2xl">
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isMuted ? "bg-white text-[#0b141a]" : "bg-[#202c33] text-[#e9edef] hover:bg-[#2a3942]"
            }`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Video Toggle */}
          <button
            onClick={toggleVideo}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isVideo ? "bg-[#0084ff] text-white" : "bg-[#202c33] text-[#e9edef] hover:bg-[#2a3942]"
            }`}
            title={isVideo ? "Turn off camera" : "Turn on camera"}
          >
            {isVideo ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Speaker Toggle */}
          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isSpeakerOn ? "bg-[#202c33] text-[#38bdf8]" : "bg-[#202c33] text-[#8696a0]"
            }`}
            title="Speaker"
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Red End Call Button */}
          <button
            onClick={handleEndCall}
            className="w-14 h-14 bg-[#f15c6d] hover:bg-[#d94859] text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90"
            title="End call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </footer>
    </div>
  );
}
