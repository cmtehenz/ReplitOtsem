import { PageContainer } from "@/components/page-container";
import { ArrowLeft, Share2, CheckCircle2, Copy, ArrowUpRight, Download, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function TransactionDetails() {
  const [, setLocation] = useLocation();
  
  return (
    <PageContainer>
      <div className="p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 sticky top-0 z-10 bg-background/50 backdrop-blur-xl p-4 -m-4 border-b border-white/5">
          <button 
            onClick={() => setLocation("/activity")}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 hover:border-primary/30"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-bold text-lg tracking-wide">Receipt</h1>
          <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 hover:border-primary/30">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center w-full space-y-8">
          
          {/* Receipt Card */}
          <div className="w-full relative">
            {/* Receipt visual effect - jagged top/bottom or just a clean card */}
            <div className="glass-card bg-white/5 border border-white/10 rounded-3xl p-8 pt-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-[#7c3aed] to-accent" />
              
              {/* Icon */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 -translate-y-1/2">
                 <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center border-4 border-card shadow-xl">
                    <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
                       <CheckCircle2 className="w-6 h-6" />
                    </div>
                 </div>
              </div>

              <div className="text-center space-y-2 mt-4 mb-8">
                <p className="text-green-500 font-bold text-lg">Transfer Successful</p>
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Feb 24, 2025 • 14:30</p>
                <h2 className="text-5xl font-display font-bold text-white tracking-tight py-4">R$ 150,00</h2>
              </div>

              <div className="space-y-6 relative">
                 {/* Dotted line separator */}
                 <div className="absolute left-0 right-0 top-0 border-t-2 border-dashed border-white/10" />
                 
                 <div className="pt-6 space-y-5">
                    <DetailRow label="Transaction Type" value="Pix Sent" icon={<ArrowUpRight className="w-4 h-4 text-red-400" />} />
                    <DetailRow label="Recipient" value="João Silva" />
                    <DetailRow label="Pix Key" value="joao.silva@email.com" mono />
                    <div className="space-y-2 pt-2">
                       <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Transaction ID</span>
                       <div className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5 group cursor-pointer hover:bg-black/30 transition-colors">
                          <code className="text-xs text-primary font-mono break-all">E00000000202502241430...</code>
                          <Copy className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
                       </div>
                    </div>
                 </div>
              </div>
            </div>
            
            {/* Bottom shadow reflection */}
            <div className="absolute -bottom-4 left-8 right-8 h-8 bg-primary/20 blur-xl rounded-full opacity-50" />
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-4 w-full mt-auto pt-4">
            <Button variant="outline" className="h-14 rounded-2xl border-white/10 hover:bg-white/5 font-bold text-base">
              <Download className="w-5 h-5 mr-2" />
              Save PDF
            </Button>
            <Button className="h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base shadow-lg shadow-primary/20">
              <Receipt className="w-5 h-5 mr-2" />
              New Transfer
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function DetailRow({ label, value, icon, mono }: { label: string, value: string, icon?: React.ReactNode, mono?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
      <span className={cn("font-bold text-white flex items-center gap-2 text-right", mono && "font-mono text-xs")}>
        {icon}
        {value}
      </span>
    </div>
  );
}
