import React, { useState, useEffect } from "react";
import { auth, db } from "./lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, onSnapshot, query } from "firebase/firestore";
import { Poll } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { 
  Flame, 
  Plus, 
  LogIn, 
  LogOut, 
  Search, 
  HelpCircle, 
  User as UserIcon, 
  Info,
  Twitter,
  Youtube,
  Instagram,
  Compass,
  Trophy,
  CheckCircle2
} from "lucide-react";

import AuthModal from "./components/AuthModal";
import CreatePollModal from "./components/CreatePollModal";
import PollCard, { VerifiedGoldBadge } from "./components/PollCard";
import Avatar from "./components/Avatar";
import ProfileModal from "./components/ProfileModal";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  
  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Copy-link notifications
  const [toastMessage, setToastMessage] = useState("");

  // Check URL params for a shared poll
  const [highlightedPollId, setHighlightedPollId] = useState<string | null>(null);

  // Listen to Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Listen to Firestore Polls
  useEffect(() => {
    // Parse query params on load
    const params = new URLSearchParams(window.location.search);
    const sharedPollId = params.get("poll");
    if (sharedPollId) {
      setHighlightedPollId(sharedPollId);
    }

    const pollsCol = collection(db, "polls");
    const unsubscribe = onSnapshot(
      pollsCol,
      (snapshot) => {
        const pollsData: Poll[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          pollsData.push({
            id: doc.id,
            question: data.question,
            optionA: data.optionA,
            optionB: data.optionB,
            votesA: data.votesA || 0,
            votesB: data.votesB || 0,
            createdBy: data.createdBy,
            creatorName: data.creatorName || "Anonim",
            creatorEmail: data.creatorEmail || "",
            creatorAvatar: data.creatorAvatar || "",
            isVerifiedCreator: data.isVerifiedCreator || false,
            createdAt: data.createdAt,
            voters: data.voters || {},
          });
        });

        // Safe client-side sorting by creation time
        pollsData.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
          return timeB - timeA;
        });

        setPolls(pollsData);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore loading error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (confirm("Oturumu kapatmak istediğinize emin misiniz?")) {
      await signOut(auth);
    }
  };

  const handleCreatePollClick = () => {
    if (!user) {
      setIsAuthOpen(true);
    } else {
      setIsCreateOpen(true);
    }
  };

  // Filter polls
  const filteredPolls = polls.filter((poll) => {
    const matchesSearch = poll.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poll.optionA.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poll.optionB.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "my") {
      return matchesSearch && poll.createdBy === user?.uid;
    }
    
    // If a specific poll was shared, bring it to the top or filter it
    if (highlightedPollId) {
      // Just normal list but let it match
    }

    return matchesSearch;
  });

  // Re-order if there is a highlighted poll
  const sortedAndFilteredPolls = [...filteredPolls];
  if (highlightedPollId) {
    const highlightedIdx = sortedAndFilteredPolls.findIndex(p => p.id === highlightedPollId);
    if (highlightedIdx > -1) {
      const [highlightedPoll] = sortedAndFilteredPolls.splice(highlightedIdx, 1);
      sortedAndFilteredPolls.unshift(highlightedPoll);
    }
  }

  const totalGlobalVotes = polls.reduce((acc, p) => acc + (p.votesA || 0) + (p.votesB || 0), 0);

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col relative text-slate-200">
      
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-sky-950/15 via-[#0b0f19]/5 to-transparent pointer-events-none"></div>
      <div className="absolute top-20 left-10 w-[300px] h-[300px] bg-sky-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-60 right-10 w-[300px] h-[300px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0b0f19]/85 backdrop-blur-md border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setActiveTab("all"); setHighlightedPollId(null); }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-orange-500 flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.3)]">
              <Flame className="w-6 h-6 text-slate-950 fill-slate-950 animate-pulse" />
            </div>
            <div>
              <h1 className="font-display font-black text-lg md:text-xl tracking-tight bg-gradient-to-r from-sky-400 via-white to-orange-500 bg-clip-text text-transparent">
                ANKET SAVAŞLARI
              </h1>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest leading-none">NEON DUELLOLAR</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">

            {user ? (
              <div className="flex items-center gap-2 md:gap-3">
                {/* Interactive Profile Area */}
                <button
                  id="header-profile-btn"
                  onClick={() => setIsProfileOpen(true)}
                  className="flex items-center gap-2.5 p-1.5 md:p-2 pr-3 md:pr-4 bg-slate-950/60 hover:bg-slate-900/80 text-left border border-slate-800/80 hover:border-sky-500/30 rounded-2xl transition-all cursor-pointer group shadow-[0_0_15px_rgba(14,165,233,0.05)]"
                  title="Profil Ayarlarını Aç"
                >
                  <Avatar photoURL={user.photoURL} displayName={user.displayName} size="md" />
                  <div className="flex flex-col justify-center">
                    {user.email?.toLowerCase() === "ducknet53@gmail.com" ? (
                      <span className="text-xs md:text-sm font-bold text-amber-400 inline-flex items-center gap-1.5 select-none">
                        {user.displayName || "ducknet53"}
                        <VerifiedGoldBadge />
                      </span>
                    ) : (
                      <span className="text-xs md:text-sm font-bold text-slate-200 group-hover:text-sky-400 transition-colors truncate max-w-[90px] sm:max-w-[140px] select-none">
                        {user.displayName || user.email?.split("@")[0]}
                      </span>
                    )}
                    <span className="text-[9px] md:text-[10px] text-slate-500 font-mono leading-none mt-1 select-none">
                      {user.email?.toLowerCase() === "ducknet53@gmail.com" ? "Yönetici 👑" : "Profil Ayarları ⚙️"}
                    </span>
                  </div>
                </button>

                {/* Logout Button */}
                <button
                  id="logout-btn"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-2.5 py-2 bg-slate-900 hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/20 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  title="Çıkış Yap"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Çıkış</span>
                </button>
              </div>
            ) : (
              /* Login Button */
              <button
                id="login-btn"
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(14,165,233,0.3)] cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                Giriş Yap
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome Hero Banner */}
        <div className="relative bg-gradient-to-r from-sky-950/20 via-slate-900/40 to-orange-950/20 border border-slate-800/60 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
          
          {/* Subtle neon glowing horizontal dividers */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-sky-500/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent"></div>

          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full text-xs font-semibold uppercase font-display">
              <Trophy className="w-3.5 h-3.5" />
              Rekabet Başladı
            </div>
            <h2 className="font-display font-black text-2xl md:text-3xl lg:text-4xl text-slate-100 tracking-tight leading-tight">
              Kendi Sorunu Sor, <br />
              <span className="bg-gradient-to-r from-sky-400 to-orange-400 bg-clip-text text-transparent">Neon Savaş Alanında</span> Düelloyu Başlat!
            </h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Fikirlerin çarpıştığı yer. En hararetli tartışmalara oy ver, anket sonuçlarını anlık olarak izle ve arkadaşlarınla paylaşarak gücünü göster!
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-3 min-w-[200px]">
            <button
              id="main-create-poll-btn"
              onClick={handleCreatePollClick}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.35)] hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              Yeni Anket Savaşı Aç
            </button>
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-around text-center gap-2">
              <div>
                <span className="block font-mono font-bold text-lg text-sky-400">{polls.length}</span>
                <span className="text-[9px] text-slate-500 uppercase font-semibold">Anket</span>
              </div>
              <div className="h-6 w-[1px] bg-slate-800"></div>
              <div>
                <span className="block font-mono font-bold text-lg text-orange-400">{totalGlobalVotes}</span>
                <span className="text-[9px] text-slate-500 uppercase font-semibold">Toplam Oy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tab & Search Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          
          {/* Tabs */}
          <div className="bg-slate-950/80 border border-slate-800 p-1 rounded-2xl flex gap-1 self-start">
            <button
              id="tab-all-btn"
              onClick={() => { setActiveTab("all"); setHighlightedPollId(null); }}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "all" && !highlightedPollId
                  ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Tüm Savaşlar
            </button>
            {user && (
              <button
                id="tab-my-btn"
                onClick={() => { setActiveTab("my"); setHighlightedPollId(null); }}
                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "my"
                    ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                Benim Savaşlarım
              </button>
            )}
            {highlightedPollId && (
              <div className="flex items-center gap-1 px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-bold">
                <span>Paylaşılan Anket</span>
                <button 
                  id="clear-highlight-btn"
                  className="text-indigo-400 hover:text-indigo-200 ml-1"
                  onClick={() => setHighlightedPollId(null)}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Search bar */}
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              id="search-input"
              type="text"
              placeholder="Savaş sorusu veya seçenek ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-sky-500/50 rounded-2xl text-sm placeholder-slate-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Info Note about current Shared Poll */}
        {highlightedPollId && (
          <div className="p-4 bg-sky-950/30 border border-sky-500/30 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-sky-400 shrink-0" />
              <p className="text-sm text-sky-200">
                Şu anda size <strong>paylaşılan özel anket</strong> listenin en üstünde gösterilmektedir.
              </p>
            </div>
            <button
              id="show-all-shared-btn"
              onClick={() => setHighlightedPollId(null)}
              className="text-xs text-sky-400 hover:underline font-bold"
            >
              Tümünü Göster
            </button>
          </div>
        )}

        {/* Poll List Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm">Savaş alanı yükleniyor...</p>
          </div>
        ) : sortedAndFilteredPolls.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedAndFilteredPolls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                currentUserId={user?.uid || null}
                onAuthRequired={() => setIsAuthOpen(true)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl space-y-4">
            <HelpCircle className="w-12 h-12 text-slate-700 mx-auto" />
            <div className="space-y-1">
              <h4 className="font-display font-semibold text-lg text-slate-300">Anket Bulunamadı</h4>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                {searchQuery ? "Aramanızla eşleşen anket bulunmamaktadır. Başka bir kelime deneyebilirsiniz." : "Henüz bu kategoride açılmış aktif bir anket bulunmuyor."}
              </p>
            </div>
            {!searchQuery && (
              <button
                id="empty-create-btn"
                onClick={handleCreatePollClick}
                className="px-5 py-2.5 bg-slate-900 border border-slate-800 hover:border-sky-500/30 text-sky-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                İlk Anketi Sen Oluştur!
              </button>
            )}
          </div>
        )}

      </main>

      {/* Footer & Social Media Links */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="font-display font-bold text-slate-400 text-sm tracking-wide">
              ANKET SAVAŞLARI © 2026
            </span>
          </div>

          <p className="text-xs text-slate-500 text-center md:text-left">
            Fikirlerinizin yarıştığı, özgür ve eğlenceli anket platformu. Gücünü göster, tarafını seç!
          </p>

          {/* Social Icons requested: Instagram, X, YouTube, TikTok */}
          <div className="flex items-center gap-3">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noreferrer"
              className="p-2 bg-slate-900 text-slate-400 hover:text-pink-500 hover:bg-pink-500/10 rounded-xl transition-all border border-slate-800 hover:border-pink-500/20"
              title="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a 
              href="https://x.com" 
              target="_blank" 
              rel="noreferrer"
              className="p-2 bg-slate-900 text-slate-400 hover:text-sky-400 hover:bg-sky-400/10 rounded-xl transition-all border border-slate-800 hover:border-sky-400/20"
              title="X (Twitter)"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noreferrer"
              className="p-2 bg-slate-900 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all border border-slate-800 hover:border-rose-500/20"
              title="YouTube"
            >
              <Youtube className="w-4 h-4" />
            </a>
            <a 
              href="https://tiktok.com" 
              target="_blank" 
              rel="noreferrer"
              className="p-2 bg-slate-900 text-slate-400 hover:text-teal-400 hover:bg-teal-400/10 rounded-xl transition-all border border-slate-800 hover:border-teal-400/20"
              title="TikTok"
            >
              {/* TikTok vector placeholder */}
              <span className="font-bold text-[11px] leading-none block font-mono">TT</span>
            </a>
          </div>

        </div>
      </footer>

      {/* Modals and notifications */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
      />

      <CreatePollModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        userId={user?.uid || ""}
        userDisplayName={user?.displayName || null}
        userEmail={user?.email || null}
        userPhotoURL={user?.photoURL || null}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={user}
        onProfileUpdate={() => setUser(auth.currentUser ? Object.create(Object.getPrototypeOf(auth.currentUser), Object.getOwnPropertyDescriptors(auth.currentUser)) : null)}
      />

    </div>
  );
}
