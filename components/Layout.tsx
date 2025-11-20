import React, { useEffect, useState } from 'react';
import { Snowflake } from 'lucide-react';
import { Chatbot } from './Chatbot';
import { dataService, CONFIG_UPDATED_EVENT } from '../services/dataService';
import { EventConfig, DEFAULT_EVENT_CONFIG } from '../types';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<EventConfig>(DEFAULT_EVENT_CONFIG);

  useEffect(() => {
    const loadConfig = async () => {
      const c = await dataService.getConfig();
      setConfig(c);
    };
    loadConfig();

    const handleConfigUpdate = async () => {
      const c = await dataService.getConfig();
      setConfig(c);
    };
    window.addEventListener(CONFIG_UPDATED_EVENT, handleConfigUpdate);
    return () => window.removeEventListener(CONFIG_UPDATED_EVENT, handleConfigUpdate);
  }, []);

  const safeNavigate = (hash: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.hash = hash;
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-xmas-cream transition-colors duration-500">
      {/* Banner Header */}
      <header className="relative bg-xmas-green w-full shadow-md overflow-hidden">
        <div className="w-full max-w-[1400px] mx-auto relative">
          <img
            src="https://cdn.andersundbesser.de/a-und-b/sus-25/header.png"
            alt="Selbst & Selig Weihnachtsfeier"
            className="w-full h-auto object-cover min-h-[200px] max-h-[350px] opacity-90"
          />
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 sm:p-8 max-w-6xl -mt-2 relative z-20">
        {children}
      </main>

      <footer className="bg-white border-t border-stone-100 text-stone-400 py-12 text-center text-sm mt-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-6 text-xmas-red/20">
            <Snowflake size={32} />
          </div>
          <p className="font-serif text-stone-600 mb-2">
            &copy; {new Date().getFullYear()} {config.title} Community.
          </p>
          <p className="text-stone-400">
            Gemacht mit <span className="text-xmas-pink">❤️</span> für Solo-Selbstständige.
          </p>

          {/* DEV / DEMO LINKS */}
          <div className="mt-8 pt-6 border-t border-stone-50 inline-flex flex-wrap justify-center gap-4 text-xs text-stone-400">
            <span className="font-bold uppercase tracking-widest">Demo:</span>
            <a
              href="#/admin"
              onClick={safeNavigate('#/admin')}
              className="hover:text-xmas-red transition-colors"
            >
              Admin
            </a>
            <span>•</span>
            <a
              href="#/p/a3f7k9m2"
              onClick={safeNavigate('#/p/a3f7k9m2')}
              className="hover:text-xmas-red transition-colors"
            >
              Gast (Anna)
            </a>
            <span>•</span>
            <a
              href="#/p/b8x2l1p9"
              onClick={safeNavigate('#/p/b8x2l1p9')}
              className="hover:text-xmas-red transition-colors"
            >
              Gast (Markus)
            </a>
            <span>•</span>
            <a
              href="#/p/judith-demo"
              onClick={safeNavigate('#/p/judith-demo')}
              className="hover:text-xmas-red transition-colors"
            >
              Gast (Judith)
            </a>
          </div>
        </div>
      </footer>

      <Chatbot />
    </div>
  );
};
