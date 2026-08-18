import { ArticleItem, LanguageCode, SearchMode, SearchFilters, AuthorItem } from '../types';

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function cleanDoi(str: string): string {
  if (!str) return '';
  return str.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').replace(/^doi:\s*/i, '');
}

export function isDoi(str: string): boolean {
  return /^10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+$/i.test(cleanDoi(str));
}

export function isSpanishText(text: string): boolean {
  if (!text || text.length < 40) return false;
  const spanishWords = /\b(el|la|los|las|un|una|unos|unas|del|al|que|en|y|por|para|con|se|su|sus|como|más|este|esta|estos|estas|entre|sobre|estudio|resultados|métodos|objetivo|conclusiones|investigación)\b/gi;
  const matches = text.match(spanishWords) || [];
  return matches.length >= 4;
}

export function detectItemLanguage(title = '', abstract = '', declared = ''): string {
  if (declared && ['es', 'en', 'pt', 'fr', 'de', 'it'].includes(declared.toLowerCase())) {
    return declared.toLowerCase();
  }
  const text = `${title} ${abstract}`.toLowerCase();
  if (isSpanishText(text)) return 'es';
  const enWords = /\b(the|and|of|in|to|a|is|for|that|on|with|by|as|at|from|an|be|this|which|are|or)\b/gi;
  if ((text.match(enWords) || []).length >= 4) return 'en';
  const ptWords = /\b(da|do|dos|das|em|um|uma|com|para|por|como|mais|este|esta|os|as|pesquisa|estudo)\b/gi;
  if ((text.match(ptWords) || []).length >= 4) return 'pt';
  const frWords = /\b(les|des|une|dans|pour|sur|avec|cette|plus|est|du|en|un|par|aux)\b/gi;
  if ((text.match(frWords) || []).length >= 4) return 'fr';
  const deWords = /\b(der|die|das|und|in|zu|den|von|mit|fuer|ist|im|nicht|eine|auf|einem|eine|ueber|nach)\b/gi;
  if ((text.match(deWords) || []).length >= 4) return 'de';
  const itWords = /\b(il|la|le|lo|gli|per|con|del|della|nella|sono|questo|questa|uno|una|come|anche)\b/gi;
  if ((text.match(itWords) || []).length >= 4) return 'it';
  return 'en';
}

export function parseAbstract(rawAbstract: string | null | undefined): {
  original: string;
  spanish: string;
  isSpanishAvailable: boolean;
} {
  if (!rawAbstract) {
    return { original: 'Resumen no disponible.', spanish: '', isSpanishAvailable: false };
  }

  const original = rawAbstract.replace(/<[^>]*>?/gm, '').trim();
  let spanish = '';

  try {
    if (typeof window !== 'undefined' && window.DOMParser) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawAbstract, 'text/html');

      const titles = doc.querySelectorAll('title, jats\\:title, h1, h2, h3, h4, strong, b');
      for (const t of Array.from(titles)) {
        if (/^resumen$/i.test(t.textContent?.trim() || '')) {
          const parent = t.parentElement;
          if (parent) {
            spanish = parent.textContent?.replace(/^resumen/i, '').trim() || '';
          }
          break;
        }
      }
    }

    if (!spanish) {
      const match = rawAbstract.match(
        /(?:<jats:title>|<b>|<strong>)?\s*(?:Resumen|RESUMEN)\s*(?:<\/jats:title>|<\/b>|<\/strong>)?[\s:-]*(.*?)(?=(?:<jats:title>|<b>|<strong>)?\s*(?:Abstract|ABSTRACT|Keywords|Palabras clave)|$)/is
      );
      if (match && match[1]) {
        const candidate = match[1].replace(/<[^>]*>?/gm, '').trim();
        if (candidate.length > 30) {
          spanish = candidate;
        }
      }
    }

    if (!spanish && isSpanishText(original)) {
      spanish = original;
    }
  } catch (e) {
    if (isSpanishText(original)) {
      spanish = original;
    }
  }

  return {
    original: original,
    spanish: spanish,
    isSpanishAvailable: Boolean(spanish),
  };
}

export function reconstructOpenAlexAbstract(invertedIndex: any): string | null {
  if (!invertedIndex) return null;
  try {
    const wordPositions: [number, string][] = [];
    for (const [word, positions] of Object.entries(invertedIndex)) {
      for (const pos of positions as number[]) {
        wordPositions.push([pos, word]);
      }
    }
    wordPositions.sort((a, b) => a[0] - b[0]);
    return wordPositions.map((p) => p[1]).join(' ');
  } catch {
    return null;
  }
}

export function processOpenAlexItem(item: any): ArticleItem {
  const title = item.title || item.display_name || 'Título no disponible';
  const journal = item.primary_location?.source?.display_name || item.host_venue?.display_name || 'Revista / Publicación';
  const year = item.publication_year || 's.f.';
  const doi = item.doi ? cleanDoi(item.doi) : (item.id ? item.id.replace('https://openalex.org/', '') : '');
  const volume = item.biblio?.volume || '';
  const issue = item.biblio?.issue || '';
  const page = item.biblio?.first_page
    ? `${item.biblio.first_page}-${item.biblio.last_page || ''}`
    : '';

  const authorsList: AuthorItem[] = (item.authorships || []).map((a: any) => {
    const displayName = a.author?.display_name || 'Autor';
    const parts = displayName.split(' ');
    const family = parts.length > 1 ? parts[parts.length - 1] : parts[0];
    const given = parts.length > 1 ? parts.slice(0, -1).join(' ') : '';
    return {
      family,
      given,
      affiliation: a.institutions?.[0]?.display_name || '',
      orcid: a.author?.orcid || '',
    };
  });

  const authorsFormatted =
    authorsList.length > 0
      ? authorsList.map((a) => `${a.family}, ${(a.given || '').charAt(0)}.`).join('; ')
      : 'Autor desconocido';

  const rawAbstract = reconstructOpenAlexAbstract(item.abstract_inverted_index);
  const parsedAbstract = parseAbstract(rawAbstract);

  const declaredLanguage = item.language || '';
  const detectedLanguage = detectItemLanguage(title, parsedAbstract.original, declaredLanguage);

  const apa = `${authorsFormatted} (${year}). ${title}. ${journal}${volume ? `, ${volume}` : ''}${
    issue ? `(${issue})` : ''
  }${page ? `, ${page}` : ''}. https://doi.org/${doi}`;
  const mla = `${authorsList[0]?.family || 'Ref'}, ${authorsList[0]?.given || ''}. "${title}." ${journal}, vol. ${
    volume || '1'
  }, no. ${issue || '1'}, ${year}, pp. ${page || '1-10'}.`;
  const ieee = `${authorsFormatted}, "${title}," ${journal}, vol. ${volume || '1'}, no. ${
    issue || '1'
  }, pp. ${page || '1-10'}, ${year}.`;
  const chicago = `${authorsFormatted}. "${title}." ${journal} ${volume}${
    issue ? `, no. ${issue}` : ''
  } (${year}): ${page || '1-10'}.`;

  const firstAuthorKey = (authorsList[0]?.family || 'Ref').replace(/\s+/g, '');
  const bibtex = `@article{${firstAuthorKey}${year},\n  title = {${title}},\n  author = {${authorsList
    .map((a) => `${a.family}, ${a.given}`)
    .join(' and ')}},\n  journal = {${journal}},\n  year = {${year}},\n${
    volume ? `  volume = {${volume}},\n` : ''
  }${issue ? `  number = {${issue}},\n` : ''}${page ? `  pages = {${page}},\n` : ''}  doi = {${doi}}\n}`;
  const ris = `TY  - JOUR\nTI  - ${title}\nAU  - ${authorsFormatted}\nJO  - ${journal}\nPY  - ${year}\nVL  - ${volume}\nIS  - ${issue}\nSP  - ${page}\nDO  - ${doi}\nER  -`;

  const pdfUrl = item.open_access?.oa_url || item.primary_location?.pdf_url || null;

  return {
    id: doi || item.id || `oa-${Math.random().toString(36).substring(2, 9)}`,
    title,
    journal,
    year,
    doi,
    volume,
    issue,
    page,
    authors: authorsFormatted,
    authorsList,
    isOpenAccess: item.open_access?.is_oa || Boolean(pdfUrl),
    pdfUrl: pdfUrl,
    publisherUrl: item.doi || item.primary_location?.landing_page_url || (doi ? `https://doi.org/${doi}` : ''),
    citationCount: item.cited_by_count || 0,
    abstract: parsedAbstract.original,
    spanishAbstract: parsedAbstract.spanish,
    isSpanishAvailable: parsedAbstract.isSpanishAvailable,
    declaredLanguage,
    detectedLanguage,
    tldr: null,
    apa,
    mla,
    ieee,
    chicago,
    bibtex,
    ris,
  };
}

export function processCrossrefItem(item: any, oaData: any = null, semanticData: any = null): ArticleItem {
  const title = item.title && item.title.length > 0 ? item.title[0] : 'Título no disponible';
  const journal =
    item['container-title'] && item['container-title'].length > 0
      ? item['container-title'][0]
      : item.publisher || 'Editorial / Revista no indicada';

  const year =
    item.published?.['date-parts']?.[0]?.[0] ||
    item['published-print']?.['date-parts']?.[0]?.[0] ||
    item['published-online']?.['date-parts']?.[0]?.[0] ||
    item.created?.['date-parts']?.[0]?.[0] ||
    item.issued?.['date-parts']?.[0]?.[0] ||
    's.f.';

  const volume = item.volume || '';
  const issue = item.issue || '';
  const page = item.page || '';
  const doi = item.DOI || '';
  const rawAuthors = item.author || [];

  const authorsList: AuthorItem[] = rawAuthors.map((a: any) => ({
    family: a.family || a.name || 'Autor',
    given: a.given || '',
    affiliation: a.affiliation?.[0]?.name || '',
    orcid: a.ORCID || '',
  }));

  const authorsFormatted =
    authorsList.length > 0
      ? authorsList.map((a) => `${a.family || ''}, ${(a.given || '').charAt(0)}.`).join('; ')
      : 'Autor desconocido';

  const rawAbstract = semanticData?.abstract || item.abstract || null;
  const parsedAbstract = parseAbstract(rawAbstract);

  const declaredLanguage = item.language || '';
  const detectedLanguage = detectItemLanguage(title, parsedAbstract.original, declaredLanguage);

  const apa = `${authorsFormatted} (${year}). ${title}. ${journal}${volume ? `, ${volume}` : ''}${
    issue ? `(${issue})` : ''
  }${page ? `, ${page}` : ''}. https://doi.org/${doi}`;
  const mla = `${authorsList[0]?.family || 'Ref'}, ${authorsList[0]?.given || ''}. "${title}." ${journal}, vol. ${
    volume || '1'
  }, no. ${issue || '1'}, ${year}, pp. ${page || '1-10'}.`;
  const ieee = `${authorsFormatted}, "${title}," ${journal}, vol. ${volume || '1'}, no. ${
    issue || '1'
  }, pp. ${page || '1-10'}, ${year}.`;
  const chicago = `${authorsFormatted}. "${title}." ${journal} ${volume}${
    issue ? `, no. ${issue}` : ''
  } (${year}): ${page || '1-10'}.`;

  const firstAuthorKey = (authorsList[0]?.family || 'Ref').replace(/\s+/g, '');
  const bibtex = `@article{${firstAuthorKey}${year},\n  title = {${title}},\n  author = {${authorsList
    .map((a) => `${a.family || ''}, ${a.given || ''}`)
    .join(' and ')}},\n  journal = {${journal}},\n  year = {${year}},\n${
    volume ? `  volume = {${volume}},\n` : ''
  }${issue ? `  number = {${issue}},\n` : ''}${page ? `  pages = {${page}},\n` : ''}  doi = {${doi}}\n}`;
  const ris = `TY  - JOUR\nTI  - ${title}\nAU  - ${authorsFormatted}\nJO  - ${journal}\nPY  - ${year}\nVL  - ${volume}\nIS  - ${issue}\nSP  - ${page}\nDO  - ${doi}\nER  -`;

  const pdfUrl =
    oaData?.best_oa_location?.url_for_pdf ||
    semanticData?.openAccessPdf?.url ||
    item.link?.find((l: any) => l['content-type'] === 'application/pdf')?.URL ||
    null;

  return {
    id: doi || `cr-${Math.random().toString(36).substring(2, 9)}`,
    title,
    journal,
    year,
    doi,
    volume,
    issue,
    page,
    authors: authorsFormatted,
    authorsList,
    isOpenAccess: oaData?.is_oa || Boolean(item.is_oa) || Boolean(pdfUrl),
    pdfUrl: pdfUrl,
    publisherUrl: item.URL || (doi ? `https://doi.org/${doi}` : ''),
    citationCount: semanticData?.citationCount || item['is-referenced-by-count'] || 0,
    abstract: parsedAbstract.original,
    spanishAbstract: parsedAbstract.spanish,
    isSpanishAvailable: parsedAbstract.isSpanishAvailable,
    declaredLanguage,
    detectedLanguage,
    tldr: semanticData?.tldr?.text || null,
    apa,
    mla,
    ieee,
    chicago,
    bibtex,
    ris,
  };
}

export function matchesSearchQueryPrecisely(item: ArticleItem, query: string, mode: SearchMode = 'auto'): boolean {
  if (!query) return true;
  const cleanQ = query.trim().toLowerCase();
  if (!cleanQ) return true;

  const normQ = cleanQ.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (mode === 'author') {
    const normAuthors = (item.authors || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const authorTokens = normQ.split(/[\s,.-]+/).filter((t) => t.length > 0);
    if (authorTokens.length === 0) return true;

    const mainWords = authorTokens.filter((t) => t.length >= 3);
    const initials = authorTokens.filter((t) => t.length < 3 && /[a-z]/i.test(t));

    const allMainWordsMatch = mainWords.length === 0 || mainWords.every((word) => normAuthors.includes(word));
    if (!allMainWordsMatch) return false;

    if (initials.length > 0 && item.authorsList && item.authorsList.length > 0) {
      const matchesAuthorWithInitial = item.authorsList.some((a) => {
        const familyNorm = (a.family || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const givenNorm = (a.given || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        const familyMatches = mainWords.length === 0 || mainWords.some((w) => familyNorm.includes(w));
        if (!familyMatches) return false;

        return initials.some((init) => givenNorm.startsWith(init) || familyNorm.startsWith(init));
      });

      if (!matchesAuthorWithInitial && mainWords.length > 0) {
        const hasInitialInAuthors = initials.some((init) => {
          const regex = new RegExp(`\\b${escapeRegExp(init)}`, 'i');
          return regex.test(normAuthors);
        });
        if (!hasInitialInAuthors) return false;
      }
    }

    return true;
  }

  const title = (item.title || '').toLowerCase();
  const abstract = (item.abstract || '').toLowerCase();
  const journal = (item.journal || '').toLowerCase();
  const authors = (item.authors || '').toLowerCase();

  const normQFull = normQ;
  const fullText = `${title} ${abstract} ${journal} ${authors}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const queryTerms = normQFull
    .split(/\s+/)
    .map((t) => t.replace(/[^a-z0-9]/g, ''))
    .filter((t) => t.length > 1);

  if (queryTerms.length === 0) return fullText.includes(normQFull);

  const matchesTerm = (term: string, text: string) => {
    const regex = new RegExp(`\\b${escapeRegExp(term)}\\b`, 'i');
    if (regex.test(text)) return true;

    if (term.endsWith('es')) {
      const singular = term.slice(0, -2);
      if (singular.length > 1 && new RegExp(`\\b${escapeRegExp(singular)}\\b`, 'i').test(text)) return true;
    }
    if (term.endsWith('s')) {
      const singular = term.slice(0, -1);
      if (singular.length > 1 && new RegExp(`\\b${escapeRegExp(singular)}\\b`, 'i').test(text)) return true;
    }
    return false;
  };

  const matchedCount = queryTerms.filter((t) => matchesTerm(t, fullText)).length;

  if (queryTerms.length <= 2) {
    return matchedCount >= queryTerms.length;
  }
  return matchedCount >= Math.max(2, Math.ceil(queryTerms.length * 0.6));
}

export function calculateRelevanceScore(item: ArticleItem, query: string, mode: SearchMode = 'auto'): number {
  if (!query) return 0;
  const cleanQ = query.trim().toLowerCase();
  if (!cleanQ) return 0;

  const normQ = cleanQ.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const terms = normQ
    .split(/\s+/)
    .map((t) => t.replace(/[^a-z0-9]/g, ''))
    .filter((t) => t.length > 1);

  const title = (item.title || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const abstract = (item.abstract || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const journal = (item.journal || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const authors = (item.authors || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const doi = (item.doi || '').toLowerCase();

  let score = 0;

  if (doi === cleanQ || doi.includes(cleanQ)) {
    return 1000;
  }

  const fullInTitle = title.includes(normQ);
  const fullInAbstract = abstract.includes(normQ);

  if (title === normQ) {
    score += 600;
  } else if (fullInTitle) {
    score += 450;
  } else if (fullInAbstract) {
    score += 250;
  }

  if (terms.length === 0) return score;

  let titleTermMatches = 0;
  let authorTermMatches = 0;
  let abstractTermMatches = 0;
  let journalTermMatches = 0;

  terms.forEach((term) => {
    if (title.includes(term)) titleTermMatches++;
    if (authors.includes(term)) authorTermMatches++;
    if (journal.includes(term)) journalTermMatches++;
    if (abstract.includes(term)) abstractTermMatches++;
  });

  const titleRatio = titleTermMatches / terms.length;
  const totalUniqueMatches = terms.filter(
    (t) => title.includes(t) || abstract.includes(t) || authors.includes(t) || journal.includes(t)
  ).length;
  const overallRatio = totalUniqueMatches / terms.length;

  score += titleRatio * 250;
  score += overallRatio * 150;

  if (overallRatio === 1) score += 200;
  if (titleRatio === 1) score += 250;

  if (terms.length >= 3 && overallRatio < 0.5) {
    score *= 0.15;
  }

  if (mode === 'title' && titleTermMatches > 0) score += titleRatio * 100;
  if (mode === 'author') {
    const authorRatio = terms.length > 0 ? authorTermMatches / terms.length : 0;
    score += authorRatio * 600;
    if (authorRatio === 1) score += 400;
  }

  score += Math.min(item.citationCount || 0, 300) * 0.05;

  return score;
}

export async function fetchArticleFullDetails(doi: string): Promise<ArticleItem> {
  const cleanDoiStr = cleanDoi(doi);
  if (!cleanDoiStr) {
    throw new Error('Identificador DOI inválido');
  }

  // 1. Try server proxy if available for best speed and CORS bypassing
  try {
    const srvRes = await fetch('/api/academic/full-details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doi: cleanDoiStr }),
    });
    if (srvRes.ok) {
      const data = await srvRes.json();
      if (data.article) {
        return data.article;
      }
    }
  } catch {
    // Fall back to direct multi-API fetch
  }

  let crossrefItem: any = null;
  let unpaywallData: any = null;
  let semanticData: any = null;
  let openAlexItem: any = null;

  try {
    const res = await fetch(
      `https://api.crossref.org/works/${encodeURIComponent(cleanDoiStr)}?mailto=academic.search@asa-soporte.com`
    );
    if (res.ok) {
      const data = await res.json();
      crossrefItem = data.message;
    }
  } catch (e) {
    console.warn('Crossref error:', e);
  }

  try {
    const res = await fetch(
      `https://api.unpaywall.org/v2/${encodeURIComponent(cleanDoiStr)}?email=academic.search@asa-soporte.com`
    );
    if (res.ok) {
      unpaywallData = await res.json();
    }
  } catch (e) {
    console.warn('Unpaywall error:', e);
  }

  try {
    const res = await fetch(
      `https://api.semanticscholar.org/graph/v1/paper/DOI:${encodeURIComponent(
        cleanDoiStr
      )}?fields=title,abstract,authors,citationCount,tldr,isOpenAccess,openAccessPdf`
    );
    if (res.ok) {
      semanticData = await res.json();
    }
  } catch (e) {
    console.warn('Semantic Scholar error:', e);
  }

  try {
    const res = await fetch(`https://api.openalex.org/works/https://doi.org/${encodeURIComponent(cleanDoiStr)}`);
    if (res.ok) {
      openAlexItem = await res.json();
    }
  } catch (e) {
    console.warn('OpenAlex error:', e);
  }

  if (crossrefItem) {
    const item = processCrossrefItem(crossrefItem, unpaywallData, semanticData);
    if (!item.pdfUrl) {
      if (semanticData?.openAccessPdf?.url) {
        item.pdfUrl = semanticData.openAccessPdf.url;
        item.isOpenAccess = true;
      } else if (openAlexItem?.open_access?.oa_url || openAlexItem?.primary_location?.pdf_url) {
        item.pdfUrl = openAlexItem.open_access?.oa_url || openAlexItem.primary_location?.pdf_url;
        item.isOpenAccess = item.isOpenAccess || Boolean(openAlexItem.open_access?.is_oa);
      }
    }
    return item;
  }

  if (openAlexItem) {
    return processOpenAlexItem(openAlexItem);
  }

  throw new Error(`No se pudieron obtener los detalles del DOI: ${cleanDoiStr}`);
}

export async function fetchFromOpenAlex(
  query: string,
  rows: number,
  offset: number,
  mode: SearchMode,
  targetLang?: string
): Promise<{ items: ArticleItem[]; total: number }> {
  const page = Math.floor(offset / rows) + 1;
  const alexFilters: string[] = [];

  if (targetLang && targetLang !== 'all') {
    alexFilters.push(`language:${targetLang}`);
  }

  if (mode === 'title') {
    alexFilters.push(`title.search:${encodeURIComponent(query)}`);
  } else if (mode === 'author') {
    alexFilters.push(`authorships.author.display_name.search:${encodeURIComponent(query)}`);
  }

  let alexUrl = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per_page=${rows}&page=${page}`;
  if (alexFilters.length > 0) {
    alexUrl += `&filter=${alexFilters.join(',')}`;
  }

  const res = await fetch(alexUrl);
  if (!res.ok) throw new Error('Error de respuesta en motor alternativo OpenAlex.');
  const data = await res.json();

  const items = (data.results || []).map((item: any) => processOpenAlexItem(item));
  return {
    items,
    total: data.meta?.count || items.length,
  };
}

export async function searchAcademicArticles({
  query,
  mode,
  filters,
  offset = 0,
}: {
  query: string;
  mode: SearchMode;
  filters: SearchFilters;
  offset?: number;
}): Promise<{ items: ArticleItem[]; total: number }> {
  const cleanQ = query.trim();
  if (!cleanQ) {
    return { items: [], total: 0 };
  }

  const isDirectDoi = mode === 'doi' || (mode === 'auto' && isDoi(cleanQ));
  if (isDirectDoi) {
    const article = await fetchArticleFullDetails(cleanQ);
    return { items: [article], total: 1 };
  }

  let queryParam = 'query';
  if (mode === 'title') queryParam = 'query.title';
  if (mode === 'author') queryParam = 'query.author';

  const targetRows = filters.rowsCount || 10;
  const fetchBufferRows = Math.max(targetRows * 3, 30);

  const crossrefFilters: string[] = [];
  if (filters.yearMin) crossrefFilters.push(`from-pub-date:${filters.yearMin}-01-01`);
  if (filters.yearMax) crossrefFilters.push(`until-pub-date:${filters.yearMax}-12-31`);

  const targetLang = filters.language;

  let items: ArticleItem[] = [];
  let totalSearchResultsCount = 0;

  if (targetLang && targetLang !== 'all') {
    try {
      const alexData = await fetchFromOpenAlex(cleanQ, fetchBufferRows, offset, mode, targetLang);
      items = alexData.items;
      totalSearchResultsCount = alexData.total;
    } catch (errOpenAlex) {
      console.warn('Error en consulta inicial de OpenAlex, intentando Crossref:', errOpenAlex);
    }

    if (items.length === 0) {
      let apiUrl = `https://api.crossref.org/works?${queryParam}=${encodeURIComponent(
        cleanQ
      )}&rows=${fetchBufferRows}&offset=${offset}&mailto=academic.search@asa-soporte.com`;
      if (crossrefFilters.length > 0) apiUrl += `&filter=${crossrefFilters.join(',')}`;
      const res = await fetch(apiUrl);
      if (res.ok) {
        const data = await res.json();
        const rawItems = data.message?.items || [];
        totalSearchResultsCount = data.message?.['total-results'] || rawItems.length;
        items = rawItems.map((item: any) => processCrossrefItem(item));
      }
    }
  } else {
    let apiUrl = `https://api.crossref.org/works?${queryParam}=${encodeURIComponent(
      cleanQ
    )}&rows=${fetchBufferRows}&offset=${offset}&mailto=academic.search@asa-soporte.com`;
    if (crossrefFilters.length > 0) apiUrl += `&filter=${crossrefFilters.join(',')}`;

    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(`Crossref respondió con estado ${res.status}`);
      const data = await res.json();
      const rawItems = data.message?.items || [];
      totalSearchResultsCount = data.message?.['total-results'] || rawItems.length;
      items = rawItems.map((item: any) => processCrossrefItem(item));
    } catch (primaryErr) {
      console.warn('Crossref no disponible, usando respaldo OpenAlex:', primaryErr);
      const alexData = await fetchFromOpenAlex(cleanQ, fetchBufferRows, offset, mode, targetLang);
      items = alexData.items;
      totalSearchResultsCount = alexData.total;
    }
  }

  if (targetLang && targetLang !== 'all') {
    items = items.filter((i) => {
      const detected = i.detectedLanguage || detectItemLanguage(i.title, i.abstract, i.declaredLanguage);
      return detected === targetLang;
    });
  }

  items = items.filter((i) => matchesSearchQueryPrecisely(i, cleanQ, mode));

  items.forEach((i) => {
    i.relevanceScore = calculateRelevanceScore(i, cleanQ, mode);
  });
  items.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

  if (filters.openAccessOnly) {
    items = items.filter((i) => i.isOpenAccess || i.pdfUrl || i.citationCount > 0);
  }

  const slicedItems = items.slice(0, targetRows);

  if (slicedItems.length === 0 && offset === 0) {
    throw new Error('No se encontraron artículos que coincidan exactamente con la búsqueda, idioma y filtros seleccionados.');
  }

  return {
    items: slicedItems,
    total: totalSearchResultsCount || items.length,
  };
}

export async function translateAbstractText(text: string): Promise<string> {
  if (!text || text.trim().length === 0) return '';
  const cleanText = text.replace(/<[^>]*>?/gm, '').trim();

  // Try server Gemini endpoint
  try {
    const srvRes = await fetch('/api/academic/translate-abstract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: cleanText }),
    });
    if (srvRes.ok) {
      const data = await srvRes.json();
      if (data.translation) {
        return data.translation;
      }
    }
  } catch (e) {
    console.warn('Server translation fallback:', e);
  }

  // Fallback 1: Google Translate GTX
  try {
    const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=es&dt=t&q=${encodeURIComponent(
      cleanText
    )}`;
    const response = await fetch(gtxUrl);
    if (response.ok) {
      const data = await response.json();
      if (data && data[0]) {
        return data[0].map((item: any) => item[0]).filter(Boolean).join(' ');
      }
    }
  } catch (err) {
    console.warn('GTX translation error, trying MyMemory:', err);
  }

  // Fallback 2: MyMemory
  try {
    const chunk = cleanText.substring(0, 500);
    const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=en|es`;
    const response = await fetch(mmUrl);
    if (response.ok) {
      const data = await response.json();
      if (data?.responseData?.translatedText) {
        return data.responseData.translatedText;
      }
    }
  } catch (e) {
    console.warn('MyMemory translation error:', e);
  }

  throw new Error('No se pudo procesar la traducción del resumen');
}

export function downloadBlob(content: string, filename: string, contentType = 'text/plain') {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportLibraryBibTeX(items: ArticleItem[]) {
  if (!items || items.length === 0) return;
  const content = items.map((a) => a.bibtex).join('\n\n');
  downloadBlob(content, 'mi_biblioteca_scholar.bib', 'text/plain');
}

export function exportLibraryRIS(items: ArticleItem[]) {
  if (!items || items.length === 0) return;
  const content = items.map((a) => a.ris).join('\n\n');
  downloadBlob(content, 'mi_biblioteca_scholar.ris', 'text/plain');
}
