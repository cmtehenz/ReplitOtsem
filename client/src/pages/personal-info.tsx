import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Camera, Loader2, Check, User, Mail, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { updateProfile } from "@/lib/api";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function PersonalInfo() {
  const { t } = useLanguage();
  const { user, updateUser } = useAuth();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [profilePhoto, setProfilePhoto] = useState<string | undefined>(user?.profilePhoto || undefined);
  const [previewPhoto, setPreviewPhoto] = useState<string | undefined>(user?.profilePhoto || undefined);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setProfilePhoto(user.profilePhoto || undefined);
      setPreviewPhoto(user.profilePhoto || undefined);
    }
  }, [user]);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error(t("personalInfo.photoTooLarge"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPreviewPhoto(base64);
      setProfilePhoto(base64);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPreviewPhoto(undefined);
    setProfilePhoto(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error(t("personalInfo.nameRequired"));
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error(t("personalInfo.emailInvalid"));
      return;
    }

    setSaving(true);
    try {
      const updatedUser = await updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        profilePhoto: profilePhoto || undefined,
      });
      updateUser(updatedUser);
      toast.success(t("personalInfo.saved"));
      setLocation("/profile");
    } catch (error: any) {
      toast.error(error.message || t("personalInfo.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = 
    name !== (user?.name || "") ||
    email !== (user?.email || "") ||
    phone !== (user?.phone || "") ||
    profilePhoto !== user?.profilePhoto;

  return (
    <div className="min-h-screen bg-otsem-gradient text-foreground">
      <div className="max-w-md mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setLocation("/profile")}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-card/40 border border-white/10 hover:bg-card/70 transition-all"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-display font-bold tracking-tight">{t("personalInfo.title")}</h1>
        </div>

        <div className="flex flex-col items-center py-6">
          <div className="relative group">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              data-testid="input-photo-upload"
            />
            <button 
              onClick={handlePhotoClick}
              className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-primary/30 hover:border-primary transition-all group-hover:shadow-lg group-hover:shadow-primary/20"
              data-testid="button-change-photo"
            >
              {previewPhoto ? (
                <img src={previewPhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <User className="w-12 h-12 text-primary/50" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </button>
            {previewPhoto && (
              <button
                onClick={removePhoto}
                className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                data-testid="button-remove-photo"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-3">{t("personalInfo.tapToChange")}</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              {t("personalInfo.name")}
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("personalInfo.namePlaceholder")}
              className="h-12 bg-card/40 border-white/10 focus:border-primary rounded-xl"
              data-testid="input-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              {t("personalInfo.email")}
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("personalInfo.emailPlaceholder")}
              className="h-12 bg-card/40 border-white/10 focus:border-primary rounded-xl"
              data-testid="input-email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              {t("personalInfo.phone")}
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("personalInfo.phonePlaceholder")}
              className="h-12 bg-card/40 border-white/10 focus:border-primary rounded-xl"
              data-testid="input-phone"
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="w-full h-12 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-bold rounded-xl shadow-lg shadow-primary/30 disabled:opacity-50 disabled:shadow-none transition-all"
          data-testid="button-save"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Check className="w-5 h-5 mr-2" />
              {t("personalInfo.save")}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
