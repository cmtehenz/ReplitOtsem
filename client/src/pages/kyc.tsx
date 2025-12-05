import { PageContainer } from "@/components/page-container";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera, Upload, CheckCircle2, Loader2, ShieldCheck, ChevronRight, FileText, CreditCard, Car, X, Image, AlertCircle, Clock, Check } from "lucide-react";
import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";

type Step = "intro" | "select-document" | "upload-front" | "upload-back" | "selfie" | "review" | "pending" | "success";
type DocumentType = "passport" | "drivers_license" | "national_id";

const translations: Record<"en" | "pt-BR", Record<string, string>> = {
  en: {
    verification: "Verification",
    verifyIdentity: "Verify Identity",
    verifyDesc: "Increase your limits and unlock full features by verifying your identity. It only takes 2 minutes.",
    governmentId: "Government ID",
    governmentIdDesc: "Passport, Driver's License, or National ID",
    selfiePhoto: "Selfie Photo",
    selfieDesc: "To match your face with your ID",
    startVerification: "Start Verification",
    selectDocument: "Select Document Type",
    selectDocDesc: "Choose the type of document you want to use for verification",
    passport: "Passport",
    passportDesc: "International travel document",
    driversLicense: "Driver's License",
    driversLicenseDesc: "Valid driving permit",
    nationalId: "National ID",
    nationalIdDesc: "Government-issued ID card (RG/CPF)",
    uploadFront: "Document Front",
    uploadFrontDesc: "Take a clear photo of the front of your document",
    uploadBack: "Document Back",
    uploadBackDesc: "Take a clear photo of the back of your document",
    takePhoto: "Tap to take photo",
    uploadFile: "Upload file instead",
    retake: "Retake",
    continue: "Continue",
    takeSelfie: "Take a Selfie",
    selfieInstructions: "Position your face in the oval frame",
    capture: "Capture",
    verifying: "Verifying...",
    verifyingDesc: "We are securely analyzing your documents. This usually takes less than a minute.",
    pendingReview: "Under Review",
    pendingReviewDesc: "Your documents are being reviewed. This usually takes 1-2 business days.",
    estimatedTime: "Estimated completion",
    businessDays: "1-2 business days",
    verified: "Verified!",
    verifiedDesc: "Your identity has been successfully verified.",
    newDailyLimit: "New Daily Limit",
    upgraded: "UPGRADED",
    backToProfile: "Back to Profile",
    tips: "Tips for a good photo",
    tip1: "Good lighting, no shadows",
    tip2: "All corners visible",
    tip3: "No blur or glare",
    documentUploaded: "Document uploaded",
  },
  "pt-BR": {
    verification: "Verificação",
    verifyIdentity: "Verificar Identidade",
    verifyDesc: "Aumente seus limites e desbloqueie todos os recursos verificando sua identidade. Leva apenas 2 minutos.",
    governmentId: "Documento de Identidade",
    governmentIdDesc: "Passaporte, CNH ou RG",
    selfiePhoto: "Foto Selfie",
    selfieDesc: "Para comparar seu rosto com o documento",
    startVerification: "Iniciar Verificação",
    selectDocument: "Selecione o Documento",
    selectDocDesc: "Escolha o tipo de documento que deseja usar para verificação",
    passport: "Passaporte",
    passportDesc: "Documento de viagem internacional",
    driversLicense: "CNH",
    driversLicenseDesc: "Carteira Nacional de Habilitação",
    nationalId: "RG",
    nationalIdDesc: "Registro Geral / CPF",
    uploadFront: "Frente do Documento",
    uploadFrontDesc: "Tire uma foto clara da frente do seu documento",
    uploadBack: "Verso do Documento",
    uploadBackDesc: "Tire uma foto clara do verso do seu documento",
    takePhoto: "Toque para tirar foto",
    uploadFile: "Enviar arquivo",
    retake: "Tirar novamente",
    continue: "Continuar",
    takeSelfie: "Tire uma Selfie",
    selfieInstructions: "Posicione seu rosto no quadro oval",
    capture: "Capturar",
    verifying: "Verificando...",
    verifyingDesc: "Estamos analisando seus documentos com segurança. Isso geralmente leva menos de um minuto.",
    pendingReview: "Em Análise",
    pendingReviewDesc: "Seus documentos estão sendo revisados. Isso geralmente leva 1-2 dias úteis.",
    estimatedTime: "Tempo estimado",
    businessDays: "1-2 dias úteis",
    verified: "Verificado!",
    verifiedDesc: "Sua identidade foi verificada com sucesso.",
    newDailyLimit: "Novo Limite Diário",
    upgraded: "ATUALIZADO",
    backToProfile: "Voltar ao Perfil",
    tips: "Dicas para uma boa foto",
    tip1: "Boa iluminação, sem sombras",
    tip2: "Todas as bordas visíveis",
    tip3: "Sem borrões ou reflexos",
    documentUploaded: "Documento enviado",
  },
};

export default function KYCVerification() {
  const [step, setStep] = useState<Step>("intro");
  const [, setLocation] = useLocation();
  const [documentType, setDocumentType] = useState<DocumentType | null>(null);
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { language } = useLanguage();
  const t = translations[language as "en" | "pt-BR"] || translations.en;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "front" | "back" | "selfie") => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (type === "front") {
          setFrontImage(result);
          toast.success(t.documentUploaded);
        } else if (type === "back") {
          setBackImage(result);
          toast.success(t.documentUploaded);
        } else {
          setSelfieImage(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSimulatedCapture = (type: "front" | "back" | "selfie") => {
    setIsUploading(true);
    setTimeout(() => {
      const placeholderImage = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="%23374151" width="400" height="300"/><text fill="%239CA3AF" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="16">Document Captured</text></svg>`;
      if (type === "front") {
        setFrontImage(placeholderImage);
      } else if (type === "back") {
        setBackImage(placeholderImage);
      } else {
        setSelfieImage(placeholderImage);
      }
      setIsUploading(false);
      toast.success(t.documentUploaded);
    }, 1500);
  };

  const handleNext = () => {
    if (step === "upload-front") {
      if (documentType === "passport") {
        setStep("selfie");
      } else {
        setStep("upload-back");
      }
    } else if (step === "upload-back") {
      setStep("selfie");
    } else if (step === "selfie") {
      setStep("review");
    } else if (step === "review") {
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        setStep("pending");
      }, 2000);
    }
  };

  const getBackButton = () => {
    switch (step) {
      case "intro": return () => setLocation("/profile");
      case "select-document": return () => setStep("intro");
      case "upload-front": return () => setStep("select-document");
      case "upload-back": return () => setStep("upload-front");
      case "selfie": return () => documentType === "passport" ? setStep("upload-front") : setStep("upload-back");
      case "review": return () => setStep("selfie");
      default: return undefined;
    }
  };

  return (
    <PageContainer>
      <div className="p-6 flex flex-col h-full min-h-[80vh]">
        {step !== "success" && step !== "pending" && (
          <div className="flex items-center justify-between mb-8 sticky top-0 z-10 bg-background/50 backdrop-blur-xl p-4 -m-4 border-b border-white/5">
            {getBackButton() && (
              <button 
                onClick={getBackButton()}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 hover:border-primary/30"
                data-testid="button-back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            {!getBackButton() && <div className="w-10" />}
            
            <h1 className="font-display font-bold text-lg tracking-wide">{t.verification}</h1>
            <div className="w-10" />
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === "intro" && (
            <IntroStep key="intro" t={t} onNext={() => setStep("select-document")} />
          )}
          
          {step === "select-document" && (
            <SelectDocumentStep 
              key="select" 
              t={t} 
              onSelect={(type) => {
                setDocumentType(type);
                setStep("upload-front");
              }} 
            />
          )}

          {step === "upload-front" && (
            <UploadDocumentStep
              key="front"
              t={t}
              title={t.uploadFront}
              description={t.uploadFrontDesc}
              image={frontImage}
              isUploading={isUploading}
              onCapture={() => handleSimulatedCapture("front")}
              onUpload={(e) => handleFileUpload(e, "front")}
              onRetake={() => setFrontImage(null)}
              onNext={handleNext}
              fileInputRef={fileInputRef}
            />
          )}

          {step === "upload-back" && (
            <UploadDocumentStep
              key="back"
              t={t}
              title={t.uploadBack}
              description={t.uploadBackDesc}
              image={backImage}
              isUploading={isUploading}
              onCapture={() => handleSimulatedCapture("back")}
              onUpload={(e) => handleFileUpload(e, "back")}
              onRetake={() => setBackImage(null)}
              onNext={handleNext}
              fileInputRef={fileInputRef}
            />
          )}

          {step === "selfie" && (
            <SelfieStep
              key="selfie"
              t={t}
              image={selfieImage}
              isUploading={isUploading}
              onCapture={() => handleSimulatedCapture("selfie")}
              onRetake={() => setSelfieImage(null)}
              onNext={handleNext}
            />
          )}

          {step === "review" && (
            <ReviewStep
              key="review"
              t={t}
              frontImage={frontImage}
              backImage={backImage}
              selfieImage={selfieImage}
              documentType={documentType}
              isUploading={isUploading}
              onSubmit={handleNext}
            />
          )}

          {step === "pending" && (
            <PendingStep
              key="pending"
              t={t}
              onSimulateComplete={() => setStep("success")}
              setLocation={setLocation}
            />
          )}

          {step === "success" && (
            <SuccessStep key="success" t={t} setLocation={setLocation} />
          )}
        </AnimatePresence>
      </div>
    </PageContainer>
  );
}

function IntroStep({ t, onNext }: { t: any; onNext: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full py-4"
    >
      <div className="text-center space-y-8">
        <div className="relative mx-auto w-fit">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          <div className="w-28 h-28 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center relative z-10 shadow-2xl">
            <div className="w-24 h-24 bg-background rounded-full flex items-center justify-center">
              <ShieldCheck className="w-12 h-12 text-primary" />
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <h2 className="text-3xl font-display font-bold tracking-tight">{t.verifyIdentity}</h2>
          <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
            {t.verifyDesc}
          </p>
        </div>

        <div className="glass-card rounded-3xl p-6 text-left space-y-4 border border-white/10">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 text-green-500 mt-1">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-base">{t.governmentId}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t.governmentIdDesc}</p>
            </div>
          </div>
          <div className="w-full h-px bg-white/5" />
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 text-green-500 mt-1">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-base">{t.selfiePhoto}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t.selfieDesc}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto w-full pt-8">
        <Button 
          onClick={onNext}
          className="w-full h-16 text-lg rounded-2xl font-bold shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-[#7c3aed] text-white hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] transition-all active:scale-95"
          data-testid="button-start"
        >
          {t.startVerification}
        </Button>
      </div>
    </motion.div>
  );
}

function SelectDocumentStep({ t, onSelect }: { t: any; onSelect: (type: DocumentType) => void }) {
  const documents: { type: DocumentType; icon: any; title: string; desc: string }[] = [
    { type: "passport", icon: FileText, title: t.passport, desc: t.passportDesc },
    { type: "drivers_license", icon: Car, title: t.driversLicense, desc: t.driversLicenseDesc },
    { type: "national_id", icon: CreditCard, title: t.nationalId, desc: t.nationalIdDesc },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex flex-col max-w-md mx-auto w-full"
    >
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-bold font-display">{t.selectDocument}</h2>
        <p className="text-sm text-muted-foreground">{t.selectDocDesc}</p>
      </div>

      <div className="space-y-3">
        {documents.map((doc, i) => (
          <motion.button
            key={doc.type}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onSelect(doc.type)}
            className="w-full glass-card rounded-2xl p-5 border border-white/10 hover:border-primary/30 hover:bg-white/5 transition-all flex items-center gap-4 group text-left"
            data-testid={`button-doc-${doc.type}`}
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
              <doc.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-base group-hover:text-primary transition-colors">{doc.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{doc.desc}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

interface UploadDocumentStepProps {
  t: Record<string, string>;
  title: string;
  description: string;
  image: string | null;
  isUploading: boolean;
  onCapture: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRetake: () => void;
  onNext: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

function UploadDocumentStep({ t, title, description, image, isUploading, onCapture, onUpload, onRetake, onNext, fileInputRef }: UploadDocumentStepProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex flex-col max-w-md mx-auto w-full"
    >
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-2xl font-bold font-display">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="glass-card rounded-2xl p-4 mb-6 border border-white/10">
        <p className="text-xs font-bold text-muted-foreground mb-3">{t.tips}</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Check className="w-3 h-3 text-green-500" />
            <span>{t.tip1}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Check className="w-3 h-3 text-green-500" />
            <span>{t.tip2}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Check className="w-3 h-3 text-green-500" />
            <span>{t.tip3}</span>
          </div>
        </div>
      </div>

      {image ? (
        <div className="relative aspect-[1.6/1] w-full rounded-3xl overflow-hidden mb-6 border border-green-500/30">
          <img src={image} alt="Document" className="w-full h-full object-cover" />
          <div className="absolute top-3 right-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
          </div>
          <button
            onClick={onRetake}
            className="absolute bottom-3 right-3 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-sm font-medium hover:bg-black/80 transition-colors"
            data-testid="button-retake"
          >
            {t.retake}
          </button>
        </div>
      ) : (
        <div 
          onClick={onCapture}
          className="aspect-[1.6/1] w-full bg-black/30 border-2 border-dashed border-white/20 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/50 hover:bg-white/5 transition-all group relative overflow-hidden mb-6"
        >
          {isUploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform border border-white/10">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm font-bold group-hover:text-primary transition-colors">{t.takePhoto}</p>
            </>
          )}
        </div>
      )}
      
      {!image && (
        <div className="text-center mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-sm text-primary flex items-center justify-center gap-2 mx-auto hover:underline font-medium"
            data-testid="button-upload"
          >
            <Upload className="w-4 h-4" /> {t.uploadFile}
          </button>
        </div>
      )}

      <div className="mt-auto">
        <Button 
          onClick={onNext}
          disabled={!image}
          className="w-full h-16 text-lg rounded-2xl font-bold shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-[#7c3aed] text-white disabled:opacity-50"
          data-testid="button-continue"
        >
          {t.continue}
        </Button>
      </div>
    </motion.div>
  );
}

function SelfieStep({ t, image, isUploading, onCapture, onRetake, onNext }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex flex-col max-w-md mx-auto w-full"
    >
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-2xl font-bold font-display">{t.takeSelfie}</h2>
        <p className="text-sm text-muted-foreground">{t.selfieInstructions}</p>
      </div>
      
      {image ? (
        <div className="relative aspect-[3/4] w-3/4 mx-auto rounded-[3rem] overflow-hidden mb-6 border border-green-500/30">
          <img src={image} alt="Selfie" className="w-full h-full object-cover" />
          <div className="absolute top-4 right-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
          </div>
          <button
            onClick={onRetake}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-sm font-medium hover:bg-black/80 transition-colors"
            data-testid="button-retake"
          >
            {t.retake}
          </button>
        </div>
      ) : (
        <div className="aspect-[3/4] w-3/4 mx-auto bg-black/30 border-2 border-white/20 rounded-[3rem] flex flex-col items-center justify-center gap-4 relative overflow-hidden shadow-2xl mb-6">
          <div className="absolute inset-0 border-[30px] border-black/40 rounded-[3rem] pointer-events-none z-10" />
          
          {isUploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-transparent to-black/60 flex items-end justify-center pb-8">
              <button 
                onClick={onCapture}
                className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/20 backdrop-blur-md hover:bg-white/40 transition-all hover:scale-105 active:scale-95"
                data-testid="button-capture"
              >
                <div className="w-16 h-16 bg-white rounded-full" />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-auto">
        <Button 
          onClick={onNext}
          disabled={!image}
          className="w-full h-16 text-lg rounded-2xl font-bold shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-[#7c3aed] text-white disabled:opacity-50"
          data-testid="button-continue"
        >
          {t.continue}
        </Button>
      </div>
    </motion.div>
  );
}

function ReviewStep({ t, frontImage, backImage, selfieImage, documentType, isUploading, onSubmit }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex flex-col max-w-md mx-auto w-full"
    >
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-2xl font-bold font-display">Review Documents</h2>
        <p className="text-sm text-muted-foreground">Make sure all images are clear and readable</p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="glass-card rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-5 h-5 text-primary" />
            <span className="font-bold text-sm">Document Front</span>
            <Check className="w-4 h-4 text-green-500 ml-auto" />
          </div>
          {frontImage && (
            <div className="aspect-[1.6/1] rounded-xl overflow-hidden">
              <img src={frontImage} alt="Front" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {documentType !== "passport" && backImage && (
          <div className="glass-card rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-bold text-sm">Document Back</span>
              <Check className="w-4 h-4 text-green-500 ml-auto" />
            </div>
            <div className="aspect-[1.6/1] rounded-xl overflow-hidden">
              <img src={backImage} alt="Back" className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        <div className="glass-card rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <Camera className="w-5 h-5 text-primary" />
            <span className="font-bold text-sm">Selfie</span>
            <Check className="w-4 h-4 text-green-500 ml-auto" />
          </div>
          {selfieImage && (
            <div className="aspect-square w-24 rounded-full overflow-hidden mx-auto">
              <img src={selfieImage} alt="Selfie" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto">
        <Button 
          onClick={onSubmit}
          disabled={isUploading}
          className="w-full h-16 text-lg rounded-2xl font-bold shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-[#7c3aed] text-white"
          data-testid="button-submit"
        >
          {isUploading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            "Submit for Verification"
          )}
        </Button>
      </div>
    </motion.div>
  );
}

function PendingStep({ t, onSimulateComplete, setLocation }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full py-8"
    >
      <div className="text-center space-y-6">
        <div className="relative mx-auto w-fit">
          <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full animate-pulse" />
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center relative z-10 shadow-2xl">
            <Clock className="w-12 h-12 text-white" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-display font-bold">{t.pendingReview}</h2>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">
            {t.pendingReviewDesc}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-yellow-500/20 bg-yellow-500/5">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{t.estimatedTime}</span>
            <span className="text-sm font-bold text-yellow-500">{t.businessDays}</span>
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <Button 
            onClick={() => setLocation("/profile")}
            className="w-full h-14 rounded-2xl font-bold text-base bg-gradient-to-r from-primary to-[#7c3aed]"
            data-testid="button-back-profile"
          >
            {t.backToProfile}
          </Button>
          
          <Button 
            variant="outline"
            onClick={onSimulateComplete}
            className="w-full h-12 rounded-xl border-white/20 text-sm"
            data-testid="button-simulate"
          >
            (Demo) Simulate Approval
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function SuccessStep({ t, setLocation }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full py-8"
    >
      <div className="text-center space-y-8 w-full">
        <div className="relative mx-auto w-fit">
          <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
          <div className="w-28 h-28 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center relative z-10 shadow-2xl">
            <CheckCircle2 className="w-14 h-14 text-white" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-display font-bold tracking-tight">{t.verified}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {t.verifiedDesc}
          </p>
        </div>

        <div className="glass-card rounded-3xl p-6 border border-green-500/20 bg-green-500/5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground">{t.newDailyLimit}</span>
            <span className="text-xs bg-green-500/20 text-green-500 px-3 py-1 rounded-full font-bold border border-green-500/20">{t.upgraded}</span>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-muted-foreground/50 line-through text-sm font-mono mb-1">R$ 5.000</span>
            <span className="text-3xl font-bold font-display text-white">R$ 50.000</span>
          </div>
        </div>

        <Button 
          onClick={() => setLocation("/profile")}
          className="w-full h-16 text-lg rounded-2xl font-bold shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-[#7c3aed] text-white hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] transition-all active:scale-95"
          data-testid="button-done"
        >
          {t.backToProfile}
        </Button>
      </div>
    </motion.div>
  );
}
