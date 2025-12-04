import { motion } from "framer-motion";
import { ArrowLeft, Share2, CheckCircle2, Copy, ArrowUpRight, ArrowDownLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function TransactionDetails() {
  const [, setLocation] = useLocation();
  
  return (
    <div className="min-h-screen bg-background text-foreground p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button 
          onClick={() => setLocation("/activity")}
          className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 text-center pr-4">
          <h1 className="font-display font-bold text-lg">Transaction Details</h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center max-w-md mx-auto w-full space-y-8">
        
        {/* Status Icon */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-500">Transfer Successful</h2>
            <p className="text-muted-foreground text-sm mt-1">Feb 24, 2025 at 14:30</p>
          </div>
        </div>

        {/* Amount */}
        <div className="text-center space-y-1">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Total Amount</p>
          <h3 className="text-4xl font-display font-bold">R$ 150,00</h3>
        </div>

        {/* Details Card */}
        <div className="w-full bg-card border border-white/5 rounded-2xl p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Type</span>
              <span className="font-medium flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-red-400" />
                Pix Sent
              </span>
            </div>
            <div className="w-full h-px bg-white/5" />
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Recipient</span>
              <span className="font-medium">João Silva</span>
            </div>
            <div className="w-full h-px bg-white/5" />
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pix Key</span>
              <span className="font-medium text-xs font-mono">joao.silva@email.com</span>
            </div>
            <div className="w-full h-px bg-white/5" />
            
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Transaction ID</span>
              <div className="flex items-center justify-between bg-background/50 p-3 rounded-lg border border-white/5">
                <code className="text-xs text-primary font-mono break-all mr-2">E00000000202502241430...</code>
                <button className="p-1 hover:bg-white/10 rounded transition-colors">
                  <Copy className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <Button variant="outline" className="h-12 border-white/10 hover:bg-white/5">
            <Download className="w-4 h-4 mr-2" />
            Save PDF
          </Button>
          <Button className="h-12 bg-primary text-primary-foreground hover:bg-primary/90">
            <Share2 className="w-4 h-4 mr-2" />
            Share Receipt
          </Button>
        </div>
      </div>
    </div>
  );
}
