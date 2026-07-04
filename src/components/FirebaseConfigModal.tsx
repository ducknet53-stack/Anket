import React, { useState } from "react";
import { getFirebaseConfig, saveFirebaseConfig, resetFirebaseConfig } from "../lib/firebase";
import { X, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FirebaseConfigModal({ isOpen, onClose }: FirebaseConfigModalProps) {
  const currentConfig = getFirebaseConfig();
  const [apiKey, setApiKey] = useState(currentConfig.apiKey || "");
  const [authDomain, setAuthDomain] = useState(currentConfig.authDomain || "");
  const [projectId, setProjectId] = useState(currentConfig.projectId || "");
  const [storageBucket, setStorageBucket] = useState(currentConfig.storageBucket || "");
  const [messagingSenderId, setMessagingSenderId] = useState(currentConfig.messagingSenderId || "");
  const [appId, setAppId] = useState(currentConfig.appId || "");
  const [firestoreDatabaseId, setFirestoreDatabaseId] = useState(currentConfig.firestoreDatabaseId || "");
  
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveFirebaseConfig({
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim(),
      firestoreDatabaseId: firestoreDatabaseId.trim()
    });
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1500);
  };

  const handleReset = () => {
    if (confirm("Firebase ayarlarını varsayılan (AI Studio) projesine sıfırlamak istediğinize emin misiniz?")) {
      resetFirebaseConfig();
    }
  };

  return (
    <div id="firebase-config-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div id="firebase-config-modal" className="relative w-full max-w-lg bg-slate-900 border border-sky-500/30 rounded-2xl shadow-[0_0_30px_rgba(14,165,233,0.15)] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            <h3 className="font-display font-semibold text-lg text-slate-100">Firebase Bağlantı Ayarları</h3>
          </div>
          <button 
            id="close-config-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1 hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="p-3 bg-sky-950/40 border border-sky-500/20 rounded-xl text-xs text-sky-200 leading-relaxed flex gap-2">
            <AlertTriangle className="w-5 h-5 text-sky-400 shrink-0" />
            <div>
              <span className="font-semibold text-sky-300">Önemli:</span> Uygulama şu an <strong>AI Studio Sandbox</strong> Firebase projesine bağlıdır ve anında çalışır durumdadır. Kendi veritabanınızı bağlamak isterseniz aşağıdaki bilgileri kendi Firebase projenizinkilerle değiştirebilirsiniz.
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">API Key</label>
              <input 
                id="config-apiKey"
                type="text" 
                value={apiKey} 
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 transition-colors text-xs font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Project ID</label>
                <input 
                  id="config-projectId"
                  type="text" 
                  value={projectId} 
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="my-firebase-project"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 transition-colors text-xs font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Auth Domain</label>
                <input 
                  id="config-authDomain"
                  type="text" 
                  value={authDomain} 
                  onChange={(e) => setAuthDomain(e.target.value)}
                  placeholder="project.firebaseapp.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 transition-colors text-xs font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Storage Bucket</label>
                <input 
                  id="config-storageBucket"
                  type="text" 
                  value={storageBucket} 
                  onChange={(e) => setAppId(e.target.value)} // Let's set the correct handlers below
                  className="hidden" // we will bind all variables cleanly
                />
                <input 
                  id="config-storageBucket-real"
                  type="text" 
                  value={storageBucket} 
                  onChange={(e) => setStorageBucket(e.target.value)}
                  placeholder="project.firebasestorage.app"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 transition-colors text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Messaging Sender ID</label>
                <input 
                  id="config-messagingSenderId"
                  type="text" 
                  value={messagingSenderId} 
                  onChange={(e) => setMessagingSenderId(e.target.value)}
                  placeholder="1015784650353"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 transition-colors text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">App ID</label>
              <input 
                id="config-appId"
                type="text" 
                value={appId} 
                onChange={(e) => setAppId(e.target.value)}
                placeholder="1:1015784650353:web:..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 transition-colors text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Firestore Database ID (Opsiyonel)</label>
              <input 
                id="config-firestoreDatabaseId"
                type="text" 
                value={firestoreDatabaseId} 
                onChange={(e) => setFirestoreDatabaseId(e.target.value)}
                placeholder="(default) veya özel veritabanı adı"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 transition-colors text-xs font-mono"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Boş bırakılırsa default veritabanı kullanılır. Sandbox için: <code>ai-studio-17e47a74-01ef-4af5-b4b7-442e421acbea</code>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-slate-800 justify-between">
            <button
              id="reset-config-btn"
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 text-xs border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sıfırla
            </button>
            <div className="flex gap-2">
              <button
                id="cancel-config-btn"
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl transition-colors font-medium"
              >
                Vazgeç
              </button>
              <button
                id="save-config-btn"
                type="submit"
                disabled={success}
                className="flex items-center gap-1.5 px-5 py-2 text-xs bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(14,165,233,0.3)] cursor-pointer"
              >
                {success ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Kaydedildi!
                  </>
                ) : (
                  "Kaydet ve Yeniden Başlat"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
