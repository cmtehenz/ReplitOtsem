import { ArrowDownLeft, ArrowUpRight, Plus } from "lucide-react";

export function ActionGrid() {
  return (
    <div className="relative h-16 w-full max-w-[320px] mx-auto">
      {/* Black Pill Container */}
      <div className="absolute inset-0 bg-black rounded-full shadow-2xl flex items-center justify-between px-1.5 py-1.5 z-10">
        
        {/* Left Button: Receive */}
        <button className="flex-1 flex items-center justify-center gap-2 h-full rounded-full hover:bg-white/10 transition-colors group">
          <ArrowDownLeft className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
          <span className="text-white font-medium text-sm">Receive</span>
        </button>

        {/* Center Spacer for the floating button */}
        <div className="w-16"></div>

        {/* Right Button: Send */}
        <button className="flex-1 flex items-center justify-center gap-2 h-full rounded-full hover:bg-white/10 transition-colors group">
          <span className="text-white font-medium text-sm">Send</span>
          <ArrowUpRight className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
        </button>

      </div>

      {/* Floating Center Button (Iridescent/Glossy) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full p-[2px] bg-gradient-to-b from-white/20 to-transparent shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
        <button className="w-full h-full rounded-full overflow-hidden relative flex items-center justify-center hover:scale-105 transition-transform active:scale-95">
          {/* Iridescent Background */}
          <div className="absolute inset-0 bg-[conic-gradient(from_0deg,#a78bfa,#3b82f6,#06b6d4,#10b981,#a78bfa)] opacity-80 blur-[2px]" />
          <div className="absolute inset-0 bg-white/30 mix-blend-overlay" />
          <div className="absolute inset-[1px] rounded-full bg-gradient-to-b from-white/60 to-white/10 backdrop-blur-sm" />
          
          {/* Icon */}
          <Plus className="w-6 h-6 text-black relative z-10" />
        </button>
      </div>
    </div>
  );
}
