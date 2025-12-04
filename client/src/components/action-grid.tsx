import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, Wallet, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import QRCode from "react-qr-code";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ActionGrid() {
  return (
    <div className="grid grid-cols-3 gap-3 w-full">
      {/* Deposit Pix */}
      <Dialog>
        <DialogTrigger asChild>
          <button className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-card/50 border border-white/5 hover:bg-card hover:border-primary/20 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
              <span className="font-bold text-sm">Pix</span>
            </div>
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">Deposit BRL</span>
          </button>
        </DialogTrigger>
        <DialogContent className="bg-card border-white/10 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center font-display">Deposit BRL via Pix</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-6 py-6">
            <div className="bg-white p-4 rounded-xl">
              <QRCode 
                value="00020126330014BR.GOV.BCB.PIX0111user@email.com5204000053039865802BR5913User Name6008Brasilia62070503***63041234"
                size={200}
                level="M"
              />
            </div>
            <div className="space-y-2 text-center">
              <p className="text-sm text-muted-foreground">Scan or copy the Pix key below</p>
              <div className="flex items-center gap-2 bg-background p-3 rounded-lg border border-white/10">
                <code className="text-xs text-primary font-mono break-all">00020126330014BR.GOV.BCB.PIX0111...</code>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Wallet className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Button className="w-full bg-primary text-primary-foreground">Copy Pix Key</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deposit USDT */}
      <Dialog>
        <DialogTrigger asChild>
          <button className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-card/50 border border-white/5 hover:bg-card hover:border-primary/20 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#26A17B]/10 flex items-center justify-center text-[#26A17B] group-hover:scale-110 transition-transform duration-300">
              <span className="font-bold text-lg">T</span>
            </div>
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">Deposit USDT</span>
          </button>
        </DialogTrigger>
        <DialogContent className="bg-card border-white/10 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center font-display">Deposit USDT</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="trc20" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-6 bg-background/50">
              <TabsTrigger value="trc20">TRC20 (Tron)</TabsTrigger>
              <TabsTrigger value="erc20">ERC20 (Eth)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="trc20" className="flex flex-col items-center space-y-6">
              <div className="bg-white p-4 rounded-xl">
                <QRCode value="TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t" size={200} level="M" />
              </div>
              <div className="w-full space-y-2">
                <label className="text-xs text-muted-foreground ml-1">Your TRC20 Address</label>
                <div className="flex items-center gap-2 bg-background p-3 rounded-lg border border-white/10">
                  <code className="text-xs text-primary font-mono truncate">TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t</code>
                </div>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg w-full">
                <p className="text-xs text-yellow-500 text-center">Only send USDT (TRC20) to this address. Other assets will be lost.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="erc20" className="flex flex-col items-center space-y-6">
              <div className="bg-white p-4 rounded-xl">
                <QRCode value="0x71C7656EC7ab88b098defB751B7401B5f6d8976F" size={200} level="M" />
              </div>
              <div className="w-full space-y-2">
                <label className="text-xs text-muted-foreground ml-1">Your ERC20 Address</label>
                <div className="flex items-center gap-2 bg-background p-3 rounded-lg border border-white/10">
                  <code className="text-xs text-primary font-mono truncate">0x71C7656EC7ab88b098defB751B7401B5f6d8976F</code>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Withdraw / Send */}
      <Dialog>
        <DialogTrigger asChild>
          <button className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-card/50 border border-white/5 hover:bg-card hover:border-primary/20 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">Withdraw</span>
          </button>
        </DialogTrigger>
        <DialogContent className="bg-card border-white/10 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center font-display">Withdraw</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="pix" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-6 bg-background/50">
              <TabsTrigger value="pix">BRL (Pix)</TabsTrigger>
              <TabsTrigger value="crypto">USDT (Crypto)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pix" className="space-y-4">
               <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Pix Key</label>
                <input 
                  type="text" 
                  placeholder="CPF, Email, or Phone" 
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
                <p className="text-xs text-right text-muted-foreground">Available: R$ 4.250,00</p>
              </div>
              <Button className="w-full h-12 bg-primary text-primary-foreground mt-4">Confirm Withdrawal</Button>
            </TabsContent>
            
            <TabsContent value="crypto" className="space-y-4">
               <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Wallet Address</label>
                <input 
                  type="text" 
                  placeholder="Paste TRC20 Address" 
                  className="w-full bg-background border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-primary/50 transition-colors font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Amount (USDT)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#26A17B] font-bold text-xs">USDT</span>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    className="w-full bg-background border border-white/10 rounded-xl p-4 pl-14 text-lg focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <p className="text-xs text-right text-muted-foreground">Available: 1,420.00 USDT</p>
              </div>
              <Button className="w-full h-12 bg-primary text-primary-foreground mt-4">Preview Transfer</Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
