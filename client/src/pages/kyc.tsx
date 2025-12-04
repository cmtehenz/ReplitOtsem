import { PageContainer } from "@/components/page-container";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera, Upload, CheckCircle2, Loader2, ShieldCheck, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Step = "intro" | "document" | "selfie" | "review" | "success";

export default function KYCVerification() {
  const [step, setStep] = useState<Step>("intro");
  const [, setLocation] = useLocation();
  const [isUploading, setIsUploading] = useState(false);

  const handleNext = () => {
    if (step === "document") {
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        setStep("selfie");
      }, 1500);
    } else if (step === "selfie") {
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        setStep("review");
      }, 1500);
    } else if (step === "review") {
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        setStep("success");
      }, 2000);
    } else {
      setStep("document");
    }
  };

  return (
    <PageContainer>
      <div className="p-6 flex flex-col h-full min-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 sticky top-0 z-10 bg-background/50 backdrop-blur-xl p-4 -m-4 border-b border-white/5">
           {step !== "success" && (
            <button 
              onClick={() => step === "intro" ? setLocation("/profile") : setStep("intro")}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 hover:border-primary/30"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
           )}
           {step === "success" && <div className="w-10" />}
           
          <h1 className="font-display font-bold text-lg tracking-wide">Verification</h1>
          <div className="w-10" />
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full py-4">
          {step === "intro" && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-8"
            >
              <div className="relative mx-auto w-fit">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <div className="w-28 h-28 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center relative z-10 shadow-2xl">
                  <div className="w-24 h-24 bg-background rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-12 h-12 text-primary" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h2 className="text-3xl font-display font-bold tracking-tight">Verify Identity</h2>
                <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  Increase your limits and unlock full features by verifying your identity. It only takes 2 minutes.
                </p>
              </div>

              <div className="glass-card rounded-3xl p-6 text-left space-y-4 border border-white/10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 text-green-500 mt-1">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-base">Government ID</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Passport, Driver's License, or National ID</p>
                  </div>
                </div>
                <div className="w-full h-px bg-white/5" />
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 text-green-500 mt-1">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-base">Selfie Photo</p>
                    <p className="text-xs text-muted-foreground mt-0.5">To match your face with your ID</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === "document" && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold font-display">Scan Document</h2>
                <p className="text-sm text-muted-foreground">
                  Take a clear photo of the front of your ID.
                </p>
              </div>
              
              <div className="aspect-[1.6/1] w-full bg-black/30 border-2 border-dashed border-white/20 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/50 hover:bg-white/5 transition-all group relative overflow-hidden">
                {isUploading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform border border-white/10">
                      <Camera className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm font-bold group-hover:text-primary transition-colors">Tap to take photo</p>
                  </>
                )}
              </div>
              
              <div className="text-center">
                <button className="text-sm text-primary flex items-center justify-center gap-2 mx-auto hover:underline font-medium">
                  <Upload className="w-4 h-4" /> Upload file instead
                </button>
              </div>
            </motion.div>
          )}

          {step === "selfie" && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold font-display">Take a Selfie</h2>
                <p className="text-sm text-muted-foreground">
                  Position your face in the oval frame.
                </p>
              </div>
              
              <div className="aspect-[3/4] w-3/4 mx-auto bg-black/30 border-2 border-white/20 rounded-[3rem] flex flex-col items-center justify-center gap-4 relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 border-[30px] border-black/40 rounded-[3rem] pointer-events-none z-10" />
                
                {isUploading ? (
                   <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-b from-transparent to-black/60 flex items-end justify-center pb-8">
                    <button 
                      onClick={handleNext}
                      className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/20 backdrop-blur-md hover:bg-white/40 transition-all hover:scale-105 active:scale-95"
                    >
                      <div className="w-16 h-16 bg-white rounded-full" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === "review" && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-8"
            >
              <div className="relative mx-auto w-fit">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                <div className="w-24 h-24 bg-card rounded-full flex items-center justify-center relative z-10 border border-white/10">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold font-display">Verifying...</h2>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">
                  We are securely analyzing your documents. This usually takes less than a minute.
                </p>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8 w-full"
            >
              <div className="relative mx-auto w-fit">
                <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
                <div className="w-28 h-28 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center relative z-10 shadow-2xl">
                  <CheckCircle2 className="w-14 h-14 text-white" />
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-display font-bold tracking-tight">Verified!</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your identity has been successfully verified.
                </p>
              </div>

              <div className="glass-card rounded-3xl p-6 border border-green-500/20 bg-green-500/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-muted-foreground">New Daily Limit</span>
                  <span className="text-xs bg-green-500/20 text-green-500 px-3 py-1 rounded-full font-bold border border-green-500/20">UPGRADED</span>
                </div>
                <div className="flex justify-between items-end">
                   <span className="text-muted-foreground/50 line-through text-sm font-mono mb-1">R$ 5.000</span>
                   <span className="text-3xl font-bold font-display text-white">R$ 50.000</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer Button */}
        {step !== "review" && (
          <div className="mt-auto w-full max-w-md mx-auto pt-8">
            <Button 
              onClick={step === "success" ? () => setLocation("/profile") : handleNext}
              className="w-full h-16 text-lg rounded-2xl font-bold shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-[#7c3aed] text-white hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] transition-all active:scale-95"
              disabled={isUploading}
            >
              {step === "intro" && "Start Verification"}
              {step === "document" && "Take Photo"}
              {step === "selfie" && "I'm Ready"}
              {step === "success" && "Back to Profile"}
            </Button>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
