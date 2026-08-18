export type SearchMode = 'auto' | 'title' | 'author' | 'doi';
export type LanguageCode = 'all' | 'es' | 'en' | 'pt' | 'fr' | 'de' | 'it';
export type CitationFormat = 'apa' | 'mla' | 'ieee' | 'chicago' | 'bibtex' | 'ris';
export type TabType = 'search' | 'library' | 'batch' | 'assistant';

export interface AuthorItem {
  family: string;
  given: string;
  affiliation?: string;
  orcid?: string;
}

export interface ArticleItem {
  id: string;
  title: string;
  journal: string;
  year: string | number;
  doi: string;
  volume: string;
  issue: string;
  page: string;
  authors: string;
  authorsList: AuthorItem[];
  isOpenAccess: boolean;
  pdfUrl: string | null;
  publisherUrl: string;
  citationCount: number;
  abstract: string;
  spanishAbstract: string;
  isSpanishAvailable: boolean;
  declaredLanguage?: string;
  detectedLanguage?: string;
  tldr?: string | null;
  relevanceScore?: number;
  apa: string;
  mla: string;
  ieee: string;
  chicago: string;
  bibtex: string;
  ris: string;
}

export interface SearchFilters {
  language: LanguageCode;
  yearMin?: string;
  yearMax?: string;
  openAccessOnly: boolean;
  rowsCount: number;
}

export interface BatchItemResult {
  doi: string;
  status: 'pending' | 'success' | 'error';
  article?: ArticleItem;
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

// Backward-compatible types
export type CitationStyle = 'apa7' | 'ieee' | 'vancouver' | 'harvard' | 'chicago_ad' | 'chicago_nb' | 'mla9' | 'bibtex' | 'ris';

export type DocumentType = 
  | 'journal_article'
  | 'conference_paper'
  | 'book'
  | 'book_chapter'
  | 'thesis'
  | 'preprint'
  | 'report'
  | 'webpage';

export type ReadingStatus = 'to_read' | 'reading' | 'completed';

export interface Author {
  given: string;
  family: string;
  affiliation?: string;
  orcid?: string;
}

export interface AcademicReference {
  id: string;
  title: string;
  authors: Author[];
  year: number | string;
  month?: string;
  journalOrBook?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  doi?: string;
  url?: string;
  abstract?: string;
  documentType: DocumentType;
  keywords?: string[];
  citationCount?: number;
  openAccess?: boolean;
  pdfUrl?: string;
  collectionId?: string;
  notes?: string;
  readingStatus?: ReadingStatus;
  tags?: string[];
  isFavorite?: boolean;
  dateAdded: string;
}

export interface Collection {
  id: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  createdAt: string;
}

export interface FormattedCitations {
  apa7: string;
  apa7InTextParenthetical: string;
  apa7InTextNarrative: string;
  ieee: string;
  vancouver: string;
  harvard: string;
  chicago_ad: string;
  chicago_nb: string;
  mla9: string;
  bibtex: string;
  ris: string;
}

export interface BooleanSearchStrategy {
  originalQuery: string;
  googleScholarQuery: string;
  scopusQuery: string;
  pubmedQuery: string;
  wosQuery: string;
  keywordsSpanish: string[];
  keywordsEnglish: string[];
  meshTerms?: string[];
  explanation: string;
}

export interface PaperSummary {
  objective: string;
  methodology: string;
  keyFindings: string[];
  limitations: string[];
  practicalImplications: string;
  tldr: string;
}
