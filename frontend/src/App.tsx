import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { Play, Share2, Wand2, BookOpen, CheckCircle2, AlertCircle, Sun, Moon, Rocket, Cpu, Binary, ChevronLeft, ChevronRight, ExternalLink, Menu, RefreshCcw } from 'lucide-react';
import LandingPage from './LandingPage';
import ReactMarkdown from 'react-markdown';

interface Activity {
  id: string;
  category: 'FOUNDATION' | 'PROJECT';
  title: string;
  subtitle: string;
  code: string;
  docs: string;
  manual_link?: string;
}

// Improved manual frontmatter and code block parser
const parseLessonMarkdown = (fileContent: string) => {
  const match = fileContent.match(/^---\r?\n([\s\S]+?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, content: fileContent, code: '' };
  
  const yamlBlock = match[1];
  const markdownContent = match[2];
  const data: any = {};
  
  // Parse simple YAML
  yamlBlock.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      data[key] = value;
    }
  });

  // Extract code from Mojo code block
  const codeMatch = markdownContent.match(/```mojo\r?\n([\s\S]+?)\r?\n```/);
  let code = codeMatch ? codeMatch[1] : '';
  
  // Clean the code: ensure uniform indentation and no hidden characters
  code = code
    .replace(/\t/g, '    ') // Replace tabs with 4 spaces
    .replace(/\r/g, '')     // Remove carriage returns
    .split('\n')
    .map(line => line.trimEnd()) // Remove trailing whitespace
    .join('\n')
    .trim();                // Trim leading/trailing newlines from the block
  
  // Remove code block from documentation content to avoid double display
  const content = markdownContent.replace(/```mojo\r?\n[\s\S]+?\r?\n```/, '').trim();
  
  return { data, content, code };
};

// Load curriculum dynamically from Markdown files
const modules = import.meta.glob('../../curriculum/*.md', { query: '?raw', eager: true });
const ACTIVITIES: Activity[] = Object.values(modules).map((mod: any) => {
  const { data, content, code } = parseLessonMarkdown(mod.default);
  return {
    ...data,
    docs: content,
    code: code || (data as any).code || ''
  } as Activity;
})
.filter(a => a.id !== 'starter-template')
.sort((a, b) => {
  return (a.title || '').localeCompare(b.title || '');
});

import Insights from './Insights';

function App() {
  const [view, setView] = useState<'landing' | 'studio' | 'insights'>('landing');
  
  // Safety check: Ensure we have activities before setting initial state
  const initialActivity = ACTIVITIES.length > 0 ? ACTIVITIES[0] : {
    id: 'loading',
    category: 'FOUNDATION',
    title: 'Loading...',
    subtitle: '',
    code: '',
    docs: 'Loading curriculum...'
  } as Activity;

  const [activeItem, setActiveItem] = useState(initialActivity);
  const [code, setCode] = useState(() => {
    const saved = localStorage.getItem(`modman-code-${initialActivity.id}`);
    return saved || initialActivity.code;
  });

  useEffect(() => {
    const saved = localStorage.getItem(`modman-code-${activeItem.id}`);
    if (saved !== null) {
      setCode(saved);
    } else {
      setCode(activeItem.code);
    }
    setOutput('');
    setStatus('IDLE');
  }, [activeItem.id]);

  useEffect(() => {
    if (activeItem.id !== 'loading') {
      localStorage.setItem(`modman-code-${activeItem.id}`, code);
    }
  }, [code, activeItem.id]);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'RUNNING' | 'FIXING' | 'ERROR'>('IDLE');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [version, setVersion] = useState('nightly');
  const [showNavigator, setShowNavigator] = useState(true);
  const [showDocs, setShowDocs] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('rams-theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
    
    if (window.innerWidth < 1024) {
      setShowNavigator(false);
      setShowDocs(false);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('rams-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleFormat = () => {
    const lines = code.split('\n');
    let indent = 0;
    const formatted = lines.map((line: string) => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('elif') || trimmed.startsWith('else:') || trimmed.startsWith('except')) {
        indent = Math.max(0, indent - 1);
      }
      const result = '    '.repeat(indent) + trimmed;
      if (trimmed.endsWith(':')) {
        indent++;
      }
      return result;
    }).join('\n');
    setCode(formatted);
    setOutput(prev => `${prev}\n[SYSTEM] CODE REFORMATTED`);
  };

  const handleReset = () => {
    if (confirm('REVERT TO DEFAULT CODE? ALL CHANGES TO THIS MODULE WILL BE ERASED.')) {
      localStorage.removeItem(`modman-code-${activeItem.id}`);
      setCode(activeItem.code);
    }
  };

  const selectActivity = (item: Activity) => {
    setActiveItem(item);
  };

  const handleRun = async () => {
    setStatus('RUNNING');
    setIsRunning(true);
    setOutput('EXECUTING TASK...');
    try {
      const res = await axios.post('/api/run', { 
        code,
        lesson_id: activeItem.id 
      });
      setOutput(res.data.output || res.data.error || 'SUCCESS.');
      setStatus(res.data.error ? 'ERROR' : 'IDLE');
    } catch (err: any) {
      setOutput(`FATAL ERROR: ${err.response?.data?.error || err.message}`);
      setStatus('ERROR');
    } finally {
      setIsRunning(false);
    }
  };

  const handleFix = async () => {
    if (!output) return;
    setStatus('FIXING');
    setIsFixing(true);
    try {
      const res = await axios.post('/api/fix', { code, error: output });
      if (res.data.fixed_code) {
        setCode(res.data.fixed_code);
        setOutput(prev => `${prev}\n\n[AGENT] SYSTEM REPAIR APPLIED`);
        setStatus('IDLE');
      }
    } catch (err) {
      console.error('Fix failed:', err);
      setStatus('ERROR');
    } finally {
      setIsFixing(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const res = await axios.post('/api/share', { code });
      const id = res.data.id;
      const url = `${window.location.origin}/p/${id}`;
      window.history.pushState({}, '', `/p/${id}`);
      navigator.clipboard.writeText(url);
      alert('SYSTEM: LINK REGISTERED TO CLIPBOARD');
    } catch (err) {
      console.error('Share failed:', err);
    } finally {
      setIsSharing(false);
    }
  };

  const handleNext = () => {
    const currentIndex = ACTIVITIES.findIndex(a => a.id === activeItem.id);
    if (currentIndex < ACTIVITIES.length - 1) {
      selectActivity(ACTIVITIES[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    const currentIndex = ACTIVITIES.findIndex(a => a.id === activeItem.id);
    if (currentIndex > 0) {
      selectActivity(ACTIVITIES[currentIndex - 1]);
    }
  };

  if (view === 'landing') {
    return <LandingPage onStart={() => setView('studio')} theme={theme} toggleTheme={toggleTheme} />;
  }

  if (view === 'insights') {
    return (
      <>
        <div className="fixed top-4 right-4 z-50">
          <button 
            onClick={() => setView('studio')}
            className="px-4 py-2 bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
          >
            CLOSE_INSIGHTS
          </button>
        </div>
        <Insights />
      </>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-rams-light dark:bg-rams-dark text-[#1A1A1A] dark:text-[#E0E0E0] font-mono transition-colors duration-300">
      
      {/* HEADER */}
      <header className="flex items-center justify-between h-14 px-4 md:px-6 border-b border-rams-border dark:border-rams-darkBorder bg-white dark:bg-[#1A1A1A] z-[100] relative pointer-events-auto">
        <div className="flex items-center space-x-4 md:space-x-12">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowNavigator(!showNavigator)}
              className="p-2 opacity-60 hover:opacity-100 transition-opacity"
            >
              <Menu size={18} />
            </button>
            <button 
              onClick={() => setView('landing')}
              className="text-xs font-bold tracking-[0.2em] uppercase opacity-80 hover:text-rams-blue transition-colors hidden sm:block"
            >
              Mojo Studio
            </button>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={handleRun}
              disabled={isRunning || isFixing}
              className={`h-8 px-4 md:px-8 text-[10px] font-bold tracking-widest uppercase transition-all border cursor-pointer pointer-events-auto active:scale-95 rounded-none ${
                status === 'RUNNING' ? 'bg-rams-blue text-white border-rams-blue' : 'bg-transparent border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5'
              } disabled:opacity-20 disabled:cursor-not-allowed`}
            >
              RUN
            </button>
            <button
              type="button"
              onClick={handleFormat}
              className="h-8 px-3 md:px-6 text-[10px] font-bold tracking-widest uppercase border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer pointer-events-auto active:scale-95 rounded-none"
            >
              FORMAT
            </button>
            <button
              type="button"
              onClick={handleFix}
              disabled={isFixing || isRunning || !output}
              className="h-8 px-3 md:px-6 text-[10px] font-bold tracking-widest uppercase border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer pointer-events-auto active:scale-95 rounded-none disabled:opacity-10 disabled:cursor-not-allowed"
            >
              FIX
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="h-8 px-3 text-[10px] font-bold tracking-widest uppercase border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer pointer-events-auto active:scale-95 rounded-none flex items-center gap-2"
              title="Reset to default"
            >
              <RefreshCcw size={12} />
              <span className="hidden lg:inline">RESET</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-6">
          <div className="flex items-center bg-black/5 dark:bg-white/5 px-2 h-8 border border-black/5 dark:border-white/5 rounded-none hidden md:flex">
            <span className="text-[9px] font-bold tracking-widest uppercase opacity-30 mr-2">Mojo</span>
            <select 
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="bg-transparent border-none text-[10px] font-bold focus:ring-0 cursor-pointer outline-none dark:text-white"
            >
              <option value="nightly" className="dark:bg-[#1A1A1A]">NIGHTLY</option>
              <option value="24.4" className="dark:bg-[#1A1A1A]">24.4</option>
              <option value="24.5" className="dark:bg-[#1A1A1A]">24.5</option>
            </select>
          </div>

          <button 
            onClick={() => setShowDocs(!showDocs)}
            className={`p-2 transition-all rounded-none border ${showDocs ? 'bg-rams-blue/10 border-rams-blue text-rams-blue opacity-100' : 'border-transparent opacity-40 hover:opacity-100'}`}
            title="Toggle Docs"
          >
            <BookOpen size={16} />
          </button>

          <button 
            type="button"
            onClick={toggleTheme} 
            className="p-2 opacity-40 hover:opacity-100 cursor-pointer pointer-events-auto rounded-none"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <div className="text-[9px] font-bold tracking-[0.2em] uppercase opacity-40 hidden sm:flex items-center">
             <div className={`w-1.5 h-1.5 rounded-none mr-2 ${status === 'RUNNING' ? 'bg-rams-blue animate-pulse' : 'bg-green-500'}`} />
             {status}
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="flex flex-1 overflow-hidden relative">
        
        {/* NAVIGATOR */}
        <nav className={`${showNavigator ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 absolute lg:relative z-[90] w-64 h-full border-r border-rams-border dark:border-rams-darkBorder bg-[#FAFAFA] dark:bg-[#121212] flex flex-col`}>
          <div className="flex-1 overflow-auto py-4">
            {['FOUNDATION', 'PROJECT'].map((cat) => (
              <div key={cat} className="mb-6 px-4">
                <h3 className="text-[9px] font-bold uppercase tracking-widest opacity-30 mb-4 px-2">{cat}S</h3>
                {ACTIVITIES.filter(a => a.category === cat).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      selectActivity(item);
                      if (window.innerWidth < 1024) setShowNavigator(false);
                    }}
                    className={`w-full text-left px-3 py-3 mb-1 transition-all rounded-none flex items-center group ${
                      activeItem.id === item.id 
                        ? 'bg-rams-blue/10 text-rams-blue' 
                        : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-60'
                    }`}
                  >
                    <div className="mr-3">
                      {cat === 'FOUNDATION' ? <Binary size={12} /> : <Rocket size={12} />}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold leading-none mb-1">{item.title}</div>
                      <div className="text-[9px] opacity-50 uppercase tracking-tighter">{item.subtitle}</div>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </nav>

        {/* EDITOR & OUTPUT */}
        <div className="flex flex-col flex-1 border-r border-rams-border dark:border-rams-darkBorder min-w-0">
          <div className="flex-1 bg-white dark:bg-[#151515] relative">
            <Editor
              height="100%"
              defaultLanguage="python"
              theme={theme === 'light' ? 'vs-light' : 'vs-dark'}
              value={code}
              onChange={(v) => setCode(v || '')}
              options={{
                fontSize: 12,
                fontFamily: '"JetBrains Mono", monospace',
                minimap: { enabled: false },
                lineNumbersMinChars: 4,
                padding: { top: 24 },
                renderLineHighlight: 'none',
                scrollbar: { vertical: 'hidden' }
              }}
            />
          </div>
          <div className="h-44 border-t border-rams-border dark:border-rams-darkBorder bg-[#FAFAFA] dark:bg-[#0F0F0F] p-4 md:p-6 flex flex-col">
            <h4 className="text-[9px] font-bold uppercase tracking-widest opacity-20 mb-3">System Log</h4>
            <div className="flex-1 font-mono text-[11px] overflow-auto opacity-70 leading-relaxed">
              {output || 'SYSTEM READY FOR TASK EXECUTION.'}
            </div>
          </div>
        </div>

        {/* DOCUMENTATION / PROJECT BRIEF */}
        <div className={`${showDocs ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 absolute right-0 lg:relative z-[90] w-full sm:w-[340px] h-full bg-white dark:bg-[#1A1A1A] flex flex-col shadow-[-20px_0_40px_rgba(0,0,0,0.02)]`}>
          <div className="p-6 md:p-10 flex flex-col h-full overflow-auto">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center space-x-3 opacity-30">
                <BookOpen size={14} />
                <h2 className="text-[9px] font-bold uppercase tracking-[0.2em]">Activity Brief</h2>
              </div>
              <button 
                onClick={() => setShowDocs(false)}
                className="lg:hidden p-2 opacity-40 hover:opacity-100"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            
            <div className="flex-1">
              <h1 className="text-xl font-medium tracking-tight mb-6">
                {activeItem.title}
              </h1>
              <div className="text-[13px] leading-[1.7] text-gray-500 dark:text-gray-400 font-sans prose dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    a: ({node, ...props}) => <a {...props} target="_blank" className="text-rams-blue hover:underline" />,
                    code: ({node, inline, ...props}: any) => 
                      inline 
                        ? <code className="bg-black/5 dark:bg-white/10 px-1 rounded text-rams-blue" {...props} />
                        : <code className="block bg-black/5 dark:bg-white/10 p-4 rounded my-4 overflow-auto" {...props} />,
                  }}
                >
                  {activeItem.docs}
                </ReactMarkdown>
                
                {activeItem.manual_link && (
                  <div className="mt-8 bg-black/5 dark:bg-white/5 p-4 border border-black/5 dark:border-white/5">
                    <p className="text-[10px] uppercase font-bold opacity-40 mb-2">Manual Link</p>
                    <a href={activeItem.manual_link} target="_blank" className="text-xs text-rams-blue flex items-center gap-1 hover:underline">
                      View Official Manual <ExternalLink size={10} />
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-black/5 dark:border-white/5 space-y-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrev}
                  disabled={ACTIVITIES.findIndex(a => a.id === activeItem.id) === 0}
                  className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase opacity-40 hover:opacity-100 disabled:opacity-10 disabled:cursor-not-allowed transition-all rounded-none"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={ACTIVITIES.findIndex(a => a.id === activeItem.id) === ACTIVITIES.length - 1}
                  className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase bg-rams-blue text-white px-4 py-2 rounded-none hover:bg-rams-blue/90 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>

              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between text-[9px] font-bold tracking-widest opacity-30 uppercase">
                  <span>Verification</span>
                  <span className="text-green-500">Local Only</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed italic">
                  {activeItem.category === 'PROJECT' 
                    ? "Project objective: Implement the missing logic in the editor to achieve a verified output."
                    : "Foundation module: Experiment with the code to understand the underlying hardware abstraction."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="h-8 px-6 bg-[#F5F5F5] dark:bg-[#121212] border-t border-rams-border dark:border-rams-darkBorder flex items-center justify-between text-[8px] font-bold tracking-[0.2em] opacity-30 uppercase">
        <div>
          <a href="https://x.com/taiwrash" target="_blank" rel="noopener noreferrer" className="underline decoration-rams-blue/30 underline-offset-4 hover:text-rams-blue hover:decoration-rams-blue transition-all">
            Built by Taiwrash // x.com/taiwrash
          </a>
        </div>
        <div className="flex space-x-8">
          <button 
            onClick={() => setView('insights')}
            className="hover:text-blue-500 transition-colors pointer-events-auto cursor-pointer"
          >
            MODMAN_INSIGHTS
          </button>
          <span>TASK_ID: {activeItem.id}</span>
          <span>STATUS: NOMINAL</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
