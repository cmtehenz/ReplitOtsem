import { BottomNav } from "@/components/bottom-nav";
import { ActionGrid } from "@/components/action-grid";
import { AssetList } from "@/components/asset-list";
import { Bell, ChevronDown, QrCode } from "lucide-react";
import avatar from "@assets/generated_images/professional_user_avatar_portrait.png";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen pb-32 px-4 pt-6 max-w-md mx-auto">
      {/* Main Container with large rounded corners */}
      <div className="bg-white/40 backdrop-blur-sm rounded-[2.5rem] min-h-[85vh] p-6 relative shadow-[0_0_40px_rgba(0,0,0,0.02)] border border-white/40">
        
        {/* Header Section */}
        <header className="flex justify-between items-start mb-8">
          {/* User Avatar */}
          <div className="relative cursor-pointer" onClick={() => setLocation("/profile")}>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
              <img src={avatar} alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
              8
            </div>
          </div>

          {/* Center Wallet Address */}
          <div className="flex items-center gap-1 bg-white/60 px-3 py-1.5 rounded-full border border-black/5 shadow-sm cursor-pointer hover:bg-white transition-colors">
            <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white text-[8px] font-bold">C</div>
            <span className="text-xs font-medium text-gray-600">0xfK07...8336</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </div>

          {/* QR Code / Scan Icon */}
          <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-black/5 hover:bg-gray-50 transition-colors text-black">
            <QrCode className="w-5 h-5" />
          </button>
        </header>

        {/* Balance Section */}
        <div className="text-center space-y-1 mb-10">
          <h2 className="text-sm font-medium text-gray-500">Portfolio</h2>
          <div className="flex items-baseline justify-center gap-1">
            <h1 className="text-4xl font-display font-bold text-black tracking-tight">
              35,292.29
            </h1>
            <span className="text-xl font-medium text-gray-400">TEA</span>
          </div>
          <p className="text-sm font-medium text-gray-400">35,292.29 USD</p>
        </div>

        {/* Action Bar (Black Pill) */}
        <div className="mb-10">
          <ActionGrid />
        </div>

        {/* Vault / Secondary Card (Optional from reference) */}
        <div className="mb-8">
          <div className="bg-[#F3F4F6] rounded-[1.5rem] p-4 flex items-center justify-between shadow-inner border border-white/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center text-gray-600">
                <span className="font-bold text-xs">|||</span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Vault</p>
                <p className="text-lg font-bold text-gray-900">$34,209</p>
              </div>
            </div>
            <button className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg">
              <span className="text-xl font-light">+</span>
            </button>
          </div>
        </div>

        {/* Asset Grid */}
        <section>
          <AssetList />
        </section>

      </div>

      {/* Floating Bottom Nav */}
      <BottomNav active="home" />
    </div>
  );
}
