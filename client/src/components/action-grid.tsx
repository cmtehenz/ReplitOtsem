import { ArrowUpRight, ArrowDownLeft, Plus, ArrowLeftRight, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import QRCode from "react-qr-code";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ActionGrid() {
  return (
    <div className="flex justify-between items-start px-2">
      <ActionButton 
        icon={Plus} 
        label="Deposit" 
        color="text-primary bg-primary/10" 
      />
      <ActionButton 
        icon={ArrowUpRight} 
        label="Send" 
        color="text-white bg-white/5" 
      />
      <ActionButton 
        icon={ArrowDownLeft} 
        label="Receive" 
        color="text-white bg-white/5" 
      />
      <ActionButton 
        icon={ArrowLeftRight} 
        label="Exchange" 
        color="text-white bg-white/5" 
      />
    </div>
  );
}

function ActionButton({ icon: Icon, label, color }: { icon: any, label: string, color: string }) {
  return (
    <button className="flex flex-col items-center gap-2 group">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform group-active:scale-95 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-xs font-medium text-muted-foreground group-hover:text-white transition-colors">
        {label}
      </span>
    </button>
  );
}
