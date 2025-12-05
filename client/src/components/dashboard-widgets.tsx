import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, Reorder } from "framer-motion";
import { 
  Eye, EyeOff, GripVertical, Settings2, Plus, ArrowUpRight, ArrowDownLeft, 
  ArrowLeftRight, TrendingUp, TrendingDown, Newspaper, PieChart, 
  Clock, ChevronRight, X, Check, Sparkles
} from "lucide-react";
import { 
  getDashboardWidgets, saveDashboardWidgets, getWallets, getRates, 
  getTransactions, getNews, getStats,
  type DashboardWidget, type Wallet, type Transaction, type NewsItem
} from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

type WidgetType = DashboardWidget["widgetType"];

interface WidgetMeta {
  type: WidgetType;
  title: string;
  titlePt: string;
  icon: React.ElementType;
  description: string;
  descriptionPt: string;
}

const WIDGET_METADATA: WidgetMeta[] = [
  { type: "balance_summary", title: "Balance Summary", titlePt: "Resumo do Saldo", icon: Eye, description: "Your total portfolio value", descriptionPt: "Valor total do seu portfólio" },
  { type: "quick_actions", title: "Quick Actions", titlePt: "Ações Rápidas", icon: Sparkles, description: "Deposit, withdraw, exchange", descriptionPt: "Depositar, sacar, trocar" },
  { type: "portfolio_chart", title: "Portfolio Chart", titlePt: "Gráfico do Portfólio", icon: TrendingUp, description: "Performance over time", descriptionPt: "Performance ao longo do tempo" },
  { type: "exchange_rates", title: "Exchange Rates", titlePt: "Taxas de Câmbio", icon: ArrowLeftRight, description: "Current BRL/USDT rates", descriptionPt: "Taxas atuais BRL/USDT" },
  { type: "recent_transactions", title: "Recent Transactions", titlePt: "Transações Recentes", icon: Clock, description: "Latest wallet activity", descriptionPt: "Atividade recente da carteira" },
  { type: "news_feed", title: "Crypto News", titlePt: "Notícias Crypto", icon: Newspaper, description: "Latest market updates", descriptionPt: "Últimas atualizações do mercado" },
  { type: "asset_allocation", title: "Asset Allocation", titlePt: "Alocação de Ativos", icon: PieChart, description: "Portfolio breakdown", descriptionPt: "Distribuição do portfólio" },
];

export function CustomizableDashboard() {
  const { t } = useLanguage();
  const isPortuguese = t("nav.home") === "Início";
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);
  const [localWidgets, setLocalWidgets] = useState<DashboardWidget[]>([]);

  const { data: widgets = [], isLoading } = useQuery({
    queryKey: ["dashboard-widgets"],
    queryFn: getDashboardWidgets,
  });

  useEffect(() => {
    if (widgets.length > 0) {
      setLocalWidgets(widgets);
    }
  }, [widgets]);

  const saveMutation = useMutation({
    mutationFn: saveDashboardWidgets,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-widgets"] });
      toast.success(isPortuguese ? "Layout salvo!" : "Layout saved!");
      setIsEditing(false);
    },
    onError: () => {
      toast.error(isPortuguese ? "Erro ao salvar" : "Failed to save");
    },
  });

  const handleReorder = (newOrder: DashboardWidget[]) => {
    const reordered = newOrder.map((w, i) => ({ ...w, order: String(i) }));
    setLocalWidgets(reordered);
  };

  const handleToggleWidget = (widgetType: WidgetType) => {
    const existing = localWidgets.find(w => w.widgetType === widgetType);
    if (existing) {
      setLocalWidgets(prev => prev.map(w => 
        w.widgetType === widgetType ? { ...w, visible: !w.visible } : w
      ));
    } else {
      const newWidget: DashboardWidget = {
        id: `temp-${widgetType}`,
        widgetType,
        order: String(localWidgets.length),
        visible: true,
        config: null,
      };
      setLocalWidgets(prev => [...prev, newWidget]);
    }
  };

  const handleSave = () => {
    const toSave = localWidgets.map((w, i) => ({
      widgetType: w.widgetType,
      order: i,
      visible: w.visible,
    }));
    saveMutation.mutate(toSave);
  };

  const handleCancel = () => {
    setLocalWidgets(widgets);
    setIsEditing(false);
  };

  const visibleWidgets = localWidgets.filter(w => w.visible);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isEditing && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between bg-white rounded-xl p-3 border border-primary/20"
        >
          <span className="text-sm font-medium text-gray-700">
            {isPortuguese ? "Modo de edição" : "Edit mode"}
          </span>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleCancel}
              className="h-8"
            >
              <X className="w-4 h-4 mr-1" />
              {isPortuguese ? "Cancelar" : "Cancel"}
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="h-8 bg-primary text-white hover:bg-primary/90"
            >
              <Check className="w-4 h-4 mr-1" />
              {isPortuguese ? "Salvar" : "Save"}
            </Button>
          </div>
        </motion.div>
      )}

      {isEditing ? (
        <Reorder.Group
          axis="y"
          values={visibleWidgets}
          onReorder={handleReorder}
          className="space-y-3"
        >
          {visibleWidgets.map(widget => (
            <Reorder.Item
              key={widget.id}
              value={widget}
              className="cursor-grab active:cursor-grabbing"
            >
              <WidgetWrapper 
                widget={widget} 
                isEditing={true}
                onRemove={() => handleToggleWidget(widget.widgetType)}
              />
            </Reorder.Item>
          ))}
        </Reorder.Group>
      ) : (
        <div className="space-y-4">
          {visibleWidgets.map(widget => (
            <WidgetWrapper key={widget.id} widget={widget} isEditing={false} />
          ))}
        </div>
      )}

      {isEditing && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowWidgetPicker(true)}
          className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-gray-400 hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-medium">
            {isPortuguese ? "Adicionar widget" : "Add widget"}
          </span>
        </motion.button>
      )}

      {!isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="w-full py-3 flex items-center justify-center gap-2 text-gray-500 hover:text-primary transition-colors"
          data-testid="button-customize-dashboard"
        >
          <Settings2 className="w-4 h-4" />
          <span className="text-sm font-medium">
            {isPortuguese ? "Personalizar dashboard" : "Customize dashboard"}
          </span>
        </button>
      )}

      <WidgetPickerDialog 
        open={showWidgetPicker}
        onOpenChange={setShowWidgetPicker}
        widgets={localWidgets}
        onToggle={handleToggleWidget}
        isPortuguese={isPortuguese}
      />
    </div>
  );
}

function WidgetWrapper({ 
  widget, 
  isEditing,
  onRemove,
}: { 
  widget: DashboardWidget;
  isEditing: boolean;
  onRemove?: () => void;
}) {
  const meta = WIDGET_METADATA.find(m => m.type === widget.widgetType);
  
  return (
    <div className="relative">
      {isEditing && (
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 z-10">
          <div className="w-6 h-10 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center">
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      )}
      {isEditing && onRemove && (
        <button
          onClick={onRemove}
          className="absolute -right-2 -top-2 z-10 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
      <motion.div
        layout
        className={`bg-white rounded-2xl ${isEditing ? 'ring-2 ring-primary/20 ml-4' : 'card-shadow'}`}
      >
        <WidgetContent type={widget.widgetType} />
      </motion.div>
    </div>
  );
}

function WidgetContent({ type }: { type: WidgetType }) {
  switch (type) {
    case "balance_summary":
      return <BalanceSummaryWidget />;
    case "quick_actions":
      return <QuickActionsWidget />;
    case "portfolio_chart":
      return <PortfolioChartWidget />;
    case "exchange_rates":
      return <ExchangeRatesWidget />;
    case "recent_transactions":
      return <RecentTransactionsWidget />;
    case "news_feed":
      return <NewsFeedWidget />;
    case "asset_allocation":
      return <AssetAllocationWidget />;
    default:
      return null;
  }
}

function BalanceSummaryWidget() {
  const { t } = useLanguage();
  const isPortuguese = t("nav.home") === "Início";
  const [isVisible, setIsVisible] = useState(true);
  
  const { data: wallets } = useQuery({
    queryKey: ["wallets"],
    queryFn: getWallets,
  });

  const { data: rates } = useQuery({
    queryKey: ["rates"],
    queryFn: getRates,
    refetchInterval: 60000,
  });

  const calculateTotal = () => {
    if (!wallets) return 0;
    const usdtRate = rates?.usdtBrl?.sell || 6.0;
    let total = 0;
    wallets.forEach(wallet => {
      const balance = parseFloat(wallet.balance);
      if (wallet.currency === "BRL") {
        total += balance;
      } else if (wallet.currency === "USDT") {
        total += balance * usdtRate;
      }
    });
    return total;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500 font-medium">
          {isPortuguese ? "Saldo disponível" : "Available balance"}
        </span>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
      </div>
      <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">
        {isVisible ? formatCurrency(calculateTotal()) : "R$ ••••••"}
      </h2>
    </div>
  );
}

function QuickActionsWidget() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const isPortuguese = t("nav.home") === "Início";

  const actions = [
    { icon: Plus, label: isPortuguese ? "Depositar" : "Deposit", route: "/deposit", primary: true },
    { icon: ArrowUpRight, label: isPortuguese ? "Sacar" : "Withdraw", route: "/withdraw" },
    { icon: ArrowDownLeft, label: isPortuguese ? "Receber" : "Receive", route: "/receive" },
    { icon: ArrowLeftRight, label: isPortuguese ? "Trocar" : "Exchange", route: "/exchange" },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
        {actions.map((action, i) => (
          <button 
            key={i}
            onClick={() => setLocation(action.route)}
            className="flex flex-col items-center gap-2 w-[70px]"
            data-testid={`widget-action-${action.route.slice(1)}`}
          >
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center transition-all
              ${action.primary 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }
            `}>
              <action.icon className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <span className="text-xs font-medium text-gray-600">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function PortfolioChartWidget() {
  const { t } = useLanguage();
  const isPortuguese = t("nav.home") === "Início";
  
  const { data: stats } = useQuery({
    queryKey: ["stats", 7],
    queryFn: () => getStats(7),
  });

  const dailyData = stats?.dailyData || [];
  const maxValue = Math.max(...dailyData.map(d => d.income + d.expense), 1);

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">
          {isPortuguese ? "Atividade (7 dias)" : "Activity (7 days)"}
        </h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            {isPortuguese ? "Entrada" : "Income"}
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            {isPortuguese ? "Saída" : "Expense"}
          </span>
        </div>
      </div>
      <div className="flex items-end gap-1 h-24">
        {dailyData.map((day, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            <div className="w-full flex flex-col-reverse gap-0.5">
              <div 
                className="w-full bg-green-500 rounded-t-sm"
                style={{ height: `${(day.income / maxValue) * 80}px` }}
              />
              <div 
                className="w-full bg-red-400 rounded-t-sm"
                style={{ height: `${(day.expense / maxValue) * 80}px` }}
              />
            </div>
            <span className="text-[10px] text-gray-400 mt-1">
              {new Date(day.date).toLocaleDateString('en', { weekday: 'narrow' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExchangeRatesWidget() {
  const { t } = useLanguage();
  const isPortuguese = t("nav.home") === "Início";
  
  const { data: rates } = useQuery({
    queryKey: ["rates"],
    queryFn: getRates,
    refetchInterval: 60000,
  });

  const usdtBuy = rates?.usdtBrl?.buy || 6.0;
  const usdtSell = rates?.usdtBrl?.sell || 6.0;

  return (
    <div className="p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        {isPortuguese ? "Taxas de Câmbio" : "Exchange Rates"}
      </h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700">
              ₮
            </div>
            <span className="text-sm text-gray-700">USDT/BRL</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-900">
              R$ {usdtBuy.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              {isPortuguese ? "Compra" : "Buy"}: R$ {usdtBuy.toFixed(2)} | {isPortuguese ? "Venda" : "Sell"}: R$ {usdtSell.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecentTransactionsWidget() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const isPortuguese = t("nav.home") === "Início";
  
  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => getTransactions(5),
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "deposit": return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
      case "withdrawal": return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case "exchange": return <ArrowLeftRight className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatAmount = (tx: Transaction) => {
    if (tx.type === "deposit" && tx.toAmount) {
      return `+R$ ${parseFloat(tx.toAmount).toFixed(2)}`;
    }
    if (tx.type === "withdrawal" && tx.fromAmount) {
      return `-R$ ${parseFloat(tx.fromAmount).toFixed(2)}`;
    }
    if (tx.type === "exchange") {
      return tx.fromAmount ? `${parseFloat(tx.fromAmount).toFixed(2)} ${tx.fromCurrency}` : "";
    }
    return "";
  };

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">
          {isPortuguese ? "Transações Recentes" : "Recent Transactions"}
        </h3>
        <button 
          onClick={() => setLocation("/history")}
          className="text-xs text-primary font-medium flex items-center gap-1"
        >
          {isPortuguese ? "Ver todas" : "View all"}
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      {transactions.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">
          {isPortuguese ? "Nenhuma transação ainda" : "No transactions yet"}
        </p>
      ) : (
        <div className="space-y-2">
          {transactions.slice(0, 4).map(tx => (
            <div key={tx.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  {getTypeIcon(tx.type)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{tx.description}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className={`text-sm font-medium ${
                tx.type === "deposit" ? "text-green-600" : 
                tx.type === "withdrawal" ? "text-red-500" : "text-gray-700"
              }`}>
                {formatAmount(tx)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NewsFeedWidget() {
  const { t } = useLanguage();
  const isPortuguese = t("nav.home") === "Início";
  
  const { data: news = [] } = useQuery({
    queryKey: ["news"],
    queryFn: getNews,
    refetchInterval: 5 * 60 * 1000,
  });

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return isPortuguese ? "Agora" : "Now";
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "bitcoin": return "bg-orange-100 text-orange-700";
      case "stablecoin": return "bg-green-100 text-green-700";
      case "regulation": return "bg-blue-100 text-blue-700";
      case "defi": return "bg-purple-100 text-purple-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">
          {isPortuguese ? "Notícias Crypto" : "Crypto News"}
        </h3>
        <Newspaper className="w-4 h-4 text-gray-400" />
      </div>
      <div className="space-y-3">
        {news.slice(0, 3).map(item => (
          <a 
            key={item.id}
            href={item.url}
            className="block group"
            data-testid={`news-item-${item.id}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-primary transition-colors">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                  <span className="text-[10px] text-gray-400">{item.source}</span>
                  <span className="text-[10px] text-gray-400">{formatTime(item.timestamp)}</span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function AssetAllocationWidget() {
  const { t } = useLanguage();
  const isPortuguese = t("nav.home") === "Início";
  
  const { data: wallets } = useQuery({
    queryKey: ["wallets"],
    queryFn: getWallets,
  });

  const { data: rates } = useQuery({
    queryKey: ["rates"],
    queryFn: getRates,
  });

  const calculateAllocation = () => {
    if (!wallets) return [];
    const usdtRate = rates?.usdtBrl?.sell || 6.0;
    
    const assets = wallets.map(w => {
      const balance = parseFloat(w.balance);
      const valueBrl = w.currency === "USDT" ? balance * usdtRate : balance;
      return { currency: w.currency, balance, valueBrl };
    });

    const total = assets.reduce((sum, a) => sum + a.valueBrl, 0);
    return assets.map(a => ({
      ...a,
      percentage: total > 0 ? (a.valueBrl / total) * 100 : 0,
    }));
  };

  const allocation = calculateAllocation();

  const getColor = (currency: string) => {
    switch (currency) {
      case "BRL": return "bg-green-500";
      case "USDT": return "bg-blue-500";
      case "BTC": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        {isPortuguese ? "Alocação de Ativos" : "Asset Allocation"}
      </h3>
      <div className="h-3 rounded-full bg-gray-100 overflow-hidden flex mb-3">
        {allocation.map((asset, i) => (
          <div
            key={asset.currency}
            className={`h-full ${getColor(asset.currency)}`}
            style={{ width: `${asset.percentage}%` }}
          />
        ))}
      </div>
      <div className="space-y-2">
        {allocation.map(asset => (
          <div key={asset.currency} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getColor(asset.currency)}`} />
              <span className="text-sm text-gray-700">{asset.currency}</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {asset.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WidgetPickerDialog({ 
  open, 
  onOpenChange, 
  widgets, 
  onToggle,
  isPortuguese,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  widgets: DashboardWidget[];
  onToggle: (type: WidgetType) => void;
  isPortuguese: boolean;
}) {
  const isWidgetVisible = (type: WidgetType) => {
    const widget = widgets.find(w => w.widgetType === type);
    return widget?.visible ?? false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-0 rounded-3xl sm:max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {isPortuguese ? "Gerenciar Widgets" : "Manage Widgets"}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            {isPortuguese 
              ? "Escolha quais widgets exibir no dashboard" 
              : "Choose which widgets to display on your dashboard"}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-3">
          {WIDGET_METADATA.map(meta => (
            <div 
              key={meta.type}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <meta.icon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {isPortuguese ? meta.titlePt : meta.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isPortuguese ? meta.descriptionPt : meta.description}
                  </p>
                </div>
              </div>
              <Switch
                checked={isWidgetVisible(meta.type)}
                onCheckedChange={() => onToggle(meta.type)}
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
