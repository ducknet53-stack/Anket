import React from "react";
import { 
  Flame, 
  Zap, 
  Swords, 
  Crown, 
  Gamepad2, 
  Ghost, 
  Star, 
  Shield, 
  User 
} from "lucide-react";

export const AVATAR_PRESETS = [
  { id: "flame", name: "Ateş Duellocusu", color: "from-rose-500 to-orange-500", glow: "rgba(244,63,94,0.45)", icon: Flame },
  { id: "zap", name: "Elektrik Gücü", color: "from-amber-400 to-yellow-500", glow: "rgba(245,158,11,0.45)", icon: Zap },
  { id: "swords", name: "Siber Şövalye", color: "from-sky-400 to-indigo-500", glow: "rgba(14,165,233,0.45)", icon: Swords },
  { id: "crown", name: "Efsanevi Kral", color: "from-yellow-400 to-amber-500", glow: "rgba(234,179,8,0.45)", icon: Crown },
  { id: "gamepad", name: "Neon Oyuncu", color: "from-pink-500 to-fuchsia-600", glow: "rgba(236,72,153,0.45)", icon: Gamepad2 },
  { id: "ghost", name: "Hayalet", color: "from-emerald-400 to-teal-500", glow: "rgba(16,185,129,0.45)", icon: Ghost },
  { id: "star", name: "Kozmik Yıldız", color: "from-violet-500 to-purple-600", glow: "rgba(139,92,246,0.45)", icon: Star },
  { id: "shield", name: "Plazma Kalkanı", color: "from-teal-400 to-emerald-500", glow: "rgba(20,184,166,0.45)", icon: Shield },
];

interface AvatarProps {
  photoURL?: string | null;
  displayName?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function Avatar({ photoURL, displayName, size = "md", className = "" }: AvatarProps) {
  // Determine dimensions
  const sizeClasses = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base",
    xl: "w-20 h-20 text-xl",
  };

  const iconSizes = {
    xs: 12,
    sm: 15,
    md: 18,
    lg: 24,
    xl: 36,
  };

  const isCustomImage = photoURL?.startsWith("http") || photoURL?.startsWith("data:image/");

  if (isCustomImage && photoURL) {
    return (
      <div 
        className={`rounded-xl overflow-hidden border border-sky-500/20 shrink-0 ${sizeClasses[size]} ${className}`}
        style={{ boxShadow: "0 0 15px rgba(14,165,233,0.2)" }}
      >
        <img 
          src={photoURL} 
          alt={displayName || "User"} 
          className="w-full h-full object-cover pointer-events-none select-none"
          referrerPolicy="no-referrer"
          draggable="false"
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
    );
  }

  // Preset avatar parsing
  let presetId = "zap"; // Default
  if (photoURL?.startsWith("preset:")) {
    presetId = photoURL.replace("preset:", "");
  } else if (displayName?.toLowerCase() === "ducknet53" || displayName?.toLowerCase() === "ducknet53@gmail.com") {
    // Admin default
    presetId = "crown";
  }

  const preset = AVATAR_PRESETS.find((p) => p.id === presetId) || AVATAR_PRESETS[1]; // fallback to zap
  const PresetIcon = preset.icon;

  return (
    <div 
      className={`rounded-xl bg-gradient-to-br ${preset.color} flex items-center justify-center shrink-0 border border-white/10 ${sizeClasses[size]} ${className}`}
      style={{ 
        boxShadow: `0 0 15px ${preset.glow}`,
      }}
      title={preset.name}
    >
      <PresetIcon size={iconSizes[size]} className="text-slate-950 stroke-[2.5]" />
    </div>
  );
}
