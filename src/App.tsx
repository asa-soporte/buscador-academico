import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SearchPanel } from './components/SearchPanel';
import { LibraryPanel } from './components/LibraryPanel';
import { BatchPanel } from './components/BatchPanel';
import { AssistantChatTab } from './components/AssistantChatTab';
import { LanguageModal } from './components/LanguageModal';
import { Toast } from './components/Toast';
import { Footer } from './components/Footer';
import { ArticleItem, LanguageCode, TabType } from './types';
import { fetchArticleFullDetails } from './utils/academicSearch';

const LANG_LABELS: Record<LanguageCode, string> = {
  all: 'Todos los idiomas',
  es: 'Español',
  en: 'Inglés',
  pt: 'Portugués',
  fr: 'Francés',
  de: 'Alemán',
  it: 'Italiano',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('all');
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [canInstallPwa, setCanInstallPwa] = useState(false);

  // Listen for beforeinstallprompt event on Android / PWA browsers
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
      setCanInstallPwa(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      showToast('¡Instalando DOI Finder en tu dispositivo!');
      setCanInstallPwa(false);
    }
    setDeferredInstallPrompt(null);
  };

  // Saved library in localStorage (using exact 'scholar_library' key for seamless persistence)
  const [savedLibrary, setSavedLibrary] = useState<ArticleItem[]>(() => {
    try {
      const saved = localStorage.getItem('scholar_library');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Toast notification state
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setIsToastVisible(true);
  };

  useEffect(() => {
    if (isToastVisible) {
      const timer = setTimeout(() => {
        setIsToastVisible(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isToastVisible]);

  // Sync saved library to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('scholar_library', JSON.stringify(savedLibrary));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [savedLibrary]);

  const handleToggleSave = (article: ArticleItem) => {
    const exists = savedLibrary.some((s) => s.doi === article.doi);
    if (exists) {
      setSavedLibrary((prev) => prev.filter((s) => s.doi !== article.doi));
      showToast('Artículo eliminado de la biblioteca');
    } else {
      setSavedLibrary((prev) => [...prev, article]);
      showToast('Artículo guardado en la biblioteca');
    }
  };

  const handleClearLibrary = () => {
    if (savedLibrary.length === 0) return;
    setSavedLibrary([]);
    showToast('Biblioteca vaciada');
  };

  const handleInspectArticleFromOtherTabs = async (doi: string) => {
    setActiveTab('search');
    // Let SearchPanel inspect this article
    try {
      await fetchArticleFullDetails(doi);
    } catch {
      // Handled
    }
  };

  const handleSelectLanguage = (code: LanguageCode, label: string) => {
    setCurrentLanguage(code);
    setIsLanguageModalOpen(false);
    showToast(`Idioma seleccionado: ${label}`);
  };

  return (
    <div className="bg-[#060B10] text-slate-100 min-h-screen flex flex-col custom-scrollbar overflow-x-hidden">
      {/* App Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        savedCount={savedLibrary.length}
        canInstall={canInstallPwa}
        onInstall={handleInstallApp}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 flex-1 w-full space-y-4 sm:space-y-6">
        {activeTab === 'search' && (
          <SearchPanel
            savedLibrary={savedLibrary}
            onToggleSave={handleToggleSave}
            onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
            currentLanguage={currentLanguage}
            languageLabel={LANG_LABELS[currentLanguage]}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'library' && (
          <LibraryPanel
            savedLibrary={savedLibrary}
            onToggleSave={handleToggleSave}
            onInspectArticle={handleInspectArticleFromOtherTabs}
            onClearLibrary={handleClearLibrary}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'batch' && (
          <BatchPanel
            onInspectArticle={handleInspectArticleFromOtherTabs}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'assistant' && (
          <AssistantChatTab savedLibrary={savedLibrary} onShowToast={showToast} />
        )}
      </main>

      {/* Language Quick Selector Modal */}
      <LanguageModal
        isOpen={isLanguageModalOpen}
        currentLanguage={currentLanguage}
        onSelectLanguage={handleSelectLanguage}
        onClose={() => setIsLanguageModalOpen(false)}
      />

      {/* Floating Toast Notification */}
      <Toast message={toastMessage} isVisible={isToastVisible} />

      {/* Brand Footer */}
      <Footer />
    </div>
  );
}
