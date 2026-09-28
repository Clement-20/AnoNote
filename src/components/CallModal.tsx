import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, ShieldCheck, Volume2 } from 'lucide-react';
import { User } from '../types';

interface CallModalProps {
  partner: User;
  type: 'voice' | 'video';
  isIncoming?: boolean;
  onAccept?: () => void;
  onReject: () => void;
  onEndCall: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  partner,
  type,
  isIncoming = false,
  onAccept,
  onReject,
  onEndCall
}) => {
  const [callState, setCallState] = useState<'ringing' | 'connected'>(isIncoming ? 'ringing' : 'connected');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    let timer: any;
    if (callState === 'connected') {
      timer = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remain = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remain.toString().padStart(2, '0')}`;
  };

  const handleAcceptCall = () => {
    setCallState('connected');
    if (onAccept) onAccept();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b141a]/95 backdrop-blur-md p-4">
      <div className="w-full max-w-lg bg-[#111b21] border border-[#222d34] rounded-3xl shadow-2xl overflow-hidden text-[#e9edef] flex flex-col items-center p-8 relative">
        
        {/* Top encryption indicator */}
        <div className="absolute top-6 left-6 flex items-center gap-1.5 text-xs text-[#00a884] bg-[#00a884]/10 px-3 py-1 rounded-full border border-[#00a884]/30">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>End-to-End Encrypted {type === 'video' ? 'Video' : 'Voice'} Call</span>
        </div>

        {/* Partner Info / Video Area */}
        <div className="flex flex-col items-center my-10">
          {type === 'video' && callState === 'connected' && !isVideoOff ? (
            <div className="w-72 h-80 rounded-2xl bg-[#2a3942] overflow-hidden mb-6 relative border border-[#222d34]">
              <img src={partner.avatar} alt="Video Feed" className="w-full h-full object-cover opacity-90" />
              <div className="absolute bottom-3 left-3 bg-black/60 px-2.5 py-1 rounded-lg text-xs font-semibold">
                {partner.name}
              </div>
            </div>
          ) : (
            <div className="relative mb-6">
              <img 
                src={partner.avatar} 
                alt={partner.name} 
                className="w-32 h-32 rounded-full object-cover border-4 border-[#00a884] shadow-2xl"
              />
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-[#00a884] border-4 border-[#111b21] rounded-full animate-pulse" />
            </div>
          )}

          <h2 className="text-2xl font-bold tracking-tight mb-1">{partner.name}</h2>
          <p className="text-xs font-mono text-[#00a884] mb-3">{partner.anonId}</p>
          <p className="text-sm text-[#8696a0]">
            {callState === 'ringing' 
              ? (isIncoming ? 'Incoming Secure Call...' : 'Connecting securely...') 
              : formatDuration(duration)}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6 mt-4">
          {callState === 'ringing' && isIncoming ? (
            <>
              <button
                onClick={onReject}
                className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xl transition-transform hover:scale-105"
                title="Decline"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
              <button
                onClick={handleAcceptCall}
                className="w-14 h-14 rounded-full bg-[#00a884] hover:bg-[#008f72] text-[#111b21] flex items-center justify-center shadow-xl transition-transform hover:scale-105"
                title="Accept"
              >
                <Volume2 className="w-6 h-6" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-[#2a3942] hover:bg-[#374248] text-white'}`}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {type === 'video' && (
                <button
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isVideoOff ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-[#2a3942] hover:bg-[#374248] text-white'}`}
                >
                  {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
              )}

              <button
                onClick={onEndCall}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-105"
                title="End Call"
              >
                <PhoneOff className="w-7 h-7" />
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
