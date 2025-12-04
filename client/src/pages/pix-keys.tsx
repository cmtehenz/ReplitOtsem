import { motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Edit2, Copy, CreditCard, Mail, Smartphone, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

const initialKeys = [
  { id: 1, type: "CPF", key: "123.456.789-00", label: "My CPF" },
  { id: 2, type: "Email", key: "alex.morgan@example.com", label: "Main Email" },
  { id: 3, type: "Random", key: "a1b2-c3d4-e5f6-g7h8", label: "Random Key" },
];

export default function PixKeys() {
  const [, setLocation] = useLocation();
  const [keys, setKeys] = useState(initialKeys);

  const getTypeIcon = (type: string) => {
    switch(type) {
      case "CPF": return FileText;
      case "Email": return Mail;
      case "Phone": return Smartphone;
      default: return Copy;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button 
          onClick={() => setLocation("/profile")}
          className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 text-center pr-4">
          <h1 className="font-display font-bold text-lg">Manage Pix Keys</h1>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full space-y-6">
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
          <CreditCard className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-bold text-sm">Why register keys?</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Registering keys allows you to receive transfers instantly using simple identifiers like your email or phone number.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-medium text-muted-foreground text-sm uppercase tracking-wider">Your Keys</h2>
          
          <div className="space-y-3">
            {keys.map((item) => {
              const Icon = getTypeIcon(item.type);
              return (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-white/5 rounded-2xl p-4 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground font-mono">{item.key}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-white">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-muted-foreground hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Key FAB */}
      <div className="fixed bottom-8 right-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform">
              <Plus className="w-6 h-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-white/10">
            <DialogHeader>
              <DialogTitle>Register New Key</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
               <div className="grid grid-cols-3 gap-2">
                 {["CPF", "Email", "Phone", "Random"].map((type) => (
                   <button key={type} className="p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-primary/10 hover:border-primary/30 transition-colors text-sm font-medium">
                     {type}
                   </button>
                 ))}
               </div>
               <div className="space-y-2">
                 <label className="text-sm text-muted-foreground">Key Value</label>
                 <input 
                    type="text" 
                    placeholder="Enter key..." 
                    className="w-full bg-background border border-white/10 rounded-xl p-4 text-lg focus:outline-none focus:border-primary/50 transition-colors"
                  />
               </div>
               <Button className="w-full h-12 bg-primary text-primary-foreground">Register Key</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
