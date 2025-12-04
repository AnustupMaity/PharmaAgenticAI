import { LucideIcon } from "lucide-react";

interface SuggestionCardProps {
  icon: LucideIcon;
  title: string;
  query: string;
  onClick: (query: string) => void;
  index?: number;
}

const gradients = [
  'from-cyan-400/20 to-blue-500/20',
  'from-emerald-400/20 to-teal-500/20', 
  'from-purple-400/20 to-pink-500/20',
  'from-orange-400/20 to-red-500/20'
];

const iconColors = [
  'text-cyan-600 dark:text-cyan-400',
  'text-emerald-600 dark:text-emerald-400',
  'text-purple-600 dark:text-purple-400', 
  'text-orange-600 dark:text-orange-400'
];

export const SuggestionCard = ({ icon: Icon, title, query, onClick, index = 0 }: SuggestionCardProps) => {
  const gradient = gradients[index % gradients.length];
  const iconColor = iconColors[index % iconColors.length];

  return (
    <button
      onClick={() => onClick(query)}
      className="group relative p-6 h-full rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:border-primary/40 transition-all duration-500 text-left flex flex-col justify-start overflow-hidden hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] active:translate-y-0"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'
      }}
    >
      {/* Animated background gradient on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
      </div>

      {/* Floating particles effect */}
      <div className="absolute top-2 right-2 w-1 h-1 bg-cyan-400/60 rounded-full opacity-0 group-hover:opacity-100 animate-ping" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-4 left-4 w-0.5 h-0.5 bg-purple-400/60 rounded-full opacity-0 group-hover:opacity-100 animate-ping" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-4 w-0.5 h-0.5 bg-emerald-400/60 rounded-full opacity-0 group-hover:opacity-100 animate-ping" style={{ animationDelay: '1.5s' }} />

      <div className="relative z-10">
        <div className="flex items-start gap-4">
          <div className="relative p-3 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 group-hover:from-primary/20 group-hover:to-secondary/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
            {/* Pulsing background */}
            <div className="absolute inset-0 rounded-xl bg-primary/20 opacity-0 group-hover:opacity-100 animate-pulse" />
            <Icon className={`w-6 h-6 ${iconColor} relative z-10 group-hover:scale-110 transition-all duration-300`} />
            
            {/* Glow effect */}
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-50 blur-md transition-all duration-500`} />
          </div>
        </div>
        
        <div className="mt-4 flex-1 space-y-3">
          <h3 className="font-bold text-lg text-card-foreground group-hover:text-primary transition-all duration-300 group-hover:translate-x-1">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-all duration-300 line-clamp-2 leading-relaxed">
            {query}
          </p>
          
          {/* Animated arrow indicator */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-primary transition-all duration-300 pt-2">
            <span className="group-hover:translate-x-1 transition-transform duration-300">Click to explore</span>
            <div className="w-0 group-hover:w-6 h-0.5 bg-primary rounded-full transition-all duration-300" />
            <div className="w-0 group-hover:w-2 h-0.5 bg-primary/60 rounded-full transition-all duration-500 delay-75" />
          </div>
        </div>
      </div>

      {/* Border glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" style={{ padding: '1px' }} />
    </button>
  );
};