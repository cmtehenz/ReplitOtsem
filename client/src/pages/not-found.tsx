import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/context/LanguageContext";

export default function NotFound() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();

  const t = {
    title: language === "pt-BR" ? "Página Não Encontrada" : "Page Not Found",
    description: language === "pt-BR" 
      ? "A página que você está procurando não existe ou foi movida." 
      : "The page you're looking for doesn't exist or has been moved.",
    backHome: language === "pt-BR" ? "Voltar ao Início" : "Back to Home",
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-otsem-gradient p-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-4xl font-display font-bold text-white">404</h1>
          <h2 className="text-xl font-bold text-white" data-testid="text-not-found-title">{t.title}</h2>
          <p className="text-muted-foreground">
            {t.description}
          </p>
        </div>

        <Button 
          onClick={() => setLocation("/")}
          className="h-14 px-8 text-lg bg-primary text-white hover:bg-primary/90 rounded-xl"
          data-testid="button-back-home"
        >
          <Home className="w-5 h-5 mr-2" />
          {t.backHome}
        </Button>
      </div>
    </div>
  );
}
