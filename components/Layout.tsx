import React, { useEffect, useState } from 'react';
import { Snowflake } from 'lucide-react';
import { Chatbot } from './Chatbot';
import { dataService, CONFIG_UPDATED_EVENT } from '../services/dataService';
import { EventConfig, DEFAULT_EVENT_CONFIG } from '../types';
import headerImage from '../images/Selbst-Selig-Hero-final.svg';

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
            src={headerImage}
            alt="Selbst & Selig Weihnachtsfeier"
            className="w-full h-auto object-cover min-h-[200px] max-h-[350px] opacity-90"
          />
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 sm:p-8 max-w-6xl -mt-2 relative z-20">
        {children}
      </main>

      <footer className="bg-white border-t border-stone-100 text-stone-400 py-8 text-center text-sm mt-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-4">
            <a
              href="#/datenschutz"
              onClick={safeNavigate('#/datenschutz')}
              className="hover:text-stone-600 transition-colors"
            >
              Datenschutzerklärung
            </a>
            <span>•</span>
            <a
              href="#/impressum"
              onClick={safeNavigate('#/impressum')}
              className="hover:text-stone-600 transition-colors"
            >
              Impressum
            </a>
          </div>
        </div>
      </footer>

      <Chatbot />
    </div>
  );
};
