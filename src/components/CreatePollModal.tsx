import React, { useState } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { X, HelpCircle, ArrowRightLeft, Sparkles, CheckCircle2 } from "lucide-react";

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userDisplayName: string | null;
  userEmail: string | null;
}

export default function CreatePollModal({ isOpen, onClose, userId, userDisplayName, userEmail }: CreatePollModalProps) {
  const [question, setQuestion] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !optionA.trim() || !optionB.trim()) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const isVerified = userEmail?.toLowerCase() === "ducknet53@gmail.com";
      const creatorName = isVerified ? "ducknet53" : (userDisplayName || (userEmail ? userEmail.split("@")[0] : "Anonim"));
      
      const newPoll = {
        question: question.trim(),
        optionA: optionA.trim(),
        optionB: optionB.trim(),
        votesA: 0,
        votesB: 0,
        createdBy: userId,
        creatorName: creatorName,
        creatorEmail: userEmail || "",
        isVerifiedCreator: isVerified,
        createdAt: serverTimestamp(),
        voters: {}
      };

      await addDoc(collection(db, "polls"), newPoll);
      setSuccess(true);
      
      setTimeout(() => {
        // Reset states
        setQuestion("");
        setOptionA("");
        setOptionB("");
        setSuccess(false);
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error("Anket oluşturulurken hata:", err);
      setError("Anket oluşturulamadı. Lütfen Firebase yetkilerinizi veya ayarlarınızı kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="create-poll-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div id="create-poll-modal" className="relative w-full max-w-lg bg-slate-900 border border-sky-500/20 rounded-2xl shadow-[0_0_40px_rgba(249,115,22,0.15)] overflow-hidden">
        
        {/* Glow effect at top */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <h3 className="font-display font-bold text-xl text-slate-100">Yeni Anket Savası Başlat</h3>
          </div>
          <button 
            id="close-create-poll-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1 hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/30 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="font-display font-bold text-xl text-slate-100">Savaş Meydanı Hazır!</h4>
              <p className="text-slate-400 text-sm max-w-xs">Anketiniz başarıyla oluşturuldu ve oylamaya açıldı.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">
                  {error}
                </div>
              )}

              {/* Question */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                  Savaş Sorusunu Sor
                </label>
                <textarea 
                  id="poll-question-input"
                  value={question} 
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Hangi taraf daha güçlü? JavaScript mi, Python mu?"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors text-sm min-h-[80px] resize-none"
                  maxLength={150}
                  required
                />
                <div className="flex justify-end text-[10px] text-slate-500 mt-1">
                  {question.length}/150
                </div>
              </div>

              {/* Option A (Neon Blue) */}
              <div>
                <label className="block text-xs font-semibold text-sky-400 mb-2 uppercase tracking-wider">
                  Mavi Taraf (Seçenek A)
                </label>
                <input 
                  id="poll-optionA-input"
                  type="text" 
                  value={optionA} 
                  onChange={(e) => setOptionA(e.target.value)}
                  placeholder="JavaScript"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-sky-500/20 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-all text-sm focus:shadow-[0_0_15px_rgba(14,165,233,0.15)]"
                  maxLength={50}
                  required
                />
              </div>

              {/* Versus Indicator */}
              <div className="flex justify-center -my-2 relative z-10">
                <div className="bg-slate-900 border border-slate-800 p-2 rounded-full shadow-lg">
                  <ArrowRightLeft className="w-4 h-4 text-orange-500 rotate-90" />
                </div>
              </div>

              {/* Option B (Neon Orange) */}
              <div>
                <label className="block text-xs font-semibold text-orange-400 mb-2 uppercase tracking-wider">
                  Turuncu Taraf (Seçenek B)
                </label>
                <input 
                  id="poll-optionB-input"
                  type="text" 
                  value={optionB} 
                  onChange={(e) => setOptionB(e.target.value)}
                  placeholder="Python"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-orange-500/20 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-all text-sm focus:shadow-[0_0_15px_rgba(249,115,22,0.15)]"
                  maxLength={50}
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800/60">
                <button
                  id="cancel-create-poll-btn"
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-colors cursor-pointer"
                >
                  İptal
                </button>
                <button
                  id="submit-create-poll-btn"
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 text-xs bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)] disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Savaş Başlatılıyor..." : "Savaşı Başlat!"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
