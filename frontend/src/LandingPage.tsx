import React, { useState, useEffect } from 'react';
import { Rocket, Cpu, ChevronRight, BookOpen, Wand2, Github, Star, Moon, Sun, Flame, Zap } from 'lucide-react';
import axios from 'axios';

interface LandingPageProps {
  onStart: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, theme, toggleTheme }) => {
  const [stars, setStars] = useState<number | null>(null);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    axios.get('https://api.github.com/repos/Taiwrash/modman')
      .then(res => setStars(res.data.stargazers_count))
      .catch(() => setStars(null));
  }, []);

  const handleIconClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);
  };

  return (
    <div className="min-h-screen bg-rams-light dark:bg-rams-dark text-[#1A1A1A] dark:text-[#E0E0E0] font-sans transition-colors duration-300 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      
      <div className="absolute top-8 right-8 z-20">
        <button 
          type="button"
          onClick={toggleTheme} 
          className="p-3 opacity-40 hover:opacity-100 cursor-pointer transition-all border border-transparent hover:border-black/10 dark:hover:border-white/10"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>

      <div className="max-w-3xl space-y-12 relative z-10">
        <div className="space-y-4">
          <div className="flex justify-center mb-16">
            <div 
              onClick={handleIconClick}
              className={`relative inline-block animate-float-glow cursor-pointer select-none transition-all active:scale-90 ${isClicked ? 'animate-pop' : ''}`}
            >
              {/* Computational Fragments */}
              <div className="absolute -top-12 -left-12 text-[8px] font-bold text-rams-blue opacity-20 animate-float-slow select-none pointer-events-none">0xFF2A</div>
              <div className="absolute -bottom-8 -right-16 text-[8px] font-bold text-rams-blue opacity-20 animate-float-reverse select-none pointer-events-none">MOV R0, #1</div>
              <div className="absolute top-0 -right-20 text-[8px] font-bold text-rams-blue opacity-10 animate-pulse select-none pointer-events-none">SIMD_VEC_8X</div>
              
              {/* Decorative corner elements */}
              <div className={`absolute -top-4 -left-4 w-10 h-10 border-t-2 border-l-2 border-rams-blue transition-all duration-300 ${isClicked ? '-translate-x-4 -translate-y-4 opacity-100' : 'opacity-40'}`} />
              <div className={`absolute -bottom-4 -right-4 w-10 h-10 border-b-2 border-r-2 border-rams-blue transition-all duration-300 ${isClicked ? 'translate-x-4 translate-y-4 opacity-100' : 'opacity-40'}`} />
              
              {/* Main Container */}
              <div className="relative p-12 bg-white dark:bg-[#1A1A1A] border border-black/10 dark:border-white/10 shadow-2xl flex items-center justify-center min-w-[160px] overflow-hidden group">
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
                
                {/* Scanline Effect */}
                <div className="absolute inset-0 w-full h-[2px] bg-rams-blue/10 animate-scanline pointer-events-none" />

                <div className="relative">
                  {/* Glitch Layers */}
                  <span className={`text-5xl font-black tracking-tighter text-rams-blue relative z-10 block italic transition-all duration-75 ${isClicked ? 'animate-glitch' : ''}`}>
                    MOJO
                  </span>
                  
                  {/* Ghost Layers on Hover/Click */}
                  <span className="absolute inset-0 text-5xl font-black tracking-tighter text-red-500 opacity-0 group-hover:opacity-20 group-hover:translate-x-1 -z-0 italic transition-all">
                    MOJO
                  </span>
                  <span className="absolute inset-0 text-5xl font-black tracking-tighter text-cyan-500 opacity-0 group-hover:opacity-20 group-hover:-translate-x-1 -z-0 italic transition-all">
                    MOJO
                  </span>

                  {/* Underline Decoration */}
                  <div className={`absolute -bottom-2 left-0 h-1 bg-rams-blue transition-all duration-500 ${isClicked ? 'w-full' : 'w-4'}`} />
                </div>
              </div>
              
              {/* Bits scatter on click */}
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none transition-all duration-500 ${isClicked ? 'opacity-100 scale-150' : 'opacity-0 scale-50'}`}>
                <div className="absolute top-0 left-0 text-[10px] font-bold text-rams-blue">0</div>
                <div className="absolute bottom-0 right-0 text-[10px] font-bold text-rams-blue">1</div>
                <div className="absolute top-1/2 -right-4 text-[10px] font-bold text-rams-blue">0</div>
                <div className="absolute -bottom-4 left-1/4 text-[10px] font-bold text-rams-blue">1</div>
              </div>

              {/* Floating accent blocks */}
              <div className={`absolute -top-2 -right-6 w-4 h-4 bg-rams-blue/20 transition-transform duration-500 ${isClicked ? 'translate-x-8 -translate-y-8 rotate-45' : ''}`} />
              <div className={`absolute -bottom-6 -left-2 w-8 h-2 bg-rams-blue transition-transform duration-500 ${isClicked ? '-translate-x-8 translate-y-4' : ''}`} />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Tour of <span className="text-rams-blue">Mojo</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
            Master the future of high-performance computing. 
            An interactive journey through Mojo's syntax, ownership model, and hardware-level abstractions.
          </p>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4">
            <button
              onClick={onStart}
              className="group w-full sm:w-auto px-8 py-4 bg-[#1A1A1A] dark:bg-white text-white dark:text-black rounded-none font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-rams-blue dark:hover:bg-rams-blue hover:text-white transition-all active:scale-95"
            >
              Start the Tour
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <a
              href="https://github.com/Taiwrash/modman"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-4 border border-black/10 dark:border-white/10 rounded-none font-bold text-sm tracking-widest uppercase hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            >
              <Github size={18} />
              Star on GitHub
              {stars !== null && (
                <span className="flex items-center gap-1 ml-2 opacity-60">
                  <Star size={14} className="fill-current" />
                  {stars}
                </span>
              )}
            </a>
          </div>
        </div>
      </div>

      <footer className="absolute bottom-8 text-[10px] font-bold tracking-[0.2em] uppercase opacity-30 z-10">
        <a href="https://x.com/taiwrash" target="_blank" rel="noopener noreferrer" className="underline decoration-rams-blue/30 underline-offset-4 hover:text-rams-blue hover:decoration-rams-blue transition-all">
          Built by Taiwrash // x.com/taiwrash
        </a>
      </footer>
    </div>
  );
};

export default LandingPage;
