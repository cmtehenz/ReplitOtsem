import { useState, useEffect } from "react";
import { ArrowLeft, ShieldCheck, Upload, Camera, FileCheck, Clock, CheckCircle2, AlertCircle, ChevronRight, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
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
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isPortuguese ? "Verificado" : "Verified"}
          </div>
        );
      case "in_review":
        return (
          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full text-xs font-medium">
            <Clock className="w-3.5 h-3.5" />
            {isPortuguese ? "Em Análise" : "In Review"}
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center gap-1.5 bg-red-50 text-red-600 px-2.5 py-1 rounded-full text-xs font-medium">
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setLocation("/profile")}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {isPortuguese ? "Verificação KYC" : "KYC Verification"}
          </h1>
          <div className="w-10 flex justify-end">{getStatusBadge()}</div>
        </div>

        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900">
                {isPortuguese ? "Verificação de Identidade" : "Identity Verification"}
              </h2>
              <p className="text-sm text-gray-500">
                {isApproved 
                  ? (isPortuguese ? "Sua conta está verificada!" : "Your account is verified!")
                  : isInReview
                    ? (isPortuguese ? "Seus documentos estão em análise" : "Your documents are under review")
                    : (isPortuguese ? "Verifique para aumentar limites" : "Verify to increase limits")
                }
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="text-center p-3 rounded-xl bg-gray-50">
              <p className="text-lg font-bold text-primary">R$ 50k</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                {isPortuguese ? "Limite Mensal" : "Monthly Limit"}
              </p>
            </div>
            <div className="text-center p-3 rounded-xl bg-gray-50">
              <p className="text-lg font-bold text-emerald-600">R$ 10k</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                {isPortuguese ? "Por Transação" : "Per Transaction"}
              </p>
            </div>
            <div className="text-center p-3 rounded-xl bg-gray-50">
              <p className="text-lg font-bold text-accent">24h</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                {isPortuguese ? "Aprovação" : "Approval"}
              </p>
            </div>
          </div>
        </div>

        {kyc?.status === "rejected" && kyc.rejectionReason && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-red-600">
                  {isPortuguese ? "Motivo da Rejeição" : "Rejection Reason"}
                </p>
                <p className="text-sm text-red-600/80 mt-1">
                  {kyc.rejectionReason}
                </p>
              </div>
            </div>
          </div>
        )}

        {!isApproved && !isInReview && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-1">
              {isPortuguese ? "Passos de Verificação" : "Verification Steps"}
            </h3>

            <div className="space-y-3">
              {steps.map((step, index) => {
                const status = getStepStatus(index);
                return (
                  <div
                    key={step.id}
                    className={cn(
                      "bg-white rounded-2xl p-4 card-shadow transition-all",
                      status === "current" && "ring-1 ring-primary/30"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                        status === "completed" 
                          ? "bg-emerald-50 text-emerald-600"
                          : status === "current"
                            ? "bg-primary/10 text-primary"
                            : "bg-gray-100 text-gray-400"
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
                          status === "completed" ? "text-emerald-600" : "text-gray-900"
                        )}>
                          {isPortuguese ? step.titlePt : step.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {isPortuguese ? step.descriptionPt : step.description}
                        </p>
                      </div>
                      {status === "current" && (
                        <Button
                          size="sm"
                          onClick={() => handleUpload(step.docKey)}
                          disabled={uploadMutation.isPending}
                          className="bg-primary hover:bg-primary/90 text-white text-xs h-8"
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
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!isApproved && !isInReview && (
          <div className="pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!allUploaded || submitMutation.isPending}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium"
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
            
            <p className="text-xs text-center text-gray-500 mt-4">
              {isPortuguese 
                ? "Seus dados são criptografados e protegidos" 
                : "Your data is encrypted and protected"}
            </p>
          </div>
        )}

        {isInReview && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 text-center">
            <Clock className="w-10 h-10 text-amber-500 mx-auto mb-4" />
            <h3 className="font-semibold text-lg text-gray-900 mb-2">
              {isPortuguese ? "Análise em Andamento" : "Review in Progress"}
            </h3>
            <p className="text-sm text-gray-600">
              {isPortuguese 
                ? "Seus documentos estão sendo analisados. Você será notificado quando o processo for concluído."
                : "Your documents are being reviewed. You'll be notified when the process is complete."}
            </p>
          </div>
        )}

        {isApproved && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
            <h3 className="font-semibold text-lg text-emerald-600 mb-2">
              {isPortuguese ? "Verificação Aprovada!" : "Verification Approved!"}
            </h3>
            <p className="text-sm text-gray-600">
              {isPortuguese 
                ? "Sua conta está totalmente verificada. Aproveite todos os recursos!"
                : "Your account is fully verified. Enjoy all features!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
