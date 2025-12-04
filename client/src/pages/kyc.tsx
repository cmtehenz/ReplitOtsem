import { useState } from "react";
import { PageContainer } from "@/components/page-container";
import { ArrowLeft, ShieldCheck, Upload, Camera, FileCheck, Clock, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type VerificationStatus = "not_started" | "pending" | "in_review" | "verified" | "rejected";

interface VerificationStep {
  id: string;
  title: string;
  titlePt: string;
  description: string;
  descriptionPt: string;
  icon: any;
  status: "pending" | "completed" | "current";
}

export default function KYCVerification() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const isPortuguese = t("nav.home") === "Início";
  
  const [verificationStatus] = useState<VerificationStatus>("not_started");
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedDocs, setUploadedDocs] = useState({
    idFront: false,
    idBack: false,
    selfie: false,
  });

  const steps: VerificationStep[] = [
    {
      id: "id_front",
      title: "ID Document (Front)",
      titlePt: "Documento (Frente)",
      description: "Upload the front of your ID or passport",
      descriptionPt: "Envie a frente do seu RG ou CNH",
      icon: Upload,
      status: uploadedDocs.idFront ? "completed" : currentStep === 0 ? "current" : "pending",
    },
    {
      id: "id_back",
      title: "ID Document (Back)",
      titlePt: "Documento (Verso)",
      description: "Upload the back of your ID",
      descriptionPt: "Envie o verso do seu documento",
      icon: Upload,
      status: uploadedDocs.idBack ? "completed" : currentStep === 1 ? "current" : "pending",
    },
    {
      id: "selfie",
      title: "Selfie Verification",
      titlePt: "Verificação por Selfie",
      description: "Take a selfie holding your ID",
      descriptionPt: "Tire uma selfie segurando seu documento",
      icon: Camera,
      status: uploadedDocs.selfie ? "completed" : currentStep === 2 ? "current" : "pending",
    },
  ];

  const handleUpload = (docType: keyof typeof uploadedDocs) => {
    setUploadedDocs(prev => ({ ...prev, [docType]: true }));
    toast.success(isPortuguese ? "Documento enviado!" : "Document uploaded!");
    
    if (docType === "idFront") setCurrentStep(1);
    else if (docType === "idBack") setCurrentStep(2);
    else if (docType === "selfie") {
      toast.success(isPortuguese 
        ? "Documentos enviados! Análise em andamento." 
        : "Documents submitted! Review in progress."
      );
    }
  };

  const handleSubmit = () => {
    if (!uploadedDocs.idFront || !uploadedDocs.idBack || !uploadedDocs.selfie) {
      toast.error(isPortuguese ? "Complete todos os passos" : "Complete all steps");
      return;
    }
    toast.success(isPortuguese 
      ? "Verificação enviada! Você será notificado em até 24h." 
      : "Verification submitted! You'll be notified within 24h."
    );
    setLocation("/profile");
  };

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case "verified":
        return (
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full text-xs font-medium border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isPortuguese ? "Verificado" : "Verified"}
          </div>
        );
      case "in_review":
        return (
          <div className="flex items-center gap-2 bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-full text-xs font-medium border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            {isPortuguese ? "Em Análise" : "In Review"}
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center gap-2 bg-red-500/10 text-red-400 px-3 py-1.5 rounded-full text-xs font-medium border border-red-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            {isPortuguese ? "Rejeitado" : "Rejected"}
          </div>
        );
      default:
        return null;
    }
  };

  const allUploaded = uploadedDocs.idFront && uploadedDocs.idBack && uploadedDocs.selfie;

  return (
    <PageContainer>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setLocation("/profile")}
            className="w-10 h-10 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-all border border-white/[0.06]"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-bold text-lg tracking-wide">
            {isPortuguese ? "Verificação KYC" : "KYC Verification"}
          </h1>
          <div className="w-10">{getStatusBadge()}</div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card rounded-3xl p-6 space-y-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/20">
              <ShieldCheck className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-lg">
                {isPortuguese ? "Verificação de Identidade" : "Identity Verification"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isPortuguese 
                  ? "Verifique sua identidade para aumentar seus limites" 
                  : "Verify your identity to increase your limits"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="text-center p-3 rounded-xl bg-white/[0.03]">
              <p className="text-lg font-bold text-primary">R$ 50k</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {isPortuguese ? "Limite Mensal" : "Monthly Limit"}
              </p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/[0.03]">
              <p className="text-lg font-bold text-emerald-400">R$ 10k</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {isPortuguese ? "Por Transação" : "Per Transaction"}
              </p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/[0.03]">
              <p className="text-lg font-bold text-accent">24h</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {isPortuguese ? "Aprovação" : "Approval"}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground/80 uppercase tracking-wider">
            {isPortuguese ? "Passos de Verificação" : "Verification Steps"}
          </h3>

          <div className="space-y-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "premium-card rounded-2xl p-4 transition-all",
                  step.status === "current" && "border-primary/30 bg-primary/5"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center border transition-all",
                    step.status === "completed" 
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : step.status === "current"
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-white/[0.04] border-white/[0.08] text-muted-foreground"
                  )}>
                    {step.status === "completed" ? (
                      <FileCheck className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      "font-medium text-sm",
                      step.status === "completed" && "text-emerald-400"
                    )}>
                      {isPortuguese ? step.titlePt : step.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isPortuguese ? step.descriptionPt : step.description}
                    </p>
                  </div>
                  {step.status === "current" && (
                    <Button
                      size="sm"
                      onClick={() => handleUpload(
                        index === 0 ? "idFront" : index === 1 ? "idBack" : "selfie"
                      )}
                      className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-xs"
                      data-testid={`button-upload-step-${index}`}
                    >
                      <Upload className="w-3.5 h-3.5 mr-1" />
                      {isPortuguese ? "Enviar" : "Upload"}
                    </Button>
                  )}
                  {step.status === "completed" && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-4"
        >
          <Button
            onClick={handleSubmit}
            disabled={!allUploaded}
            className="w-full h-14 rounded-2xl premium-button text-base"
            data-testid="button-submit-kyc"
          >
            {isPortuguese ? "Enviar para Verificação" : "Submit for Verification"}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
          
          <p className="text-xs text-center text-muted-foreground mt-4">
            {isPortuguese 
              ? "Seus dados são criptografados e protegidos" 
              : "Your data is encrypted and protected"}
          </p>
        </motion.div>
      </div>
    </PageContainer>
  );
}
