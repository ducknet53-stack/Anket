import React, { useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { updateProfile } from "firebase/auth";
import { collection, query, where, getDocs, writeBatch, doc, setDoc } from "firebase/firestore";
import { X, Sparkles, User, Check, Edit2, AlertCircle } from "lucide-react";
import Avatar, { AVATAR_PRESETS } from "./Avatar";

// Helper function to resize and compress selected gallery images to ultra-compact Base64 JPEG
const resizeAndCompressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 150;
        const MAX_HEIGHT = 150;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.75); // Compact JPEG with 75% quality
          resolve(dataUrl);
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any; // User object from Firebase
}

export default function ProfileModal({ isOpen, onClose, currentUser }: ProfileModalProps) {
  const [displayName, setDisplayName] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("zap");
  const [customPhotoData, setCustomPhotoData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isAdmin = currentUser?.email?.toLowerCase() === "ducknet53@gmail.com";

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || currentUser.email?.split("@")[0] || "");
      
      const photo = currentUser.photoURL || "";
      if (photo.startsWith("preset:")) {
        setSelectedPreset(photo.replace("preset:", ""));
        setCustomPhotoData(null);
      } else if (photo.startsWith("data:image/") || photo.startsWith("http")) {
        setCustomPhotoData(photo);
      } else {
        // Default based on role
        if (currentUser.email?.toLowerCase() === "ducknet53@gmail.com") {
          setSelectedPreset("crown");
        } else {
          setSelectedPreset("zap");
        }
        setCustomPhotoData(null);
      }
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Seçilen dosya çok büyük. Lütfen daha küçük bir resim seçin.");
      return;
    }

    try {
      setError("");
      const compressedBase64 = await resizeAndCompressImage(file);
      setCustomPhotoData(compressedBase64);
    } catch (err) {
      console.error("Resim yükleme hatası:", err);
      setError("Resim okunurken bir hata oluştu.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError("İsim alanı boş bırakılamaz.");
      return;
    }
    if (displayName.trim().length < 3) {
      setError("İsim en az 3 karakter olmalıdır.");
      return;
    }
    if (displayName.trim().length > 25) {
      setError("İsim en fazla 25 karakter olmalıdır.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // If admin and uploaded custom photo, use base64. Otherwise use the preset.
      const newPhotoURL = isAdmin && customPhotoData ? customPhotoData : `preset:${selectedPreset}`;
      const newName = displayName.trim();

      // 1. Update Firebase Auth Profile
      await updateProfile(currentUser, {
        displayName: newName,
        photoURL: newPhotoURL,
      });

      // 2. Save/Update User Profile in Firestore
      const userDocRef = doc(db, "users", currentUser.uid);
      await setDoc(userDocRef, {
        displayName: newName,
        photoURL: newPhotoURL,
        email: currentUser.email,
        updatedAt: new Date(),
        isVerified: isAdmin,
      }, { merge: true });

      // 3. Update all past polls in Firestore
      const pollsRef = collection(db, "polls");
      const q = query(pollsRef, where("createdBy", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const batch = writeBatch(db);
        querySnapshot.forEach((pollDoc) => {
          batch.update(doc(db, "polls", pollDoc.id), {
            creatorName: newName,
            creatorAvatar: newPhotoURL
          });
        });
        await batch.commit();
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error("Profil güncelleme hatası:", err);
      setError(`Profil güncellenirken bir hata oluştu: ${err.message || "Bilinmeyen hata"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="profile-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div id="profile-modal" className="relative w-full max-w-lg bg-slate-900 border border-sky-500/20 rounded-2xl shadow-[0_0_40px_rgba(14,165,233,0.15)] overflow-hidden">
        
        {/* Glow effect at top */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-sky-400 to-transparent"></div>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-400 animate-pulse" />
            <h3 className="font-display font-bold text-xl text-slate-100">Profil Ayarları</h3>
          </div>
          <button 
            id="close-profile-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1 hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm flex gap-2 items-center">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm flex gap-2 items-center">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Profiliniz başarıyla güncellendi! Tüm anketleriniz yenileniyor...</span>
            </div>
          )}

          {/* Conditional rendering of avatar picker / file uploader */}
          {isAdmin ? (
            /* Admin custom gallery photo uploader */
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Profil Resmi (Galeriden Yükle)
              </label>
              
              <div className="flex flex-col items-center justify-center p-6 bg-slate-950/50 border border-dashed border-slate-800 hover:border-sky-500/40 rounded-2xl gap-4 group transition-all relative">
                <div className="relative">
                  <Avatar photoURL={customPhotoData} displayName={displayName} size="xl" />
                  <label 
                    htmlFor="gallery-upload"
                    className="absolute -bottom-1 -right-1 p-2 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl cursor-pointer shadow-lg transition-transform hover:scale-110 flex items-center justify-center border border-slate-900"
                    title="Fotoğraf Seç"
                  >
                    <Edit2 className="w-4 h-4 stroke-[2.5]" />
                  </label>
                </div>
                
                <div className="text-center space-y-1">
                  <p className="text-xs text-slate-200 font-semibold group-hover:text-sky-400 transition-colors">
                    {customPhotoData ? "Fotoğrafı Değiştirmek İçin Tıkla" : "Cihazından Profil Resmi Seç"}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Resim dosyası otomatik olarak kırpılıp optimize edilecektir
                  </p>
                </div>

                <input
                  id="gallery-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            /* Standard preset selector for general users */
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Neon Avatar Seçimi
              </label>
              
              <div className="flex items-center gap-4 p-4 bg-slate-950/50 border border-slate-800/80 rounded-2xl">
                <Avatar photoURL={`preset:${selectedPreset}`} displayName={displayName} size="xl" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-200">Canlı Önizleme</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Aşağıdaki neon emojilerden birini seçerek profilini savaş meydanında özelleştir!
                  </p>
                </div>
              </div>

              {/* Presets Grid */}
              <div className="grid grid-cols-4 gap-3">
                {AVATAR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedPreset(preset.id)}
                    className={`relative p-3 bg-slate-950 hover:bg-slate-800/60 rounded-xl border transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      selectedPreset === preset.id 
                        ? "border-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.15)]" 
                        : "border-slate-800/80 hover:border-slate-700"
                    }`}
                  >
                    <Avatar photoURL={`preset:${preset.id}`} size="sm" />
                    <span className="text-[9px] text-slate-400 font-medium truncate max-w-full">
                      {preset.name.split(" ")[0]}
                    </span>
                    {selectedPreset === preset.id && (
                      <div className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-sky-500 text-slate-950 rounded-full flex items-center justify-center border border-slate-900 shadow">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Profile Name */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Görüntülenecek İsim / Kullanıcı Adı
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                id="edit-profile-name"
                type="text"
                placeholder="İsminizi yazın..."
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={25}
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-sky-500/50 rounded-xl text-sm placeholder-slate-500 focus:outline-none transition-all text-slate-200"
                required
              />
            </div>
          </div>

          {/* Footer Save Actions */}
          <div className="flex gap-3 pt-2">
            <button
              id="cancel-profile-btn"
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-slate-950 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs transition-colors border border-slate-800 cursor-pointer"
            >
              İptal
            </button>
            <button
              id="save-profile-btn"
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-[0_0_20px_rgba(14,165,233,0.25)] hover:scale-[1.01] cursor-pointer"
            >
              {loading ? "Kaydediliyor..." : "Profili Kaydet"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
