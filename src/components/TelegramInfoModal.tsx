'use client';

import React from 'react';
import { X, Send, ShieldCheck, FileCheck, Calendar, Sparkles } from 'lucide-react';

interface TelegramInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  botUsername?: string;
}

export const TelegramInfoModal: React.FC<TelegramInfoModalProps> = ({
  isOpen,
  onClose,
  botUsername = 'tvuj_bot',
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Přidávání fotek přes Telegram</h3>
            <p className="text-xs text-slate-400">Automatické zařazení podle data focení</p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3.5 mb-6 text-sm">
          <div className="flex items-start gap-3 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/60">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-100">1. Pošli fotku jako „Soubor / Dokument“</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Při běžném odeslání Telegram fotku zkomprimuje a odstraní EXIF datum. Odesláním jako soubor zůstane původní kvalita i přesné datum pořízení z fotoaparátu.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/60">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-100">2. Automatické zařazení do časové osy</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Bot přečte datum pořízení a zařadí fotku do správného měsíce a roku v galerii, i když fotku pošleš třeba o půl roku později.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/60">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-100">3. Zabezpečení (Whitelist)</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Nahrávat mohou jen povolení uživatelé. Když botovi napíšeš <code className="bg-slate-800 px-1 py-0.5 rounded text-emerald-300">/start</code>, vypíše ti tvoje Telegram ID.
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <a
            href="https://t.me/adamekLLLLbot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm transition shadow-lg shadow-emerald-600/20"
          >
            <Send className="w-4 h-4" />
            Otevřít @adamekLLLLbot na Telegramu
          </a>
          <button
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition"
          >
            Zavřít
          </button>
        </div>
      </div>
    </div>
  );
};
