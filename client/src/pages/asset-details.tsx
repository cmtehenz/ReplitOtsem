import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getWallets, getRates } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

const currencyConfig: Record<string, { name: string; symbol: string; color: string; chartColor: string }> = {
  BRL: { name: "Brazilian Real", symbol: "BRL", color: "#22c55e", chartColor: "#22c55e" },
  USDT: { name: "Tether USD", symbol: "USDT", color: "#26A17B", chartColor: "#26A17B" },
  BTC: { name: "Bitcoin", symbol: "BTC", color: "#f97316", chartColor: "#f97316" },
};

type TimeRange = "1H" | "1D" | "1W" | "1M" | "1Y";

function generatePriceData(basePrice: number, range: TimeRange, volatility: number = 0.02) {
  const points: { time: string; price: number; timestamp: number }[] = [];
  let currentPrice = basePrice * (1 - volatility * 5);
  
  const configs: Record<TimeRange, { count: number; labelFn: (i: number) => string }> = {
    "1H": { count: 60, labelFn: (i) => `${60 - i}m` },
    "1D": { count: 24, labelFn: (i) => `${i}:00` },
    "1W": { count: 7, labelFn: (i) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][(new Date().getDay() + i) % 7] },
    "1M": { count: 30, labelFn: (i) => `${i + 1}` },
    "1Y": { count: 12, labelFn: (i) => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][(new Date().getMonth() + i) % 12] },
  };
  
  const config = configs[range];
  
  for (let i = 0; i < config.count; i++) {
    const trend = (i / config.count) * volatility * 10;
    const noise = (Math.random() - 0.5) * volatility * basePrice;
    currentPrice = basePrice * (1 - volatility * 5 + trend) + noise;
    currentPrice = Math.max(currentPrice, basePrice * 0.8);
    
    points.push({
      time: config.labelFn(i),
      price: currentPrice,
      timestamp: Date.now() - (config.count - i) * 3600000,
    });
  }
  
  points.push({
    time: "Now",
    price: basePrice,
    timestamp: Date.now(),
  });
  
  return points;
}

export default function AssetDetails() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/asset/:currency");
  const { t, language } = useLanguage();
  const [selectedRange, setSelectedRange] = useState<TimeRange>("1D");
  const currency = params?.currency?.toUpperCase() || "USDT";
  
  const { data: wallets } = useQuery({
    queryKey: ["wallets"],
    queryFn: getWallets,
  });
  
  const { data: rates, isLoading: ratesLoading } = useQuery({
    queryKey: ["rates"],
    queryFn: getRates,
    staleTime: 30000,
    refetchInterval: 60000,
  });
  
  const wallet = wallets?.find(w => w.currency === currency);
  const config = currencyConfig[currency] || currencyConfig.USDT;
  
  const usdtRate = rates?.usdtBrl?.buy || 5.15;
  const btcRate = usdtRate * 65000;
  
  const getBasePrice = () => {
    if (currency === "BRL") return 1;
    if (currency === "USDT") return usdtRate;
    if (currency === "BTC") return btcRate;
    return 1;
  };
  
  const priceData = generatePriceData(getBasePrice(), selectedRange, currency === "BTC" ? 0.03 : 0.01);
  
  const priceChange = priceData.length > 1 
    ? ((priceData[priceData.length - 1].price - priceData[0].price) / priceData[0].price) * 100
    : 0;
  
  const isPositive = priceChange >= 0;
  
  const balance = wallet ? parseFloat(wallet.balance) : 0;
  const valueBRL = currency === "BRL" ? balance : currency === "USDT" ? balance * usdtRate : balance * btcRate;
  
  const formatPrice = (price: number) => {
    if (currency === "BRL") return `R$ ${price.toFixed(2)}`;
    if (currency === "BTC") return `R$ ${price.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
    return `R$ ${price.toFixed(2)}`;
  };
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-2 shadow-xl">
          <p className="text-xs text-muted-foreground">{payload[0].payload.time}</p>
          <p className="text-sm font-bold" style={{ color: config.chartColor }}>
            {formatPrice(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };
  
  const timeRanges: TimeRange[] = ["1H", "1D", "1W", "1M", "1Y"];
  
  return (
    <div className="min-h-screen bg-otsem-gradient text-foreground">
      <div className="max-w-md mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setLocation("/wallet")}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-bold text-lg">{config.name}</h1>
          <div className="w-10" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="flex items-center justify-center gap-2">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl"
              style={{ backgroundColor: `${config.color}20`, color: config.color }}
            >
              {currency === "BRL" ? "R$" : currency === "USDT" ? "T" : "₿"}
            </div>
          </div>
          
          <div>
            <h2 className="text-4xl font-display font-bold" data-testid="text-current-price">
              {formatPrice(getBasePrice())}
            </h2>
            <div className={cn(
              "flex items-center justify-center gap-1 mt-1",
              isPositive ? "text-green-500" : "text-red-500"
            )}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="text-sm font-bold">
                {isPositive ? "+" : ""}{priceChange.toFixed(2)}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                {selectedRange === "1H" ? (language === "pt-BR" ? "última hora" : "last hour") :
                 selectedRange === "1D" ? (language === "pt-BR" ? "hoje" : "today") :
                 selectedRange === "1W" ? (language === "pt-BR" ? "esta semana" : "this week") :
                 selectedRange === "1M" ? (language === "pt-BR" ? "este mês" : "this month") :
                 (language === "pt-BR" ? "este ano" : "this year")}
              </span>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-3xl p-4 h-[250px]"
        >
          {ratesLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id={`gradient-${currency}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={config.chartColor} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={config.chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#666", fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  hide 
                  domain={["dataMin - 1", "dataMax + 1"]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={config.chartColor}
                  strokeWidth={2}
                  fill={`url(#gradient-${currency})`}
                  dot={false}
                  activeDot={{ r: 6, fill: config.chartColor, stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>
        
        <div className="flex justify-center gap-2">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                selectedRange === range 
                  ? "bg-primary text-white" 
                  : "bg-white/5 text-muted-foreground hover:bg-white/10"
              )}
              data-testid={`button-range-${range}`}
            >
              {range}
            </button>
          ))}
        </div>
        
        {wallet && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-3xl p-5 space-y-4"
          >
            <h3 className="font-display font-bold text-sm text-muted-foreground uppercase tracking-wider">
              {language === "pt-BR" ? "Seu Saldo" : "Your Balance"}
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold font-display" data-testid="text-balance">
                  {balance.toLocaleString("pt-BR", { minimumFractionDigits: currency === "BTC" ? 8 : 2, maximumFractionDigits: currency === "BTC" ? 8 : 2 })} {currency}
                </p>
                <p className="text-sm text-muted-foreground">
                  ≈ R$ {valueBRL.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 pt-2">
              <Button 
                onClick={() => setLocation("/")}
                className="bg-primary text-white hover:bg-primary/90 h-12 rounded-xl font-bold text-sm"
                data-testid="button-buy"
              >
                <ArrowDownLeft className="w-4 h-4 mr-1" />
                {language === "pt-BR" ? "Comprar" : "Buy"}
              </Button>
              <Button 
                onClick={() => setLocation("/")}
                variant="outline"
                className="border-white/10 h-12 rounded-xl font-bold text-sm"
                data-testid="button-sell"
              >
                <ArrowUpRight className="w-4 h-4 mr-1" />
                {language === "pt-BR" ? "Vender" : "Sell"}
              </Button>
              <Button 
                onClick={() => setLocation("/")}
                variant="outline"
                className="border-white/10 h-12 rounded-xl font-bold text-sm"
                data-testid="button-exchange"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                {language === "pt-BR" ? "Trocar" : "Swap"}
              </Button>
            </div>
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-3xl p-5 space-y-4"
        >
          <h3 className="font-display font-bold text-sm text-muted-foreground uppercase tracking-wider">
            {language === "pt-BR" ? "Estatísticas" : "Statistics"}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-muted-foreground">{language === "pt-BR" ? "Máxima 24h" : "24h High"}</p>
              <p className="text-sm font-bold">{formatPrice(getBasePrice() * 1.02)}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-muted-foreground">{language === "pt-BR" ? "Mínima 24h" : "24h Low"}</p>
              <p className="text-sm font-bold">{formatPrice(getBasePrice() * 0.98)}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-muted-foreground">{language === "pt-BR" ? "Volume 24h" : "24h Volume"}</p>
              <p className="text-sm font-bold">
                {currency === "BTC" ? "R$ 2.5B" : currency === "USDT" ? "R$ 850M" : "R$ 125M"}
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-muted-foreground">{language === "pt-BR" ? "Cap. Mercado" : "Market Cap"}</p>
              <p className="text-sm font-bold">
                {currency === "BTC" ? "R$ 6.5T" : currency === "USDT" ? "R$ 580B" : "-"}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
