import React, { useState } from "react";
import { Poll } from "../types";
import { db } from "../lib/firebase";
import { doc, updateDoc, increment, deleteDoc } from "firebase/firestore";
import { motion } from "motion/react";
import { 
  Vote, 
  Share2, 
  Trash2, 
  Twitter, 
  Check, 
  Copy, 
  Smartphone, 
  Users,
  Percent,
  Calendar
} from "lucide-react";

export const VerifiedGoldBadge = () => (
  <span className="inline-flex items-center gap-1 cursor-help" title="Doğrulanmış Özel Hesap">
    <svg 
      className="w-4 h-4 drop-shadow-[0_0_5px_rgba(234,179,8,0.6)] shrink-0" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M12 2l1.9 2.2 2.9-.4.9 2.8 2.6 1.3-.4 2.9 1.7 2.4-1.7 2.4.4 2.9-2.6 1.3-.9 2.8-2.9-.4L12 22l-1.9-2.2-2.9.4-.9-2.8-2.6-1.3.4-2.9-1.7-2.4 1.7-2.4-.4-2.9 2.6-1.3.9-2.8 2.9.4L12 2z" 
        fill="url(#goldGrad)" 
      />
      <path 
        d="M9 12.5l2 2 4.5-4.5" 
        stroke="#1e1b4b" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <defs>
        <linearGradient id="goldGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
    </svg>
  </span>
);

interface PollCardProps {
  key?: string;
  poll: Poll;
  currentUserId: string | null;
  onAuthRequired: () => void;
}

export default function PollCard({ poll, currentUserId, onAuthRequired }: PollCardProps) {
  const [voting, setVoting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const totalVotes = poll.votesA + poll.votesB;
  const hasVoted = currentUserId ? poll.voters && (currentUserId in poll.voters) : false;
  const userVoteOption = hasVoted ? poll.voters[currentUserId!] : null;

  // Calculate percentages
  const pctA = totalVotes > 0 ? Math.round((poll.votesA / totalVotes) * 100) : 0;
  const pctB = totalVotes > 0 ? Math.round((poll.votesB / totalVotes) * 100) : 0;

  const handleVote = async (optionIndex: number) => {
    if (!currentUserId) {
      onAuthRequired();
      return;
    }
    if (hasVoted || voting) return;

    setVoting(true);
    try {
      const pollRef = doc(db, "polls", poll.id);
      if (optionIndex === 0) {
        await updateDoc(pollRef, {
          [`voters.${currentUserId}`]: 0,
          votesA: increment(1)
        });
      } else {
        await updateDoc(pollRef, {
          [`voters.${currentUserId}`]: 1,
          votesB: increment(1)
        });
      }
    } catch (err) {
      console.error("Oy verme hatası:", err);
      alert("Oy verilirken bir sorun oluştu. Lütfen tekrar deneyin.");
    } finally {
      setVoting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bu anketi tamamen silmek istediğinizden emin misiniz?")) return;
    setDeleteLoading(true);
    try {
      await deleteDoc(doc(db, "polls", poll.id));
    } catch (err) {
      console.error("Anket silinemedi:", err);
      alert("Anket silinirken hata oluştu.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const getPollUrl = () => {
    return `${window.location.origin}/?poll=${poll.id}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getPollUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `"${poll.question}" anketinde senin seçimin hangisi? Oy ver ve savaşa katıl! 🔥`;

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(getPollUrl())}`;
    window.open(url, "_blank");
  };

  const shareOnWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + getPollUrl())}`;
    window.open(url, "_blank");
  };

  const shareOnInstagram = () => {
    // Instagram direct sharing via URL isn't standard, industry standard is copying to clipboard and showing instructions
    navigator.clipboard.writeText(getPollUrl());
    alert("Bağlantı kopyalandı! Instagram hikayenizde bağlantı çıkartması olarak paylaşabilirsiniz. 🔥");
  };

  // Humanize Firestore timestamp
  const formatDate = () => {
    if (!poll.createdAt) return "...";
    try {
      const date = poll.createdAt.toDate ? poll.createdAt.toDate() : new Date(poll.createdAt);
      return date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
    } catch (e) {
      return "...";
    }
  };

  return (
    <div 
      id={`poll-card-${poll.id}`}
      className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700/50 hover:shadow-[0_0_25px_rgba(249,115,22,0.05)] transition-all flex flex-col justify-between"
    >
      {/* Visual neon corner decorations */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-sky-500/10 transition-all"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-orange-500/10 transition-all"></div>

      <div>
        {/* Creator Info & Admin Actions */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            { (poll.isVerifiedCreator || poll.creatorName?.toLowerCase() === "ducknet53" || poll.creatorEmail?.toLowerCase() === "ducknet53@gmail.com") ? (
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(245,158,11,0.15)]" title="Doğrulanmış Özel Hesap">
                @{poll.creatorName}
                <VerifiedGoldBadge />
              </span>
            ) : (
              <span className="bg-slate-800/80 text-sky-400 px-2 py-0.5 rounded font-medium">@{poll.creatorName}</span>
            ) }
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate()}
            </span>
          </div>

          {currentUserId === poll.createdBy && (
            <button
              id={`delete-poll-btn-${poll.id}`}
              onClick={handleDelete}
              disabled={deleteLoading}
              className="text-slate-500 hover:text-rose-400 p-1.5 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
              title="Anketi Sil"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Question Title */}
        <h4 className="font-display font-bold text-lg md:text-xl text-slate-100 mb-6 leading-snug group-hover:text-white transition-colors">
          {poll.question}
        </h4>

        {/* Interactive Voting vs Results area */}
        <div className="space-y-4 mb-6">
          {/* Option A (Neon Blue Side) */}
          <div className="relative">
            {hasVoted ? (
              /* Voted Mode - Progress bar display */
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm font-medium px-1">
                  <span className={`flex items-center gap-1.5 ${userVoteOption === 0 ? "text-sky-400 font-bold" : "text-slate-300"}`}>
                    {poll.optionA}
                    {userVoteOption === 0 && <span className="text-[10px] bg-sky-500/10 text-sky-400 px-1.5 py-0.5 rounded-full uppercase border border-sky-500/20">Seçiminiz</span>}
                  </span>
                  <span className="text-sky-400 font-mono font-semibold">{pctA}%</span>
                </div>
                <div className="h-4 bg-slate-950/80 rounded-full overflow-hidden border border-slate-800 p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${pctA}%` }}
                    transition={{ type: "spring", stiffness: 60, damping: 15 }}
                    className="h-full bg-gradient-to-r from-sky-600 to-sky-400 rounded-full shadow-[0_0_10px_rgba(14,165,233,0.3)]"
                  />
                </div>
                <div className="text-[10px] text-slate-500 font-mono px-1">
                  {poll.votesA} oy
                </div>
              </div>
            ) : (
              /* Voteable Button Option A */
              <button
                id={`vote-optA-btn-${poll.id}`}
                onClick={() => handleVote(0)}
                disabled={voting}
                className="w-full text-left p-4 rounded-xl bg-slate-950/60 border border-sky-500/10 hover:border-sky-500/50 hover:bg-sky-950/20 transition-all duration-300 text-slate-200 hover:text-sky-400 font-semibold text-sm flex justify-between items-center shadow-[0_4px_12px_rgba(0,0,0,0.15)] group/btn cursor-pointer"
              >
                <span className="truncate pr-4">{poll.optionA}</span>
                <span className="shrink-0 px-3 py-1 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-lg group-hover/btn:bg-sky-500 group-hover/btn:text-slate-950 group-hover/btn:border-sky-400 font-display font-bold text-xs transition-colors flex items-center gap-1 uppercase">
                  <Vote className="w-3.5 h-3.5" />
                  Mavi Taraf
                </span>
              </button>
            )}
          </div>

          {/* Versus Line in between options */}
          {!hasVoted && (
            <div className="flex items-center justify-center -my-2 opacity-50 relative z-10">
              <span className="text-xs font-bold font-display bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-slate-500">
                VS
              </span>
            </div>
          )}

          {/* Option B (Neon Orange Side) */}
          <div className="relative">
            {hasVoted ? (
              /* Voted Mode - Progress bar display */
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm font-medium px-1">
                  <span className={`flex items-center gap-1.5 ${userVoteOption === 1 ? "text-orange-400 font-bold" : "text-slate-300"}`}>
                    {poll.optionB}
                    {userVoteOption === 1 && <span className="text-[10px] bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded-full uppercase border border-orange-500/20">Seçiminiz</span>}
                  </span>
                  <span className="text-orange-400 font-mono font-semibold">{pctB}%</span>
                </div>
                <div className="h-4 bg-slate-950/80 rounded-full overflow-hidden border border-slate-800 p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${pctB}%` }}
                    transition={{ type: "spring", stiffness: 60, damping: 15 }}
                    className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.3)]"
                  />
                </div>
                <div className="text-[10px] text-slate-500 font-mono px-1">
                  {poll.votesB} oy
                </div>
              </div>
            ) : (
              /* Voteable Button Option B */
              <button
                id={`vote-optB-btn-${poll.id}`}
                onClick={() => handleVote(1)}
                disabled={voting}
                className="w-full text-left p-4 rounded-xl bg-slate-950/60 border border-orange-500/10 hover:border-orange-500/50 hover:bg-orange-950/20 transition-all duration-300 text-slate-200 hover:text-orange-400 font-semibold text-sm flex justify-between items-center shadow-[0_4px_12px_rgba(0,0,0,0.15)] group/btn cursor-pointer"
              >
                <span className="truncate pr-4">{poll.optionB}</span>
                <span className="shrink-0 px-3 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-lg group-hover/btn:bg-orange-500 group-hover/btn:text-slate-950 group-hover/btn:border-orange-400 font-display font-bold text-xs transition-colors flex items-center gap-1 uppercase">
                  <Vote className="w-3.5 h-3.5" />
                  Turuncu Taraf
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer statistics and Share Actions */}
      <div className="pt-4 border-t border-slate-800/50 flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono">
          <Users className="w-4 h-4 text-slate-500" />
          <span>Toplam: <strong className="text-slate-200">{totalVotes}</strong> oy</span>
        </div>

        {/* Share buttons container */}
        <div className="relative">
          <button
            id={`share-menu-toggle-${poll.id}`}
            onClick={() => setShareOpen(!shareOpen)}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-800 hover:border-slate-600 transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            Paylaş
          </button>

          {/* Share dropup menu */}
          {shareOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShareOpen(false)}></div>
              <div id={`share-dropdown-${poll.id}`} className="absolute bottom-full right-0 mb-2 z-20 w-44 bg-slate-950 border border-slate-800 rounded-xl p-1.5 shadow-2xl space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
                <button
                  onClick={() => { shareOnTwitter(); setShareOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-900 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Twitter className="w-3.5 h-3.5 text-sky-400" />
                  X'te Paylaş
                </button>
                <button
                  onClick={() => { shareOnWhatsApp(); setShareOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-900 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="text-emerald-500 font-bold text-[14px]">W</span>
                  WhatsApp'ta Gönder
                </button>
                <button
                  onClick={() => { shareOnInstagram(); setShareOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-900 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="text-pink-500 font-bold text-[14px]">I</span>
                  Instagram Hikaye
                </button>
                <hr className="border-slate-800 my-1" />
                <button
                  onClick={() => { handleCopyLink(); setShareOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-900 rounded-lg flex items-center justify-between gap-2 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    Bağlantıyı Kopyala
                  </span>
                  {copied && <Check className="w-3 h-3 text-emerald-400" />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
