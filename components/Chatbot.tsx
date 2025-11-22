import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Bot } from 'lucide-react';
import { dataService } from '../services/dataService';
import { supabase } from '../services/supabase';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const EXAMPLE_QUESTIONS = [
  "Wann geht's los?",
  'Was soll ich mitbringen?',
  'Gibt es einen Dresscode?',
  'Wie ist der Ablauf?',
];

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: 'Ho ho ho! 🎅 Ich bin Rudolph. Wie kann ich dir bei der Weihnachtsfeier helfen?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const getSystemInstruction = async () => {
    const participants = await dataService.getAll();
    const config = await dataService.getConfig();
    const attending = participants.filter((p) => p.status === 'attending');
    const foodList = attending
      .filter((p) => p.food?.name)
      .map((p) => `- ${p.food?.name} (${p.food?.category})`)
      .join('\n');

    return `Du bist Rudolph, der KI-Assistent für die "${config.title}".
    Fakten: Datum ${config.date}, Ort ${config.location}, Gäste ${attending.length}/${config.maxGuests}.
    Buffet: ${foodList}.
    Programm: ${config.program}.
    Sei kurz, hilfreich und weihnachtlich.`;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg = text;
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const systemInstruction = await getSystemInstruction();

      const { data, error } = await supabase.functions.invoke('gemini-ai', {
        body: {
          action: 'chat',
          payload: {
            message: userMsg,
            systemInstruction,
          },
        },
      });

      if (error) throw error;

      setMessages((prev) => [
        ...prev,
        { role: 'model', text: data.text || 'Mein Rentier-Navi spinnt.' },
      ]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages((prev) => [...prev, { role: 'model', text: 'Gerade zu viel Glühwein...' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-xl shadow-stone-900/20 z-50 transition-all transform hover:scale-105 border-4 border-white ${isOpen ? 'bg-stone-800 rotate-90' : 'bg-xmas-red'}`}
      >
        {isOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <MessageCircle size={28} className="text-white" />
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[90vw] sm:w-96 h-[500px] max-h-[80vh] bg-white rounded-3xl shadow-2xl flex flex-col z-50 border border-white overflow-hidden animate-fade-in">
          <div className="bg-xmas-red p-5 flex items-center gap-3 text-white">
            <div className="bg-white/20 p-2 rounded-full">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-bold font-serif">Rudolph</h3>
              <p className="text-xs text-red-100 opacity-80">Weihnachts-Bot</p>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-5 space-y-4 bg-stone-50 relative">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-stone-800 text-white rounded-br-none shadow-md' : 'bg-white text-stone-700 border border-stone-100 rounded-bl-none shadow-sm'}`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-stone-400 p-3 rounded-2xl text-xs flex items-center gap-2">
                  <Sparkles size={12} className="animate-spin" /> Tippt...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />

            {/* FAQ Chips (Show only if no user interaction yet) */}
            {messages.length === 1 && !isLoading && (
              <div className="mt-6 flex flex-wrap gap-2">
                {EXAMPLE_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="bg-white border border-xmas-gold/30 text-stone-600 text-xs px-3 py-2 rounded-lg shadow-sm hover:bg-xmas-gold hover:text-white transition-colors active:scale-95"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={handleFormSubmit}
            className="p-4 bg-white border-t border-stone-100 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Schreib etwas..."
              className="flex-grow p-3 bg-white text-stone-900 rounded-xl text-sm border border-stone-200 focus:ring-2 focus:ring-xmas-red/30 outline-none transition-colors"
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-xmas-red text-white p-3 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors shadow-md shadow-red-200"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
