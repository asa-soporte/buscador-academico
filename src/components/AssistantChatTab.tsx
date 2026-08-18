import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Trash2, Copy, Check, Loader2, BookOpen } from 'lucide-react';
import { ArticleItem, ChatMessage } from '../types';

interface AssistantChatTabProps {
  savedLibrary: ArticleItem[];
  onShowToast: (message: string) => void;
}

export const AssistantChatTab: React.FC<AssistantChatTabProps> = ({
  savedLibrary,
  onShowToast,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `¡Hola! Soy tu **Asistente Académico IA**.

¿En qué puedo asistirte con tus investigaciones?
- 📚 **Sintetizar y comparar artículos** guardados en tu biblioteca.
- ✍️ **Redactar párrafos científicos** con citas automáticas (APA 7, IEEE, Chicago).
- 🔍 **Crear ecuaciones de búsqueda booleanas avanzadas** (AND, OR, NOT) para Scopus, PubMed y Google Scholar.
- 🎯 **Explicar metodologías y conceptos complejos** de cualquier paper.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanText = inputMessage.trim();
    if (!cleanText || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: cleanText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build context from saved library
      const libraryContext =
        savedLibrary.length > 0
          ? `\n\nArtículos en la biblioteca del usuario:\n` +
            savedLibrary
              .map(
                (a, i) =>
                  `${i + 1}. "${a.title}" (${a.year}) por ${a.authors}. DOI: ${a.doi}. Abstract: ${a.abstract.substring(0, 300)}...`
              )
              .join('\n')
          : '';

      const prompt = `${cleanText}${libraryContext}`;

      const res = await fetch('/api/academic/assistant-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          history: messages.slice(-4),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: data.reply || 'He procesado tu consulta académica.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error('Error de servidor en asistente');
      }
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content:
          'No pude conectar con el servicio de IA en este momento. Por favor verifica tu conexión o intenta reformular tu pregunta.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedId(id);
        onShowToast('¡Mensaje copiado al portapapeles!');
        setTimeout(() => setCopiedId(null), 2000);
      });
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-msg',
        role: 'assistant',
        content: 'Chat reiniciado. ¿Qué tema o artículo deseas investigar hoy?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    onShowToast('Conversación reiniciada');
  };

  return (
    <div id="panel-assistant" className="space-y-4 max-w-4xl mx-auto">
      {/* Header info */}
      <div className="bg-[#0b121c] border border-[#182635] rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#32E6E2]/10 text-[#32E6E2] rounded-xl border border-[#32E6E2]/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base leading-tight flex items-center gap-2">
              <span>Asistente de Investigación Científica</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#32E6E2]/20 text-[#32E6E2] border border-[#32E6E2]/30 rounded-full">
                Gemini AI
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Analiza tus {savedLibrary.length} artículos guardados o genera estrategias de búsqueda
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="p-2 text-slate-400 hover:text-red-400 hover:bg-[#182635] rounded-lg transition-colors"
          title="Reiniciar chat"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="bg-[#0b121c] border border-[#182635] rounded-2xl p-4 sm:p-6 min-h-[400px] max-h-[550px] overflow-y-auto custom-scrollbar space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 sm:gap-3 ${
                isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {!isUser && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#32E6E2]/10 border border-[#32E6E2]/30 text-[#32E6E2] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed relative group ${
                  isUser
                    ? 'bg-[#32E6E2] text-[#060B10] font-medium rounded-tr-none'
                    : 'bg-[#060B10] border border-[#182635] text-slate-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap break-words">{msg.content}</div>

                <div
                  className={`flex items-center justify-between mt-2 pt-1 border-t text-[10px] ${
                    isUser
                      ? 'border-[#060B10]/20 text-[#060B10]/70'
                      : 'border-[#182635] text-slate-500'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#32E6E2] flex items-center gap-1"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#32E6E2]/10 border border-[#32E6E2]/30 text-[#32E6E2] flex items-center justify-center flex-shrink-0 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-[#060B10] border border-[#182635] rounded-2xl rounded-tl-none p-4 text-xs text-slate-400 flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#32E6E2]" />
              <span>Analizando literatura y redactando respuesta...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 text-xs">
        <button
          type="button"
          onClick={() =>
            setInputMessage(
              'Genera una ecuación de búsqueda booleana con operadores AND, OR, NOT y descriptores MeSH sobre Inteligencia Artificial aplicada a la medicina.'
            )
          }
          className="px-3 py-1.5 bg-[#0b121c] hover:border-[#32E6E2]/50 text-slate-300 border border-[#182635] rounded-xl whitespace-nowrap transition-colors"
        >
          🔍 Ecuación Booleana
        </button>
        <button
          type="button"
          onClick={() =>
            setInputMessage(
              'Resume los puntos clave de los artículos en mi biblioteca y redacta un párrafo de síntesis para mi marco teórico en formato APA 7.'
            )
          }
          className="px-3 py-1.5 bg-[#0b121c] hover:border-[#32E6E2]/50 text-slate-300 border border-[#182635] rounded-xl whitespace-nowrap transition-colors"
        >
          📚 Sintetizar mi Biblioteca
        </button>
        <button
          type="button"
          onClick={() =>
            setInputMessage(
              '¿Cuáles son las diferencias metodológicas entre una revisión sistemática (PRISMA) y una revisión narrativa?'
            )
          }
          className="px-3 py-1.5 bg-[#0b121c] hover:border-[#32E6E2]/50 text-slate-300 border border-[#182635] rounded-xl whitespace-nowrap transition-colors"
        >
          ✍️ Metodología de Investigación
        </button>
      </div>

      {/* Input bar */}
      <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Escribe tu consulta sobre papers, metodología o citas..."
          className="w-full bg-[#0b121c] border border-[#182635] focus:border-[#32E6E2] text-white placeholder-slate-500 pl-4 pr-12 py-3 rounded-xl text-xs sm:text-sm outline-none transition-all"
        />
        <button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="absolute right-1.5 top-1.5 bottom-1.5 px-3.5 bg-[#32E6E2] hover:bg-[#2bd8d4] disabled:opacity-40 text-[#060B10] font-bold rounded-lg text-xs flex items-center justify-center transition-all shadow"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
