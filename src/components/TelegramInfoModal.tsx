'use client';

import React from 'react';
import { X, Send, ShieldCheck, FileCheck, Calendar } from 'lucide-react';

interface TelegramInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  botUsername?: string;
}

export const TelegramInfoModal: React.FC<TelegramInfoModalProps> = ({
  isOpen,
  onClose,
  botUsername = 'adamekLLLLbot',
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-6 text-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <h3 className="text-base font-semibold text-white">
            Přidávání fotografií
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Nové snímky lze nahrávat přímo přes Telegram bota.
          </p>
        </div>

        {/* Instructions */}
        <div className="space-y-3 mb-6 text-xs text-zinc-300">
          <div className="flex items-start gap-3 p-3 bg-zinc-950/60 rounded-lg border border-zinc-800/80">
            <div className="p-1.5 rounded bg-zinc-900 text-zinc-300 mt-0.5 border border-zinc-800">
              <FileCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-medium text-white">1. Formát odeslání</p>
              <p className="text-zinc-400 mt-0.5 leading-relaxed">
                Fotografii zašlete jako soubor / dokument bez komprese pro zachování původní kvality a EXIF metadat data pořízení.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-zinc-950/60 rounded-lg border border-zinc-800/80">
            <div className="p-1.5 rounded bg-zinc-900 text-zinc-300 mt-0.5 border border-zinc-800">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-medium text-white">2. Chronologické zařazení</p>
              <p className="text-zinc-400 mt-0.5 leading-relaxed">
                Snímek je automaticky zařazen do časové osy podle data expozice, nikoliv podle času nahrání.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-zinc-950/60 rounded-lg border border-zinc-800/80">
            <div className="p-1.5 rounded bg-zinc-900 text-zinc-300 mt-0.5 border border-zinc-800">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-medium text-white">3. Oprávnění</p>
              <p className="text-zinc-400 mt-0.5 leading-relaxed">
                Nahrávání je omezeno na autorizovaná uživatelská ID. Příkazem <code className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-200 font-mono">/start</code> v botu zjistíte své identifikační číslo.
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5">
          <a
            href={`https://t.me/${botUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 font-medium text-xs transition"
          >
            <Send className="w-3.5 h-3.5" />
            Otevřít @{botUsername}
          </a>
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs transition"
          >
            Zavřít
          </button>
        </div>
      </div>
    </div>
  );
};
