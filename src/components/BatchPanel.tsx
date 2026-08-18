import React, { useState } from 'react';
import { Layers, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { BatchItemResult } from '../types';
import { cleanDoi, fetchArticleFullDetails } from '../utils/academicSearch';

interface BatchPanelProps {
  onInspectArticle: (doi: string) => void;
  onShowToast: (message: string) => void;
}

export const BatchPanel: React.FC<BatchPanelProps> = ({
  onInspectArticle,
  onShowToast,
}) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchItems, setBatchItems] = useState<BatchItemResult[]>([]);
  const [hasStarted, setHasStarted] = useState(false);

  const handleProcessBatch = async () => {
    if (!inputText.trim()) {
      onShowToast('Por favor pega un texto o bibliografía.');
      return;
    }

    const doiMatches = inputText.match(/10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+/gi) || [];
    const uniqueDois: string[] = Array.from(new Set<string>(doiMatches.map((d) => cleanDoi(d)))).filter(Boolean);

    setHasStarted(true);

    if (uniqueDois.length === 0) {
      setBatchItems([]);
      return;
    }

    const initialItems: BatchItemResult[] = uniqueDois.map((doi: string) => ({
      doi,
      status: 'pending',
    }));
    setBatchItems(initialItems);
    setIsProcessing(true);

    // Process sequentially so UI updates smoothly
    for (let i = 0; i < uniqueDois.length; i++) {
      const doi = uniqueDois[i];
      try {
        const art = await fetchArticleFullDetails(doi);
        setBatchItems((prev) =>
          prev.map((item) =>
            item.doi === doi ? { ...item, status: 'success', article: art } : item
          )
        );
      } catch (e: any) {
        setBatchItems((prev) =>
          prev.map((item) =>
            item.doi === doi ? { ...item, status: 'error', error: e.message || 'Error' } : item
          )
        );
      }
    }

    setIsProcessing(false);
    onShowToast(`Procesamiento finalizado: ${uniqueDois.length} DOIs procesados.`);
  };

  return (
    <div id="panel-batch" className="space-y-4 sm:space-y-6">
      <div className="bg-[#0b121c] border border-[#182635] rounded-2xl p-4 sm:p-6 space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-[#32E6E2]" />
            <span>Extractor Bibliográfico por Lote</span>
          </h2>
          <p className="text-xs text-slate-400">
            Pega un texto o lista de referencias. Detectaremos automáticamente todos los DOIs e
            identificadores para procesarlos juntos.
          </p>
        </div>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={5}
          id="batchInput"
          placeholder={`Pega aquí cualquier bloque de texto o bibliografía... Ej:
1. Vaswani et al., Attention is All You Need. https://doi.org/10.48550/arXiv.1706.03762
2. Doudna et al. 10.1038/s41586-020-2649-2`}
          className="w-full bg-[#060B10] border border-[#182635] rounded-xl p-3 sm:p-4 text-xs font-mono text-slate-200 outline-none focus:border-[#32E6E2]"
        />

        <button
          type="button"
          onClick={handleProcessBatch}
          disabled={isProcessing}
          className="w-full sm:w-auto px-5 py-3 bg-[#32E6E2] hover:bg-[#2bd8d4] disabled:opacity-50 text-[#060B10] rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 transition-all shadow-md shadow-[#32E6E2]/20"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Extrayendo y Procesando...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Extraer & Cargar Todos los DOIs</span>
            </>
          )}
        </button>
      </div>

      {hasStarted && (
        <div id="batchResults" className="space-y-4 animate-fade-in">
          {batchItems.length === 0 ? (
            <div className="p-3.5 bg-red-950/40 border border-red-800 text-red-300 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>No se detectaron identificadores DOI válidos en el texto.</span>
            </div>
          ) : (
            <>
              <div className="text-xs font-bold text-slate-300">
                Se detectaron {batchItems.length} DOIs. Procesando metadatos...
              </div>

              <div id="batchContainer" className="space-y-2.5">
                {batchItems.map((item) => (
                  <div
                    key={item.doi}
                    className="bg-[#0b121c] border border-[#182635] p-3 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    {item.status === 'pending' ? (
                      <div className="flex items-center space-x-2 text-slate-400 font-mono">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#32E6E2]" />
                        <span>Procesando: {item.doi}...</span>
                      </div>
                    ) : item.status === 'success' && item.article ? (
                      <>
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-white block break-words">
                            {item.article.title}
                          </span>
                          <p className="text-[11px] text-slate-400 break-words">
                            {item.article.authors} ({item.article.year}) •{' '}
                            <span className="font-mono break-all">{item.article.doi}</span>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onInspectArticle(item.article!.doi)}
                          className="px-3 py-1 bg-[#32E6E2] hover:bg-[#2bd8d4] text-[#060B10] font-bold rounded text-[11px] self-end sm:self-auto flex-shrink-0 transition-colors"
                        >
                          Ver Ficha
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center space-x-2 text-red-400 font-mono break-all">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Error al obtener DOI {item.doi}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
