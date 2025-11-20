import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Lock, Mail } from 'lucide-react';

interface LoginPageProps {
  onSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('Supabase Auth Error:', error);

        // Provide more user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Falsche E-Mail-Adresse oder Passwort');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse');
        } else if (error.message.includes('Invalid email')) {
          throw new Error('Ungültige E-Mail-Adresse');
        } else {
          throw error;
        }
      }

      if (data.user) {
        onSuccess();
      }
    } catch (err) {
      const error = err as { message?: string };
      const errorMessage = error.message || 'Login fehlgeschlagen. Bitte versuchen Sie es erneut.';
      console.error('Login error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle =
    'w-full p-3.5 bg-white border border-stone-300 text-stone-900 rounded-xl text-sm focus:ring-2 focus:ring-stone-400 outline-none transition-colors';
  const labelStyle = 'block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1';

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full text-center border border-stone-100">
        <div className="bg-xmas-red/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-xmas-red">
          <Lock size={32} />
        </div>
        <h2 className="text-2xl font-serif font-bold mb-6 text-stone-800">Admin Login</h2>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <label className="block text-left">
            <span className={labelStyle}>
              <Mail size={12} className="inline mr-1" />
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputStyle}
              required
              disabled={isLoading}
            />
          </label>
          <label className="block text-left">
            <span className={labelStyle}>Passwort</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputStyle}
              required
              disabled={isLoading}
            />
          </label>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-stone-800 text-white py-4 rounded-xl font-bold hover:bg-stone-900 transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            {isLoading ? 'Einloggen...' : 'Einloggen'}
          </button>
        </form>
      </div>
    </div>
  );
};
