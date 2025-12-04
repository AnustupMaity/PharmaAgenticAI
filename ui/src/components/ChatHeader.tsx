import { Sparkles, Home, Brain } from "lucide-react";
import { Link } from "react-router-dom";

export const ChatHeader = () => {
  return (
    <header className="border-b border-border bg-gradient-to-r from-card via-card to-card/95 backdrop-blur-sm shadow-lg px-6 py-4 flex-shrink-0 sticky top-0 z-50">
      <div className="max-w-8xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className="flex items-center gap-3 group cursor-pointer transition-all duration-300 hover:scale-105"
          >
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group-hover:shadow-blue-500/25">
              <Brain className="w-6 h-6 text-white transition-transform duration-300 group-hover:rotate-12" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-purple-500/20 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-2xl tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">
                Pharma<span className="font-light text-transparent bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text">Brain</span>
              </span>
              <span className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-300">
                AI-Powered Drug Intelligence
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Home Button */}
          <Link 
            to="/" 
            className="flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted transition-all duration-300 rounded-lg text-muted-foreground hover:text-foreground group"
          >
            <Home className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
            <span className="font-medium hidden sm:block">Home</span>
          </Link>

          {/* Agents Status */}
          <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-700/30 shadow-sm">
            <div className="relative flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 animate-pulse shadow-sm">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 animate-ping opacity-75" />
              </div>
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-emerald-700 dark:text-emerald-300 font-semibold text-sm">4 Agents</span>
              <span className="text-emerald-600/80 dark:text-emerald-400/80 text-xs">Active & Ready</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
