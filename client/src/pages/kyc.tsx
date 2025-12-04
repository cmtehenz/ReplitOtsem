import { useState, useEffect } from "react";
import { PageContainer } from "@/components/page-container";
import { ArrowLeft, ShieldCheck, Upload, Camera, FileCheck, Clock, CheckCircle2, AlertCircle, ChevronRight, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getKyc, updateKyc, submitKyc, type KycSubmission } from "@/lib/api";

interface VerificationStep {
  id: string;
  title: string;
  titlePt: string;
  description: string;
  descriptionPt: string;
  icon: any;
  docKey: "id_front" | "id_back" | "selfie";
}

export default function KYCVerification() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const isPortuguese = t("nav.home") === "Início";
  
  const [currentStep, setCurrentStep] = useState(0);

  const { data: kyc, isLoading } = useQuery({
    queryKey: ["kyc"],
    queryFn: getKyc,
  });

  const uploadMutation = useMutation({
    mutationFn: (step: "id_front" | "id_back" | "selfie") => updateKyc(step),
    onSuccess: (data) => {
      queryClient.setQueryData(["kyc"], data);
      toast.success(isPortuguese ? "Documento enviado!" : "Document uploaded!");
    },
    onError: () => {
      toast.error(isPortuguese ? "Erro ao enviar" : "Upload failed");
    },
  });

  const submitMutation = useMutation({
    mutationFn: submitKyc,
    onSuccess: (data) => {
      queryClient.setQueryData(["kyc"], data);
      toast.success(isPortuguese 
        ? "Verificação enviada! Você será notificado em até 24h." 
        : "Verification submitted! You'll be notified within 24h."
      );
      setLocation("/profile");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (kyc) {
      if (kyc.idFrontUploaded && kyc.idBackUploaded && kyc.selfieUploaded) {
        setCurrentStep(3);
      } else if (kyc.idBackUploaded) {
        setCurrentStep(2);
      } else if (kyc.idFrontUploaded) {
        setCurrentStep(1);
      }
    }
  }, [kyc]);

  const steps: VerificationStep[] = [
    {
      id: "id_front",
      title: "ID Document (Front)",
      titlePt: "Documento (Frente)",
      description: "Upload the front of your ID or passport",
      descriptionPt: "Envie a frente do seu RG ou CNH",
      icon: Upload,
      docKey: "id_front",
    },
    {
      id: "id_back",
      title: "ID Document (Back)",
      titlePt: "Documento (Verso)",
      description: "Upload the back of your ID",
      descriptionPt: "Envie o verso do seu documento",
      icon: Upload,
      docKey: "id_back",
    },
    {
      id: "selfie",
      title: "Selfie Verification",
      titlePt: "Verificação por Selfie",
      description: "Take a selfie holding your ID",
      descriptionPt: "Tire uma selfie segurando seu documento",
      icon: Camera,
      docKey: "selfie",
    },
  ];

  const getStepStatus = (index: number): "pending" | "completed" | "current" => {
    if (!kyc) return index === 0 ? "current" : "pending";
    
    const uploaded = [kyc.idFrontUploaded, kyc.idBackUploaded, kyc.selfieUploaded];
    if (uploaded[index]) return "completed";
    if (index === currentStep) return "current";
    return "pending";
  };

  const handleUpload = (docType: "id_front" | "id_back" | "selfie") => {
    uploadMutation.mutate(docType);
    if (docType === "id_front") setCurrentStep(1);
    else if (docType === "id_back") setCurrentStep(2);
    else if (docType === "selfie") setCurrentStep(3);
  };

  const handleSubmit = () => {
    if (!kyc?.idFrontUploaded || !kyc?.idBackUploaded || !kyc?.selfieUploaded) {
      toast.error(isPortuguese ? "Complete todos os passos" : "Complete all steps");
      return;
    }
    submitMutation.mutate();
  };

  const getStatusBadge = () => {
    if (!kyc) return null;
    
    switch (kyc.status) {
      case "approved":
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

  const allUploaded = kyc?.idFrontUploaded && kyc?.idBackUploaded && kyc?.selfieUploaded;
  const isInReview = kyc?.status === "in_review";
  const isApproved = kyc?.status === "approved";

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

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
                {isApproved 
                  ? (isPortuguese ? "Sua conta está verificada!" : "Your account is verified!")
                  : isInReview
                    ? (isPortuguese ? "Seus documentos estão em análise" : "Your documents are under review")
                    : (isPortuguese ? "Verifique sua identidade para aumentar seus limites" : "Verify your identity to increase your limits")
                }
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

        {kyc?.status === "rejected" && kyc.rejectionReason && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="premium-card rounded-2xl p-4 border-red-500/30 bg-red-500/5"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-red-400">
                  {isPortuguese ? "Motivo da Rejeição" : "Rejection Reason"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {kyc.rejectionReason}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {!isApproved && !isInReview && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground/80 uppercase tracking-wider">
              {isPortuguese ? "Passos de Verificação" : "Verification Steps"}
            </h3>

            <div className="space-y-3">
              {steps.map((step, index) => {
                const status = getStepStatus(index);
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "premium-card rounded-2xl p-4 transition-all",
                      status === "current" && "border-primary/30 bg-primary/5"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center border transition-all",
                        status === "completed" 
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : status === "current"
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "bg-white/[0.04] border-white/[0.08] text-muted-foreground"
                      )}>
                        {status === "completed" ? (
                          <FileCheck className="w-5 h-5" />
                        ) : (
                          <step.icon className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={cn(
                          "font-medium text-sm",
                          status === "completed" && "text-emerald-400"
                        )}>
                          {isPortuguese ? step.titlePt : step.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isPortuguese ? step.descriptionPt : step.description}
                        </p>
                      </div>
                      {status === "current" && (
                        <Button
                          size="sm"
                          onClick={() => handleUpload(step.docKey)}
                          disabled={uploadMutation.isPending}
                          className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-xs"
                          data-testid={`button-upload-step-${index}`}
                        >
                          {uploadMutation.isPending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5 mr-1" />
                              {isPortuguese ? "Enviar" : "Upload"}
                            </>
                          )}
                        </Button>
                      )}
                      {status === "completed" && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {!isApproved && !isInReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="pt-4"
          >
            <Button
              onClick={handleSubmit}
              disabled={!allUploaded || submitMutation.isPending}
              className="w-full h-14 rounded-2xl premium-button text-base"
              data-testid="button-submit-kyc"
            >
              {submitMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isPortuguese ? "Enviar para Verificação" : "Submit for Verification"}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground mt-4">
              {isPortuguese 
                ? "Seus dados são criptografados e protegidos" 
                : "Your data is encrypted and protected"}
            </p>
          </motion.div>
        )}

        {isInReview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="premium-card rounded-3xl p-6 text-center"
          >
            <Clock className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              {isPortuguese ? "Análise em Andamento" : "Review in Progress"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isPortuguese 
                ? "Seus documentos estão sendo analisados. Você será notificado quando o processo for concluído."
                : "Your documents are being reviewed. You'll be notified when the process is complete."}
            </p>
          </motion.div>
        )}

        {isApproved && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="premium-card rounded-3xl p-6 text-center border-emerald-500/30"
          >
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2 text-emerald-400">
              {isPortuguese ? "Verificação Aprovada!" : "Verification Approved!"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isPortuguese 
                ? "Sua conta está totalmente verificada. Aproveite todos os recursos!"
                : "Your account is fully verified. Enjoy all features!"}
            </p>
          </motion.div>
        )}
      </div>
    </PageContainer>
  );
}
