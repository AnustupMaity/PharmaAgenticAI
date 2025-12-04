import { FormEvent, KeyboardEvent, useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles, Zap, Brain, Lightbulb } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  isLoading: boolean;
}

export const ChatInput = ({ value, onChange, onSubmit, isLoading }: ChatInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const suggestions = [
    { icon: Brain, text: "Analyze drug pipeline for oncology market", category: "Analysis" },
    { icon: Zap, text: "Find patents for mRNA therapeutics", category: "Patents" },
    { icon: Lightbulb, text: "Clinical trials for diabetes treatments", category: "Trials" },
    { icon: Sparkles, text: "Competitor intelligence on Pfizer", category: "Intelligence" },
  ];

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e as any);
    }
    if (e.key === "Escape") {
      setShowSuggestions(false);
      textareaRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [value]);

  return (
    <div className="flex-shrink-0 border-t border-border/50 bg-gradient-to-b from-card via-card to-card/95 backdrop-blur-sm pt-6 pb-8 relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-2xl animate-pulse" />
        <div className="absolute top-0 right-1/4 w-40 h-40 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <form onSubmit={onSubmit} className="max-w-8xl mx-auto px-4 md:px-6 relative z-10">
        {/* Quick Suggestions */}
        {showSuggestions && !value && (
          <div className="mb-4 animate-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  className="flex items-center gap-3 p-3 text-left bg-gradient-to-r from-muted/30 to-muted/20 hover:from-muted/50 hover:to-muted/40 rounded-xl border border-border/30 hover:border-primary/30 transition-all duration-300 group"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
                    <suggestion.icon className="w-4 h-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300 truncate">
                      {suggestion.text}
                    </div>
                    <div className="text-xs text-muted-foreground">{suggestion.category}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Input Container */}
        <div className={`relative group transition-all duration-500 ${isFocused ? 'scale-[1.02]' : ''}`}>
          {/* Glow Effect */}
          <div className={`absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur-lg transition-opacity duration-500 ${isFocused ? 'opacity-100' : 'opacity-0'}`} />
          
          <div className={`relative bg-gradient-to-br from-background via-background to-muted/10 rounded-2xl border-2 transition-all duration-300 shadow-lg ${
            isFocused 
              ? 'border-primary/50 shadow-primary/20 shadow-2xl' 
              : 'border-border/30 hover:border-border/50'
          }`}>
            <div className="flex items-end p-3">
              {/* Textarea Container */}
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    setIsFocused(true);
                    setShowSuggestions(true);
                  }}
                  onBlur={() => {
                    setIsFocused(false);
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  placeholder="Ask anything about pharmaceutical intelligence..."
                  className="w-full min-h-[44px] max-h-[120px] px-3 py-3 resize-none bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/70 text-sm leading-relaxed"
                  disabled={isLoading}
                  rows={1}
                />
                
                {/* Character Count */}
                {value.length > 0 && (
                  <div className="absolute bottom-2 right-2 text-xs text-muted-foreground/60">
                    {value.length}/2000
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="ml-3 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={!value.trim() || isLoading}
                  className={`relative h-10 w-10 rounded-lg transition-all duration-300 flex items-center justify-center group overflow-hidden ${
                    !value.trim() || isLoading
                      ? 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                  }`}
                >
                  {/* Button Background Animation */}
                  {value.trim() && !isLoading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse" />
                  )}
                  
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      {value.trim() && (
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-400/30 to-blue-500/30 animate-ping" />
                      )}
                    </>
                  )}
                </button>

                {/* Voice Input Button (Future Feature) */}
                <button
                  type="button"
                  className="h-6 w-6 rounded-md bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all duration-300 flex items-center justify-center opacity-50 cursor-not-allowed"
                  disabled
                  title="Voice input (Coming soon)"
                >
                  <Sparkles className="h-2.5 w-2.5" />
                </button>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="px-3 pb-3 pt-2 border-t border-border/20">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4 text-muted-foreground/80">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-muted/40 rounded text-[10px] font-mono border border-border/30">Enter</kbd>
                    to send
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-muted/40 rounded text-[10px] font-mono border border-border/30">Shift</kbd>
                    <kbd className="px-1.5 py-0.5 bg-muted/40 rounded text-[10px] font-mono border border-border/30">Enter</kbd>
                    for new line
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-muted-foreground/60">
                    <Brain className="h-3 w-3" />
                    {/* <span className="text-[10px] font-medium">Powered by AI Agents</span> */}
                  </div>
                  {isLoading && (
                    <div className="flex items-center gap-1 text-primary/80 animate-pulse">
                      <Sparkles className="h-3 w-3" />
                      <span className="text-[10px] font-medium">Thinking...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};