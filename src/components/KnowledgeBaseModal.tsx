import React, { useState } from 'react';
import { X, HelpCircle, ShieldCheck, Lock, Smartphone, Globe, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { User } from '../types';

interface KnowledgeBaseModalProps {
  currentUser: User;
  onClose: () => void;
}

interface FAQItem {
  id: string;
  category: 'Privacy' | 'PWA' | 'Calls' | 'Security';
  question: string;
  answer: string;
}

const FAQ_LIST: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'Privacy',
    question: 'What is AnoNote and how does it protect my anonymity?',
    answer: 'AnoNote is a zero-knowledge anonymous messaging and calling progressive web application. You do not need to provide a phone number, email address, or real name. Your identity is represented by a unique, locally generated cryptographic Anon ID.'
  },
  {
    id: 'faq-2',
    category: 'Privacy',
    question: 'Does AnoNote store my conversations or contact lists?',
    answer: 'No. AnoNote maintains a strict zero-log policy. Conversations are encrypted and stored in your device’s local browser database (IndexedDB/LocalStorage). We never sell, track, or analyze your communications.'
  },
  {
    id: 'faq-3',
    category: 'PWA',
    question: 'How do I install AnoNote as a Progressive Web App (PWA)?',
    answer: 'On Desktop (Chrome, Edge, Brave) and Android, click the "Install App" button in the top bar. On iPhone and iPad (Safari), tap the Share icon and choose "Add to Home Screen". AnoNote then launches in full-screen standalone mode with offline caching.'
  },
  {
    id: 'faq-4',
    category: 'Security',
    question: 'How does end-to-end encryption work on AnoNote?',
    answer: 'Every user generates an asymmetric cryptographic keypair directly on their device. When you send a message, it is encrypted so that only the designated recipient with the matching private key can decrypt it.'
  },
  {
    id: 'faq-5',
    category: 'Calls',
    question: 'Can I make anonymous voice and video calls without revealing my IP?',
    answer: 'Yes. AnoNote integrates peer-to-peer WebRTC channels paired with encrypted socket signaling. You can initiate instant audio or video calls with any contact by clicking the call icon in their chat header.'
  },
  {
    id: 'faq-6',
    category: 'Security',
    question: 'What are disappearing messages and how do they function?',
    answer: 'Disappearing messages allow you to set an expiration timer (such as 24 hours, 7 days, or 90 days). Once the time elapsed from transmission exceeds the threshold, messages are permanently purged from local storage.'
  }
];

export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({ currentUser, onClose }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'Privacy' | 'PWA' | 'Calls' | 'Security'>('all');
  const [expandedId, setExpandedId] = useState<string | null>('faq-1');
  const [copiedLink, setCopiedLink] = useState(false);

  const filteredFAQs = activeTab === 'all' 
    ? FAQ_LIST 
    : FAQ_LIST.filter(item => item.category === activeTab);

  const inviteLink = `${window.location.origin}/?add=${currentUser.anonId}`;

  const copyInvite = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b141a]/85 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#111b21] border border-[#222d34] rounded-2xl shadow-2xl overflow-hidden text-[#e9edef] flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-[#202c33] flex items-center justify-between border-b border-[#222d34]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00a8fc]/20 border border-[#00a8fc]/30 flex items-center justify-center text-[#00a8fc]">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">AnoNote Knowledge Base &amp; FAQ</h2>
              <p className="text-[11px] text-[#8696a0]">Answer Engine &amp; Security Documentation</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-[#374248] rounded-full text-[#8696a0] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Quick Share Anon ID */}
          <div className="bg-[#202c33]/70 border border-[#222d34] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#00a8fc] font-bold">Your Anonymous Invite Link</span>
              <p className="text-xs text-[#8696a0] mt-0.5">Share this link to let others initiate an encrypted chat with you.</p>
              <p className="text-xs font-mono text-white mt-1 select-all break-all">{inviteLink}</p>
            </div>
            <button
              onClick={copyInvite}
              className="px-4 py-2 bg-[#00a8fc] hover:bg-[#0284c7] text-[#0b141a] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shrink-0 transition-colors"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedLink ? 'Copied!' : 'Copy Link'}
            </button>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'Privacy', 'PWA', 'Calls', 'Security'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === cat 
                    ? 'bg-[#00a8fc] text-[#0b141a]' 
                    : 'bg-[#202c33] text-[#8696a0] hover:text-white hover:bg-[#2a3942]'
                }`}
              >
                {cat === 'all' ? 'All Questions' : cat}
              </button>
            ))}
          </div>

          {/* Accordion List */}
          <div className="space-y-3">
            {filteredFAQs.map((faq) => {
              const isOpen = expandedId === faq.id;
              return (
                <article 
                  key={faq.id} 
                  className="bg-[#202c33]/40 border border-[#222d34] rounded-xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setExpandedId(isOpen ? null : faq.id)}
                    className="w-full text-left p-4 flex items-center justify-between gap-3 hover:bg-[#202c33]/70 transition-colors"
                  >
                    <span className="text-sm font-medium text-white flex-1">{faq.question}</span>
                    <span className="text-[#00a8fc] shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-[#8696a0] leading-relaxed border-t border-[#222d34]/60 bg-[#182229]/50">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {/* Cryptographic Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-[#202c33]/50 p-3 rounded-xl border border-[#222d34] flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#00a8fc] shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">Zero Telemetry</p>
                <p className="text-[10px] text-[#8696a0]">No trackers or ad cookies</p>
              </div>
            </div>
            <div className="bg-[#202c33]/50 p-3 rounded-xl border border-[#222d34] flex items-center gap-2.5">
              <Lock className="w-5 h-5 text-[#00a8fc] shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">E2E Cryptography</p>
                <p className="text-[10px] text-[#8696a0]">Client-side keys only</p>
              </div>
            </div>
            <div className="bg-[#202c33]/50 p-3 rounded-xl border border-[#222d34] flex items-center gap-2.5">
              <Smartphone className="w-5 h-5 text-[#00a8fc] shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">PWA Certified</p>
                <p className="text-[10px] text-[#8696a0]">Installable on all devices</p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#202c33] border-t border-[#222d34] flex items-center justify-between text-xs text-[#8696a0]">
          <span className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[#00a8fc]" />
            AnoNote Web App v1.2.0 • Decentralized Privacy
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2a3942] hover:bg-[#374248] text-white font-medium rounded-xl transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
