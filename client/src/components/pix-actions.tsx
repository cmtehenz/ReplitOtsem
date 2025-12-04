import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, RefreshCw, CreditCard, Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import QRCode from "react-qr-code";

interface ActionButtonsProps {
  onSend?: () => void;
  onReceive?: () => void;
}

export function ActionButtons({ onSend, onReceive }: ActionButtonsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToExchange = () => {
    const element = document.getElementById('exchange-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="grid grid-cols-4 gap-3 w-full max-w-md mx-auto">
      <Dialog>
        <DialogTrigger asChild>
          <div className="flex flex-col items-center gap-2 group cursor-pointer">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 border border-primary/20">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">Pix Send</span>
          </div>
        </DialogTrigger>
        <DialogContent className="bg-card border-white/10 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-display">Send Pix</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Chave Pix (CPF, Email, Phone)</label>
              <input 
                type="text" 
                placeholder="user@example.com" 
                className="w-full bg-background border border-white/10 rounded-xl p-4 text-lg focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Amount (BRL)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  className="w-full bg-background border border-white/10 rounded-xl p-4 pl-10 text-lg focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>
            <Button className="w-full h-12 text-lg bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl">
              Confirm Transfer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <div className="flex flex-col items-center gap-2 group cursor-pointer">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 border border-primary/20">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">Pix Receive</span>
          </div>
        </DialogTrigger>
        <DialogContent className="bg-card border-white/10 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-display">Receive Pix</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-6 py-6">
            <div className="bg-white p-4 rounded-xl">
              <QRCode 
                value="00020126330014BR.GOV.BCB.PIX0111user@email.com5204000053039865802BR5913User Name6008Brasilia62070503***63041234"
                size={200}
                level="M"
              />
            </div>
            <p className="text-center text-sm text-muted-foreground max-w-[200px]">
              Scan this QR code to receive payments instantly via Pix.
            </p>
            <div className="w-full flex gap-2">
              <Button variant="outline" className="flex-1 h-12 border-white/10 hover:bg-white/5 hover:text-white">
                Copy Key
              </Button>
              <Button className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90">
                Share
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div 
        className="flex flex-col items-center gap-2 group cursor-pointer"
        onClick={scrollToExchange}
      >
        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-white group-hover:bg-white/20 transition-all duration-300 border border-white/5">
          <RefreshCw className="w-6 h-6" />
        </div>
        <span className="text-xs font-medium text-muted-foreground group-hover:text-white transition-colors">Swap</span>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <div className="flex flex-col items-center gap-2 group cursor-pointer">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-white group-hover:bg-white/20 transition-all duration-300 border border-white/5">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-muted-foreground group-hover:text-white transition-colors">Top Up</span>
          </div>
        </DialogTrigger>
        <DialogContent className="bg-card border-white/10 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center font-display">Top Up Wallet</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <button className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-card/50 border border-white/5 hover:bg-card hover:border-primary/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="font-bold text-sm">Pix</span>
              </div>
              <span className="text-sm font-medium">Deposit BRL</span>
            </button>
            <button className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-card/50 border border-white/5 hover:bg-card hover:border-primary/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#26A17B]/10 flex items-center justify-center text-[#26A17B]">
                <span className="font-bold text-lg">T</span>
              </div>
              <span className="text-sm font-medium">Deposit USDT</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
