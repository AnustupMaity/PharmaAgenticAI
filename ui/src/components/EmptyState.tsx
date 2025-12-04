
import { Database, TrendingUp, FileText, Globe } from "lucide-react";
import { SuggestionCard } from "./SuggestionCard";

const suggestions = [
  {
    icon: TrendingUp,
    title: "Market Analysis",
    query: "What are the current trends in the oncology drug market?",
  },
  {
    icon: FileText,
    title: "Patent Research",
    query: "Find recent patents related to mRNA therapeutics",
  },
  {
    icon: Database,
    title: "Clinical Trials",
    query: "Show me ongoing phase 3 trials for diabetes treatments",
  },
  {
    icon: Globe,
    title: "Competitor Intelligence",
    query: "Analyze Pfizer's recent drug pipeline developments",
  },
];

interface EmptyStateProps {
  onSuggestionClick: (query: string) => void;
}

export const EmptyState = ({ onSuggestionClick }: EmptyStateProps) => {
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse-bright" style={{ animationDuration: '3s' }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-emerald-400/30 to-teal-500/30 rounded-full blur-3xl animate-pulse-bright" style={{ animationDuration: '4s', animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse-bright" style={{ animationDuration: '5s', animationDelay: '2s' }} />
        
        {/* DNA Double Helix Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dna-pattern" x="0" y="0" width="120" height="200" patternUnits="userSpaceOnUse">
              {/* Left strand circles */}
              <circle cx="30" cy="20" r="3" fill="#3b82f6" className="animate-dna-pulse">
                <animate attributeName="cy" values="20;40;60;80;100;120;140;160;180;20" dur="8s" repeatCount="indefinite" />
                <animate attributeName="r" values="3;4;3;2;3;4;3;2;3" dur="8s" repeatCount="indefinite" />
              </circle>
              <circle cx="30" cy="60" r="3" fill="#06b6d4" className="animate-dna-pulse">
                <animate attributeName="cy" values="60;80;100;120;140;160;180;20;40;60" dur="8s" repeatCount="indefinite" />
                <animate attributeName="r" values="3;2;3;4;3;2;3;4;3" dur="8s" repeatCount="indefinite" />
              </circle>
              <circle cx="30" cy="100" r="3" fill="#3b82f6" className="animate-dna-pulse">
                <animate attributeName="cy" values="100;120;140;160;180;20;40;60;80;100" dur="8s" repeatCount="indefinite" />
                <animate attributeName="r" values="3;4;3;2;3;4;3;2;3" dur="8s" repeatCount="indefinite" />
              </circle>
              <circle cx="30" cy="140" r="3" fill="#06b6d4" className="animate-dna-pulse">
                <animate attributeName="cy" values="140;160;180;20;40;60;80;100;120;140" dur="8s" repeatCount="indefinite" />
                <animate attributeName="r" values="3;2;3;4;3;2;3;4;3" dur="8s" repeatCount="indefinite" />
              </circle>
              
              {/* Right strand circles */}
              <circle cx="90" cy="180" r="3" fill="#10b981" className="animate-dna-pulse">
                <animate attributeName="cy" values="180;160;140;120;100;80;60;40;20;180" dur="8s" repeatCount="indefinite" />
                <animate attributeName="r" values="3;4;3;2;3;4;3;2;3" dur="8s" repeatCount="indefinite" />
              </circle>
              <circle cx="90" cy="140" r="3" fill="#059669" className="animate-dna-pulse">
                <animate attributeName="cy" values="140;120;100;80;60;40;20;180;160;140" dur="8s" repeatCount="indefinite" />
                <animate attributeName="r" values="3;2;3;4;3;2;3;4;3" dur="8s" repeatCount="indefinite" />
              </circle>
              <circle cx="90" cy="100" r="3" fill="#10b981" className="animate-dna-pulse">
                <animate attributeName="cy" values="100;80;60;40;20;180;160;140;120;100" dur="8s" repeatCount="indefinite" />
                <animate attributeName="r" values="3;4;3;2;3;4;3;2;3" dur="8s" repeatCount="indefinite" />
              </circle>
              <circle cx="90" cy="60" r="3" fill="#059669" className="animate-dna-pulse">
                <animate attributeName="cy" values="60;40;20;180;160;140;120;100;80;60" dur="8s" repeatCount="indefinite" />
                <animate attributeName="r" values="3;2;3;4;3;2;3;4;3" dur="8s" repeatCount="indefinite" />
              </circle>
              
              {/* Connecting base pairs */}
              <line x1="30" y1="20" x2="90" y2="180" stroke="#6366f1" strokeWidth="1.5" opacity="0.6">
                <animate attributeName="y1" values="20;40;60;80;100;120;140;160;180;20" dur="8s" repeatCount="indefinite" />
                <animate attributeName="y2" values="180;160;140;120;100;80;60;40;20;180" dur="8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0.8;0.6;0.4;0.6;0.8;0.6;0.4;0.6" dur="8s" repeatCount="indefinite" />
              </line>
              <line x1="30" y1="60" x2="90" y2="140" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.6">
                <animate attributeName="y1" values="60;80;100;120;140;160;180;20;40;60" dur="8s" repeatCount="indefinite" />
                <animate attributeName="y2" values="140;120;100;80;60;40;20;180;160;140" dur="8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0.4;0.6;0.8;0.6;0.4;0.6;0.8;0.6" dur="8s" repeatCount="indefinite" />
              </line>
              <line x1="30" y1="100" x2="90" y2="100" stroke="#06b6d4" strokeWidth="1.5" opacity="0.7">
                <animate attributeName="y1" values="100;120;140;160;180;20;40;60;80;100" dur="8s" repeatCount="indefinite" />
                <animate attributeName="y2" values="100;80;60;40;20;180;160;140;120;100" dur="8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0.8;0.7;0.5;0.7;0.8;0.7;0.5;0.7" dur="8s" repeatCount="indefinite" />
              </line>
              <line x1="30" y1="140" x2="90" y2="60" stroke="#10b981" strokeWidth="1.5" opacity="0.6">
                <animate attributeName="y1" values="140;160;180;20;40;60;80;100;120;140" dur="8s" repeatCount="indefinite" />
                <animate attributeName="y2" values="60;40;20;180;160;140;120;100;80;60" dur="8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0.5;0.6;0.8;0.6;0.5;0.6;0.8;0.6" dur="8s" repeatCount="indefinite" />
              </line>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dna-pattern)" />
        </svg>

        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-cyan-400/60 rounded-full animate-float-vivid shadow-lg shadow-cyan-400/20" style={{ animationDuration: '6s' }} />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-blue-400/60 rounded-full animate-float-vivid shadow-lg shadow-blue-400/20" style={{ animationDuration: '8s', animationDelay: '1s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-4 h-4 bg-emerald-400/60 rounded-full animate-float-vivid shadow-lg shadow-emerald-400/20" style={{ animationDuration: '7s', animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 right-1/3 w-1.5 h-1.5 bg-teal-400/60 rounded-full animate-float-vivid shadow-lg shadow-teal-400/20" style={{ animationDuration: '9s', animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/6 w-2.5 h-2.5 bg-purple-400/60 rounded-full animate-float-vivid shadow-lg shadow-purple-400/20" style={{ animationDuration: '10s', animationDelay: '4s' }} />
        <div className="absolute top-3/4 right-1/6 w-3.5 h-3.5 bg-indigo-400/60 rounded-full animate-float-vivid shadow-lg shadow-indigo-400/20" style={{ animationDuration: '11s', animationDelay: '5s' }} />
        
        {/* Grid Pattern with Animation */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/[0.04] to-transparent animate-grid-shimmer" 
             style={{ 
               backgroundImage: 'linear-gradient(to right, rgb(59 130 246 / 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgb(59 130 246 / 0.06) 1px, transparent 1px)',
               backgroundSize: '4rem 4rem'
             }} 
        />
      </div>

      {/* Content */}
      <div className="max-w-5xl w-full space-y-16 relative z-10">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 mb-4 relative animate-bounce-in">
            <Database className="w-10 h-10 text-blue-600 dark:text-blue-400 relative z-10" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 animate-pulse" />
            
            {/* Orbital rings */}
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 animate-spin" style={{ animationDuration: '8s' }} />
            <div className="absolute inset-2 rounded-full border border-blue-400/20 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-br from-cyan-400 via-blue-500 to-emerald-500 bg-clip-text text-transparent animate-bounce-in" style={{ animationDelay: '0.2s' }}>
            Accelerated Drug Development Research
          </h1>
          <p className="text-lg text-muted-foreground max-w-8xl mx-auto leading-relaxed animate-bounce-in" style={{ animationDelay: '0.4s' }}>
            Get real-time, grounded intelligence across clinical, regulatory, and market domains powered by advanced AI agents.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="animate-card-entrance"
              style={{ 
                animationDelay: `${index * 150}ms`,
                animationFillMode: 'both'
              }}
            >
              <SuggestionCard
                icon={suggestion.icon}
                title={suggestion.title}
                query={suggestion.query}
                onClick={onSuggestionClick}
                index={index}
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float-vivid {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg) scale(1);
            opacity: 0.6;
          }
          20% {
            transform: translateY(-25px) translateX(15px) rotate(72deg) scale(1.1);
            opacity: 0.8;
          }
          40% {
            transform: translateY(-50px) translateX(-10px) rotate(144deg) scale(0.9);
            opacity: 1;
          }
          60% {
            transform: translateY(-30px) translateX(20px) rotate(216deg) scale(1.2);
            opacity: 0.9;
          }
          80% {
            transform: translateY(-10px) translateX(-5px) rotate(288deg) scale(1.05);
            opacity: 0.7;
          }
          100% {
            transform: translateY(0) translateX(0) rotate(360deg) scale(1);
            opacity: 0.6;
          }
        }

        @keyframes pulse-bright {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
        }

        @keyframes grid-shimmer {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        @keyframes dna-pulse {
          0%, 100% {
            filter: brightness(1) drop-shadow(0 0 2px currentColor);
          }
          50% {
            filter: brightness(1.5) drop-shadow(0 0 8px currentColor);
          }
        }

        .animate-float-vivid {
          animation: float-vivid ease-in-out infinite;
        }

        .animate-pulse-bright {
          animation: pulse-bright ease-in-out infinite;
        }

        .animate-grid-shimmer {
          animation: grid-shimmer ease-in-out infinite 4s;
        }

        .animate-dna-pulse {
          animation: dna-pulse ease-in-out infinite 2s;
        }

        @keyframes card-entrance {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.9) rotateX(15deg);
          }
          60% {
            opacity: 0.8;
            transform: translateY(-5px) scale(1.02) rotateX(-2deg);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1) rotateX(0deg);
          }
        }

        @keyframes card-pop {
          0% {
            transform: scale(1) rotateY(0deg);
          }
          50% {
            transform: scale(1.05) rotateY(5deg);
          }
          100% {
            transform: scale(1) rotateY(0deg);
          }
        }

        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3) translateY(-50px);
          }
          50% {
            opacity: 1;
            transform: scale(1.05) translateY(-10px);
          }
          70% {
            transform: scale(0.95) translateY(5px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-card-entrance {
          animation: card-entrance 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-card-pop {
          animation: card-pop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .animate-bounce-in {
          animation: bounce-in 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }
      `}</style>
    </div>
  );
};