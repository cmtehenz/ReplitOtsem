import { PageContainer } from "@/components/page-container";
import { ArrowLeft, Plus, Trash2, Copy, CreditCard, Mail, Smartphone, FileText, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const initialKeys = [
  { id: 1, type: "CPF", key: "123.456.789-00", label: "My CPF" },
  { id: 2, type: "Email", key: "alex.morgan@example.com", label: "Main Email" },
  { id: 3, type: "Random", key: "a1b2-c3d4-e5f6-g7h8", label: "Random Key" },
];

export default function PixKeys() {
  const [, setLocation] = useLocation();
  const [keys, setKeys] = useState(initialKeys);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const getTypeIcon = (type: string) => {
    switch(type) {
      case "CPF": return FileText;
      case "Email": return Mail;
      case "Phone": return Smartphone;
      default: return Copy;
    }
  };

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <PageContainer>
      <div className="p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 sticky top-0 z-10 bg-background/50 backdrop-blur-xl p-4 -m-4 border-b border-white/5">
          <button 
            onClick={() => setLocation("/profile")}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 hover:border-primary/30"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-bold text-lg tracking-wide">Pix Keys</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-primary/20 to-background border border-primary/20 rounded-3xl p-5 flex items-start gap-4 shadow-[0_0_20px_rgba(139,92,246,0.1)]">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 text-primary">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm font-display">Why register keys?</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Registering keys allows you to receive transfers instantly using simple identifiers like your email or phone number.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="font-bold text-muted-foreground text-xs uppercase tracking-widest px-1">Your Registered Keys</h2>
            
            <div className="space-y-3">
              <AnimatePresence>
                {keys.map((item) => {
                  const Icon = getTypeIcon(item.type);
                  return (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      layout
                      className="glass-card rounded-2xl p-4 flex items-center justify-between group hover:bg-white/5 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-primary/20 transition-colors">
                          <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <p className="font-bold text-sm font-display">{item.label}</p>
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">{item.key}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleCopy(item.id, item.key)}
                          className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-xl transition-colors text-muted-foreground hover:text-white"
                        >
                          {copiedId === item.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button className="w-9 h-9 flex items-center justify-center hover:bg-red-500/10 rounded-xl transition-colors text-muted-foreground hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Add Key FAB */}
        <div className="fixed bottom-8 right-6 z-20">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-[#7c3aed] text-primary-foreground shadow-[0_0_40px_rgba(139,92,246,0.5)] hover:shadow-[0_0_50px_rgba(139,92,246,0.7)] hover:scale-110 transition-all active:scale-95 border-4 border-background">
                <Plus className="w-10 h-10" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-white/10 rounded-3xl sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-center font-display text-2xl">Register New Key</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                 <div className="grid grid-cols-2 gap-4">
                   {["CPF", "Email", "Phone", "Random"].map((type) => (
                     <button key={type} className="p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-primary/15 hover:border-primary/40 transition-all text-base font-bold active:scale-95">
                       {type}
                     </button>
                   ))}
                 </div>
                 <div className="space-y-3">
                   <label className="text-base text-muted-foreground font-bold ml-1">Key Value</label>
                   <input 
                      type="text" 
                      placeholder="Enter key..." 
                      className="w-full bg-background/50 border border-white/10 rounded-2xl p-5 text-lg focus:outline-none focus:border-primary/50 focus:bg-background/70 transition-all font-medium"
                    />
                 </div>
                 <Button className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-[#7c3aed] text-white text-lg font-bold hover:shadow-lg hover:shadow-primary/30 shadow-primary/20 active:scale-95">
                   Register Key
                 </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </PageContainer>
  );
}
