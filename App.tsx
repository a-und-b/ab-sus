import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { GuestPage } from './pages/GuestPage';
import { AdminPage } from './pages/AdminPage';

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);

    // Handle initial load with empty hash
    if (!window.location.hash) {
      window.location.hash = '#/';
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.hash = path;
  };

  const renderContent = () => {
    // Routes
    // 1. Admin: #/admin
    if (currentRoute.startsWith('#/admin')) {
      return <AdminPage />;
    }

    // 2. Participant: #/p/:id
    const participantMatch = currentRoute.match(/^#\/p\/(.+)$/);
    if (participantMatch) {
      const participantId = participantMatch[1];
      return <GuestPage id={participantId} />;
    }

    // 3. Home/Landing (Simulated)
    return (
      <div className="text-center py-20">
        <h2 className="text-4xl font-serif text-xmas-red mb-6">🎄</h2>
        <h2 className="text-2xl font-bold text-stone-800 mb-4">Willkommen!</h2>
        <p className="text-stone-600 max-w-md mx-auto mb-8">
          Dies ist das Portal für die Selbst & Selig Weihnachtsfeier. Bitte nutze den Link aus
          deiner Einladungs-E-Mail, um auf deine persönliche Seite zu gelangen.
        </p>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg max-w-md mx-auto text-left text-sm text-amber-800">
          <strong>Demo Modus:</strong>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <a
                href="#/admin"
                onClick={navigate('#/admin')}
                className="underline font-bold cursor-pointer hover:text-amber-900"
              >
                Zum Admin Dashboard
              </a>{' '}
              (Passwort: admin)
            </li>
            <li>
              <a
                href="#/p/a3f7k9m2"
                onClick={navigate('#/p/a3f7k9m2')}
                className="underline cursor-pointer hover:text-amber-900"
              >
                Beispiel Gast: Anna (Zusage)
              </a>
            </li>
            <li>
              <a
                href="#/p/b8x2l1p9"
                onClick={navigate('#/p/b8x2l1p9')}
                className="underline cursor-pointer hover:text-amber-900"
              >
                Beispiel Gast: Markus (Offen)
              </a>
            </li>
            <li>
              <a
                href="#/p/judith-demo"
                onClick={navigate('#/p/judith-demo')}
                className="underline cursor-pointer hover:text-amber-900"
              >
                Beispiel Gast: Judith (Offen)
              </a>
            </li>
          </ul>
        </div>
      </div>
    );
  };

  return <Layout>{renderContent()}</Layout>;
};

export default App;
