import { PageContainer } from "@/components/page-container";
import { ArrowLeft, Plus, Trash2, Copy, CreditCard, Mail, Smartphone, FileText, Check, Hash, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPixKeys, addPixKey, deletePixKey, type PixKey } from "@/lib/api";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

export default function PixKeys() {
  const [, setLocation] = useLocation();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newKeyType, setNewKeyType] = useState<"cpf" | "cnpj" | "email" | "phone" | "random">("cpf");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [newKeyName, setNewKeyName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const { data: keys, isLoading } = useQuery({
    queryKey: ["pix-keys"],
    queryFn: getPixKeys,
  });

  const addMutation = useMutation({
    mutationFn: addPixKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pix-keys"] });
      toast.success(t("pixKeys.addSuccess"));
      setNewKeyValue("");
      setNewKeyName("");
      setDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add PIX key");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePixKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pix-keys"] });
      toast.success(t("pixKeys.deleteSuccess"));
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove PIX key");
    },
  });

  const getTypeIcon = (type: string) => {
    switch(type) {
      case "cpf": return FileText;
      case "cnpj": return FileText;
      case "email": return Mail;
      case "phone": return Smartphone;
      case "random": return Hash;
      default: return Copy;
    }
  };

  const getTypeLabel = (type: string) => {
    switch(type) {
      case "cpf": return "CPF";
      case "cnpj": return "CNPJ";
      case "email": return "Email";
      case "phone": return "Phone";
      case "random": return "Random";
      default: return type;
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddKey = () => {
    if (!newKeyValue.trim()) {
      toast.error(t("pixKeys.enterValue"));
      return;
    }
    addMutation.mutate({
      keyType: newKeyType,
      keyValue: newKeyValue,
      name: newKeyName || undefined,
    });
  };

  const formatKeyValue = (value: string, type: string) => {
    if (type === "cpf") {
      const numbers = value.replace(/\D/g, "");
      if (numbers.length <= 11) {
        return numbers
          .replace(/(\d{3})(\d)/, "$1.$2")
          .replace(/(\d{3})(\d)/, "$1.$2")
          .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      }
    } else if (type === "phone") {
      const numbers = value.replace(/\D/g, "");
      if (numbers.length <= 11) {
        return numbers
          .replace(/(\d{2})(\d)/, "($1) $2")
          .replace(/(\d{5})(\d)/, "$1-$2");
      }
    }
    return value;
  };

  return (
    <PageContainer>
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-8 sticky top-0 z-10 bg-background/50 backdrop-blur-xl p-4 -m-4 border-b border-white/5">
          <button 
            onClick={() => setLocation("/profile")}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 hover:border-primary/30"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-bold text-lg tracking-wide">{t("profile.pixKeys")}</h1>
          <div className="w-10" />
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-primary/20 to-background border border-primary/20 rounded-3xl p-5 flex items-start gap-4 shadow-[0_0_20px_rgba(139,92,246,0.1)]">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 text-primary">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm font-display">{t("pixKeys.whyRegister")}</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {t("pixKeys.whyRegisterDesc")}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="font-bold text-muted-foreground text-xs uppercase tracking-widest px-1">{t("pixKeys.yourKeys")}</h2>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : keys?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">{t("pixKeys.noKeys")}</p>
                <p className="text-xs mt-1">{t("pixKeys.noKeysDesc")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {keys?.map((item) => {
                    const Icon = getTypeIcon(item.keyType);
                    return (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        layout
                        className="glass-card rounded-2xl p-4 flex items-center justify-between group hover:bg-white/5 transition-all duration-300"
                        data-testid={`pix-key-${item.id}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-primary/20 transition-colors">
                            <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <div>
                            <p className="font-bold text-sm font-display">{item.name || getTypeLabel(item.keyType)}</p>
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">{item.keyValue}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleCopy(item.id, item.keyValue)}
                            className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-xl transition-colors text-muted-foreground hover:text-white"
                            data-testid={`button-copy-${item.id}`}
                          >
                            {copiedId === item.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => deleteMutation.mutate(item.id)}
                            disabled={deleteMutation.isPending}
                            className="w-9 h-9 flex items-center justify-center hover:bg-red-500/10 rounded-xl transition-colors text-muted-foreground hover:text-red-400 disabled:opacity-50"
                            data-testid={`button-delete-${item.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        <div className="fixed bottom-8 right-6 z-20">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-[#7c3aed] text-primary-foreground shadow-[0_0_40px_rgba(139,92,246,0.5)] hover:shadow-[0_0_50px_rgba(139,92,246,0.7)] hover:scale-110 transition-all active:scale-95 border-4 border-background"
                data-testid="button-add-key"
              >
                <Plus className="w-10 h-10" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-white/10 rounded-3xl sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-center font-display text-2xl">{t("pixKeys.registerNew")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  {(["cpf", "email", "phone", "random"] as const).map((type) => (
                    <button 
                      key={type} 
                      onClick={() => setNewKeyType(type)}
                      className={cn(
                        "p-5 rounded-2xl border transition-all text-base font-bold active:scale-95",
                        newKeyType === type 
                          ? "bg-primary/20 border-primary/40 text-primary" 
                          : "border-white/10 bg-white/5 hover:bg-primary/15 hover:border-primary/40"
                      )}
                      data-testid={`button-type-${type}`}
                    >
                      {getTypeLabel(type)}
                    </button>
                  ))}
                </div>
                <div className="space-y-3">
                  <label className="text-base text-muted-foreground font-bold ml-1">{t("pixKeys.keyValue")}</label>
                  <input 
                    type="text" 
                    placeholder={
                      newKeyType === "cpf" ? "000.000.000-00" :
                      newKeyType === "email" ? "email@example.com" :
                      newKeyType === "phone" ? "(00) 00000-0000" :
                      "Random key"
                    }
                    value={newKeyValue}
                    onChange={(e) => setNewKeyValue(formatKeyValue(e.target.value, newKeyType))}
                    className="w-full bg-background/50 border border-white/10 rounded-2xl p-5 text-lg focus:outline-none focus:border-primary/50 focus:bg-background/70 transition-all font-medium"
                    data-testid="input-key-value"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-base text-muted-foreground font-bold ml-1">{t("pixKeys.keyName")}</label>
                  <input 
                    type="text" 
                    placeholder={t("pixKeys.keyNamePlaceholder")}
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full bg-background/50 border border-white/10 rounded-2xl p-5 text-lg focus:outline-none focus:border-primary/50 focus:bg-background/70 transition-all font-medium"
                    data-testid="input-key-name"
                  />
                </div>
                <Button 
                  onClick={handleAddKey}
                  disabled={addMutation.isPending}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-[#7c3aed] text-white text-lg font-bold hover:shadow-lg hover:shadow-primary/30 shadow-primary/20 active:scale-95"
                  data-testid="button-register-key"
                >
                  {addMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    t("pixKeys.registerButton")
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </PageContainer>
  );
}
