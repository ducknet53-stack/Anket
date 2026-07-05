import React, { useState } from "react";
import { auth, googleProvider } from "../lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification
} from "firebase/auth";
import { X, Mail, Lock, User, Sparkles, AlertCircle, Chrome } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  if (!isOpen) return null;

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Şifre sıfırlama bağlantısı göndermek için lütfen önce E-posta adresinizi yazın.");
      return;
    }
    setError("");
    setResetSuccess("");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSuccess("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi! Lütfen gelen kutunuzu (ve spam klasörünü) kontrol edin.");
    } catch (err: any) {
      console.error(err);
      let errorMsg = "Şifre sıfırlama e-postası gönderilirken bir hata oluştu.";
      if (err.code === "auth/user-not-found") {
        errorMsg = "Bu e-posta adresine kayıtlı bir kullanıcı bulunamadı.";
      } else if (err.code === "auth/invalid-email") {
        errorMsg = "Geçersiz e-posta adresi.";
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // Sign In
        await signInWithEmailAndPassword(auth, email.trim(), password);
        onClose();
      } else {
        // Sign Up
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        // Set display name if provided
        if (displayName.trim()) {
          await updateProfile(userCredential.user, {
            displayName: displayName.trim(),
          });
        }
        
        // Send Email Verification
        try {
          await sendEmailVerification(userCredential.user);
        } catch (verifErr: any) {
          console.warn("E-posta doğrulama gönderilirken hata oluştu:", verifErr);
        }
        
        // Set success state to show detailed Spam warning
        setVerificationSent(true);
      }
    } catch (err: any) {
      console.error(err);
      let errorMsg = "Bir hata oluştu. Lütfen tekrar deneyin.";
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        errorMsg = "E-posta veya şifre hatalı.";
      } else if (err.code === "auth/email-already-in-use") {
        errorMsg = "Bu e-posta adresi zaten kullanımda.";
      } else if (err.code === "auth/weak-password") {
        errorMsg = "Şifre en az 6 karakter olmalıdır.";
      } else if (err.code === "auth/invalid-email") {
        errorMsg = "Geçersiz e-posta adresi.";
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code !== "auth/popup-closed-by-user") {
        setError(
          "Google ile giriş yaparken bir hata oluştu. Tarayıcı veya iframe engellemeleri nedeniyle Google pop-up penceresi engellenmiş olabilir. Lütfen sağ üstteki 'Yeni Sekmede Aç' butonu ile yeni sekmede açarak deneyin ya da e-posta ve şifrenizle kolayca kayıt olup giriş yapın."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setResetSuccess("");
    setVerificationSent(false);
    setEmail("");
    setPassword("");
    setDisplayName("");
    onClose();
  };

  return (
    <div id="auth-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div id="auth-modal" className="relative w-full max-w-md bg-slate-900 border border-sky-500/30 rounded-2xl shadow-[0_0_40px_rgba(14,165,233,0.15)] overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-sky-400 to-transparent"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-sky-500/10 blur-xl rounded-full"></div>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500 animate-pulse" />
            <h3 className="font-display font-bold text-xl bg-gradient-to-r from-sky-400 to-orange-500 bg-clip-text text-transparent">
              {verificationSent ? "Doğrulama Gerekli" : isLogin ? "Giriş Yap" : "Kayıt Ol"}
            </h3>
          </div>
          <button 
            id="close-auth-btn"
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1 hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {verificationSent ? (
          <div className="p-6 space-y-6 text-center">
            <div className="mx-auto w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center text-amber-400 animate-bounce">
              <Mail className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h4 className="text-lg font-bold text-slate-100">Kayıt Başarılı! 🥳</h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                Hesabınızı oluşturduk! Giriş yapabilmek için lütfen önce e-posta adresinizi doğrulayın.
              </p>
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl text-xs space-y-2 text-left">
              <p className="font-semibold flex items-center gap-1.5 text-amber-400 text-sm">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Önemli Bilgilendirme:
              </p>
              <p className="leading-relaxed">
                Gönderdiğimiz doğrulama maili bazen <strong>Gereksiz (Spam) klasörüne düşebilir</strong>. 
                Lütfen e-posta kutunuzu kontrol ederken <strong>Spam / Junk klasörü dahil tüm klasörleri dikkatle inceleyin</strong>.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(14,165,233,0.3)] text-sm cursor-pointer"
            >
              Anladım, E-postamı Kontrol Ediyorum
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm flex gap-2 items-start">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {resetSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm flex gap-2 items-start">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{resetSuccess}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Ad Soyad</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input 
                      id="auth-name"
                      type="text" 
                      value={displayName} 
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors text-sm"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">E-posta Adresi</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input 
                    id="auth-email"
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@anketsavaslari.com"
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Şifre</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input 
                    id="auth-password"
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors text-sm"
                    required
                  />
                </div>
                {isLogin && (
                  <div className="flex justify-end mt-1.5">
                    <button
                      id="forgot-password-btn"
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs text-sky-400 hover:text-sky-300 hover:underline transition-colors focus:outline-none cursor-pointer"
                    >
                      Şifremi Unuttum?
                    </button>
                  </div>
                )}
              </div>

              <button
                id="auth-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(14,165,233,0.3)] disabled:opacity-50 text-sm cursor-pointer"
              >
                {loading ? "Lütfen Bekleyin..." : isLogin ? "Giriş Yap" : "Kayıt Ol"}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-3 text-slate-500 text-xs uppercase tracking-wider">Veya</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            {/* Google Sign In */}
            <button
              id="auth-google-btn"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-950 border border-slate-800 hover:border-sky-500/50 text-slate-200 font-medium rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-slate-900 text-sm cursor-pointer"
            >
              <Chrome className="w-4 h-4 text-sky-400" />
              Google ile Giriş Yap
            </button>

            {/* Toggle */}
            <p className="text-center text-xs text-slate-400 mt-2">
              {isLogin ? "Hesabınız yok mu?" : "Zaten üye misiniz?"}{" "}
              <button
                id="auth-toggle-btn"
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setVerificationSent(false);
                }}
                className="text-orange-400 hover:text-orange-300 font-semibold hover:underline"
              >
                {isLogin ? "Kayıt Olun" : "Giriş Yapın"}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
