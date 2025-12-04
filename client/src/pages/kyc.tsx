import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera, Upload, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
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
    <div className="min-h-screen bg-background text-foreground p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center mb-8">
        {step !== "success" && (
          <button 
            onClick={() => step === "intro" ? setLocation("/profile") : setStep("intro")}
            className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        <div className="flex-1 text-center pr-4">
          <h1 className="font-display font-bold text-lg">Identity Verification</h1>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        {step === "intro" && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
              <ShieldCheck className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-display font-bold">Verify your identity</h2>
            <p className="text-muted-foreground">
              To comply with regulations and increase your daily transaction limits, we need to verify your identity.
            </p>
            <div className="bg-card border border-white/5 rounded-2xl p-4 text-left space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Government ID</p>
                  <p className="text-xs text-muted-foreground">Passport, Driver's License, or National ID</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Selfie Photo</p>
                  <p className="text-xs text-muted-foreground">To match your face with your ID</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === "document" && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full space-y-6"
          >
            <h2 className="text-xl font-bold text-center">Scan Document</h2>
            <p className="text-center text-sm text-muted-foreground">
              Take a clear photo of the front of your government-issued ID.
            </p>
            
            <div className="aspect-[1.6/1] w-full bg-card border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/50 hover:bg-white/5 transition-all group relative overflow-hidden">
              {isUploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Tap to take photo</p>
                </>
              )}
            </div>
            
            <div className="text-center">
              <button className="text-sm text-primary flex items-center justify-center gap-2 mx-auto hover:underline">
                <Upload className="w-4 h-4" /> Upload file instead
              </button>
            </div>
          </motion.div>
        )}

        {step === "selfie" && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full space-y-6"
          >
            <h2 className="text-xl font-bold text-center">Take a Selfie</h2>
            <p className="text-center text-sm text-muted-foreground">
              Position your face in the oval frame. Make sure you have good lighting.
            </p>
            
            <div className="aspect-[3/4] w-3/4 mx-auto bg-card border-2 border-white/20 rounded-[3rem] flex flex-col items-center justify-center gap-4 relative overflow-hidden">
              <div className="absolute inset-0 border-[20px] border-black/30 rounded-[3rem] pointer-events-none z-10" />
              
              {isUploading ? (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-b from-transparent to-black/50 flex items-end justify-center pb-8">
                  <button 
                    onClick={handleNext}
                    className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-colors"
                  >
                    <div className="w-12 h-12 bg-white rounded-full" />
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
            className="text-center space-y-6"
          >
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <h2 className="text-xl font-bold">Verifying Documents...</h2>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              We are analyzing your documents securely. This usually takes less than a minute.
            </p>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-display font-bold">Verification Complete!</h2>
            <p className="text-muted-foreground">
              Your identity has been verified successfully. Your limits have been increased.
            </p>
            <div className="bg-card border border-white/5 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Daily Limit</span>
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Upgraded</span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold font-mono">
                <span className="text-muted-foreground line-through text-sm">R$ 5.000</span>
                <span className="text-primary">R$ 50.000</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer Button */}
      {step !== "review" && (
        <div className="mt-8 w-full max-w-md mx-auto">
          <Button 
            onClick={step === "success" ? () => setLocation("/profile") : handleNext}
            className="w-full h-14 text-lg rounded-xl"
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
  );
}
