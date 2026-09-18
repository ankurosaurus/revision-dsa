import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
  ExternalLink,
  ChevronRight,
  Database,
  ArrowLeft,
  Info,
  Tag
} from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { useProblemStore } from '../../store/useProblemStore';
import { Platform, Difficulty, InitialConfidence, CatalogProblem, CatalogStats } from '../../types';
import { detectAndValidateUrl, verifyAndFetchMetadata } from '../../lib/urlValidators';
import { PRESET_TAGS } from '../../lib/sampleData';
import { searchCatalog, getCatalogStats } from '../../lib/catalogService';
import { PlatformBadge } from './PlatformBadge';

export const AddProblemPanel: React.FC = () => {
  const isOpen = useUIStore((s) => s.isAddPanelOpen);
  const closePanel = useUIStore((s) => s.closeAddPanel);
  const addProblem = useProblemStore((s) => s.addProblem);

  // Mode: 'catalog' (search-first) or 'manual' (direct link fallback)
  const [mode, setMode] = useState<'catalog' | 'manual'>('catalog');

  // Platform tab filter for catalog search
  const [platformTab, setPlatformTab] = useState<Platform | 'all'>('all');

  // Catalog search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CatalogProblem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCatalogProblem, setSelectedCatalogProblem] = useState<CatalogProblem | null>(null);
  const [catalogStats, setCatalogStats] = useState<CatalogStats>({
    total: 15476,
    leetcode: 4055,
    codeforces: 11401,
    gfg: 20,
  });

  // Manual & Selected Form states
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [notes, setNotes] = useState('');
  const [confidence, setConfidence] = useState<InitialConfidence>('independent');

  // Validation states for manual mode
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLinkVerified, setIsLinkVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load catalog stats on open
  useEffect(() => {
    if (isOpen) {
      getCatalogStats()
        .then((stats) => setCatalogStats(stats))
        .catch(() => {});
      // Auto-focus search in catalog mode
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Debounced catalog search
  useEffect(() => {
    if (mode !== 'catalog' || selectedCatalogProblem) return;

    let isMounted = true;
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const results = await searchCatalog(searchQuery, platformTab, 50);
        if (isMounted) {
          setSearchResults(results);
          setIsSearching(false);
        }
      } catch (err) {
        console.error('Catalog search error:', err);
        if (isMounted) setIsSearching(false);
      }
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, platformTab, mode, selectedCatalogProblem]);

  // URL detection for manual mode
  useEffect(() => {
    if (mode !== 'manual') return;

    if (!url.trim()) {
      setPlatform(null);
      setUrlError(null);
      return;
    }

    const detection = detectAndValidateUrl(url);
    if (!detection.isValid) {
      setUrlError(detection.error || 'Invalid problem URL');
      setPlatform(null);
    } else {
      setUrlError(null);
      if (detection.platform) {
        setPlatform(detection.platform);
        setCanonicalUrl(detection.canonicalUrl || url.trim());
      }
    }
  }, [url, mode]);

  // Handle selecting a catalog problem
  const handleSelectCatalogProblem = (prob: CatalogProblem) => {
    setSelectedCatalogProblem(prob);
    setTitle(prob.title);
    setUrl(prob.url);
    setCanonicalUrl(prob.url);
    setPlatform(prob.platform);
    setDifficulty(prob.difficulty || 'medium');
    setSelectedTags(prob.tags || []);
    setIsLinkVerified(true);
  };

  const handleClearSelection = () => {
    setSelectedCatalogProblem(null);
    setTitle('');
    setUrl('');
    setCanonicalUrl('');
    setPlatform(null);
    setSelectedTags([]);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  };

  const handleQuickAdd = async (e: React.MouseEvent, prob: CatalogProblem) => {
    e.stopPropagation();
    await addProblem({
      catalog_id: prob.id,
      title: prob.title,
      url: prob.url,
      platform: prob.platform,
      difficulty: prob.difficulty || 'medium',
      tags: prob.tags || [],
    });
    closePanel();
  };

  const handleAutoExtractManual = async () => {
    if (!url.trim()) return;
    const detection = detectAndValidateUrl(url);
    if (!detection.isValid) {
      setUrlError(detection.error || 'Please enter a valid problem link first.');
      return;
    }

    setIsVerifying(true);
    setUrlError(null);

    try {
      const meta = await verifyAndFetchMetadata(url);
      setPlatform(meta.platform);
      if (meta.title) setTitle(meta.title);
      if (meta.difficulty) setDifficulty(meta.difficulty);
      if (meta.canonicalUrl) setCanonicalUrl(meta.canonicalUrl);
      setIsLinkVerified(meta.verified);
    } catch {
      setIsLinkVerified(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();

    const tag = customTagInput.trim();
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
      setCustomTagInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalUrl = canonicalUrl || url.trim();
    if (!finalUrl) {
      setUrlError('URL is required.');
      return;
    }

    if (!title.trim()) {
      alert('Please provide a problem title.');
      return;
    }

    let finalPlatform = platform;
    if (!finalPlatform) {
      const detection = detectAndValidateUrl(finalUrl);
      if (detection.isValid && detection.platform) {
        finalPlatform = detection.platform;
      } else {
        setUrlError('Please provide a valid problem URL.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await addProblem({
        catalog_id: selectedCatalogProblem ? selectedCatalogProblem.id : undefined,
        title: title.trim(),
        url: finalUrl,
        platform: finalPlatform,
        difficulty,
        tags: selectedTags,
        notes: notes.trim(),
        confidence,
        link_verified: isLinkVerified,
      });

      // Reset and close
      resetForm();
      closePanel();
    } catch (err) {
      console.error('Failed to add problem:', err);
      alert('Failed to save problem. Please check input and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setUrl('');
    setTitle('');
    setSelectedTags([]);
    setNotes('');
    setConfidence('independent');
    setIsLinkVerified(false);
    setSelectedCatalogProblem(null);
    setSearchQuery('');
    setMode('catalog');
    setUrlError(null);
  };

  const formatPlatformBadge = (plat: Platform) => {
    switch (plat) {
      case 'leetcode':
        return 'LeetCode';
      case 'codeforces':
        return 'Codeforces';
      case 'gfg':
        return 'GFG';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Subtle Dim Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePanel}
            className="fixed inset-0 z-40 bg-neutral-900/40 dark:bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Slide-in Drawer (Linear / Vercel style) */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="fixed top-0 right-0 z-50 h-full w-full max-w-xl bg-white dark:bg-dark-surface border-l border-neutral-200 dark:border-dark-border shadow-elevated flex flex-col overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-dark-border flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                    Log DSA Problem
                  </h2>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800/60">
                    Search-First
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-dark-textMuted mt-0.5">
                  Pick from 15,000+ pre-seeded problems or enter a custom link.
                </p>
              </div>

              <button
                onClick={closePanel}
                className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-dark-surfaceHover transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher Banner if Manual */}
            {mode === 'manual' && (
              <div className="px-6 py-2.5 bg-neutral-50 dark:bg-dark-bg/60 border-b border-neutral-200 dark:border-dark-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMode('catalog')}
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Problem Catalog Search</span>
                </button>
                <span className="text-[11px] text-neutral-500 dark:text-dark-textMuted">
                  Manual Link Mode
                </span>
              </div>
            )}

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* --- MODE 1: SEARCH-FIRST CATALOG FLOW --- */}
              {mode === 'catalog' && (
                <div className="space-y-4">
                  {/* Selected Problem State (if picked) */}
                  {selectedCatalogProblem ? (
                    <div className="p-4 rounded-xl border border-brand-500/40 bg-brand-50/40 dark:bg-brand-950/20 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <PlatformBadge platform={selectedCatalogProblem.platform} size="sm" />
                            {/* Serial / Problem number */}
                            {selectedCatalogProblem.problem_number && (
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-neutral-200/60 dark:bg-dark-surface text-neutral-600 dark:text-neutral-300">
                                {selectedCatalogProblem.problem_number}
                              </span>
                            )}
                            {selectedCatalogProblem.rating ? (
                              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                                ★ {selectedCatalogProblem.rating}
                              </span>
                            ) : selectedCatalogProblem.difficulty ? (
                              <span
                                className={`text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                  selectedCatalogProblem.difficulty === 'easy'
                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                    : selectedCatalogProblem.difficulty === 'medium'
                                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                    : 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
                                }`}
                              >
                                {selectedCatalogProblem.difficulty}
                              </span>
                            ) : null}
                          </div>
                          <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-snug">
                            {selectedCatalogProblem.title}
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={handleClearSelection}
                          className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 underline shrink-0 font-medium"
                        >
                          Change
                        </button>
                      </div>

                      {/* Working URL & Tags */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-brand-200/50 dark:border-brand-900/50">
                        <a
                          href={selectedCatalogProblem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                        >
                          <span>Open in {formatPlatformBadge(selectedCatalogProblem.platform)}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        {selectedCatalogProblem.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {selectedCatalogProblem.tags.slice(0, 3).map((t) => (
                              <span
                                key={t}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-200/60 dark:bg-dark-surface text-neutral-700 dark:text-neutral-300"
                              >
                                {t}
                              </span>
                            ))}
                            {selectedCatalogProblem.tags.length > 3 && (
                              <span className="text-[10px] text-neutral-400">
                                +{selectedCatalogProblem.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Search & Combobox */
                    <div className="space-y-3">
                      {/* Platform Filter Tabs */}
                      <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-dark-surfaceHover rounded-lg text-xs">
                        {[
                          { id: 'all', label: 'All Catalog', count: `${(catalogStats.total / 1000).toFixed(1)}k` },
                          { id: 'leetcode', label: 'LeetCode', count: catalogStats.leetcode.toLocaleString() },
                          { id: 'codeforces', label: 'Codeforces', count: catalogStats.codeforces.toLocaleString() },
                          { id: 'gfg', label: 'GFG', count: catalogStats.gfg > 100 ? `${catalogStats.gfg}` : 'Organic' },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setPlatformTab(tab.id as Platform | 'all')}
                            className={`flex-1 py-1.5 px-2 rounded-md font-medium text-center transition-all flex items-center justify-center gap-1 ${
                              platformTab === tab.id
                                ? 'bg-white dark:bg-dark-surface text-neutral-900 dark:text-white shadow-xs font-semibold'
                                : 'text-neutral-500 dark:text-dark-textMuted hover:text-neutral-800 dark:hover:text-neutral-200'
                            }`}
                          >
                            <span>{tab.label}</span>
                            <span className="text-[10px] opacity-70">({tab.count})</span>
                          </button>
                        ))}
                      </div>

                      {/* Search Input Box */}
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                          {isSearching ? (
                            <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                          ) : (
                            <Search className="w-4 h-4" />
                          )}
                        </div>
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search 15,000+ problems (e.g. Two Sum, 1500A, DP, Graph)..."
                          className="w-full bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border focus:border-brand-500 rounded-lg pl-9 pr-9 py-2.5 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none transition-colors shadow-xs"
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* GFG Specific Notification if GFG tab chosen */}
                      {platformTab === 'gfg' && (
                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                          <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                          <div>
                            <span className="font-semibold">GFG Coverage Note:</span> GeeksforGeeks has no official public bulk API. Classic SDE problems are pre-seeded; adding any GFG link via the manual flow auto-populates the catalog for everyone.
                          </div>
                        </div>
                      )}

                      {/* Results List — scrollable, shows up to 50 results */}
                      <div className="border border-neutral-200 dark:border-dark-border rounded-xl bg-neutral-50/50 dark:bg-dark-bg/40 divide-y divide-neutral-200/70 dark:divide-dark-border/60 max-h-96 overflow-y-auto">
                        {searchResults.length === 0 ? (
                          <div className="p-6 text-center">
                            <p className="text-xs text-neutral-500 dark:text-dark-textMuted">
                              {isSearching
                                ? 'Searching catalog...'
                                : `No problems found matching "${searchQuery}".`}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setMode('manual');
                                if (searchQuery.startsWith('http')) {
                                  setUrl(searchQuery);
                                }
                              }}
                              className="mt-2 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
                            >
                              <span>Add problem manually with link</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          searchResults.map((prob) => (
                            <button
                              key={`${prob.platform}-${prob.external_id}`}
                              type="button"
                              onClick={() => handleSelectCatalogProblem(prob)}
                              className="w-full text-left px-3.5 py-2.5 hover:bg-white dark:hover:bg-dark-surface transition-colors flex items-center justify-between gap-3 group"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <PlatformBadge platform={prob.platform} size="sm" />
                                  {/* Serial number: "#1" for LC, "4A" for CF */}
                                  {prob.problem_number && (
                                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-neutral-200/60 dark:bg-dark-surface text-neutral-600 dark:text-neutral-300 shrink-0">
                                      {prob.problem_number}
                                    </span>
                                  )}
                                  {prob.rating ? (
                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400">
                                      ★ {prob.rating}
                                    </span>
                                  ) : prob.difficulty ? (
                                    <span
                                      className={`text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                        prob.difficulty === 'easy'
                                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                          : prob.difficulty === 'medium'
                                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                          : 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
                                      }`}
                                    >
                                      {prob.difficulty}
                                    </span>
                                  ) : null}

                                  {prob.is_paid_only && (
                                    <span className="text-[10px] text-amber-500 font-medium">
                                      Premium
                                    </span>
                                  )}
                                </div>

                                <div className="text-xs font-semibold text-neutral-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                  {prob.title}
                                </div>

                                {prob.tags.length > 0 && (
                                  <div className="flex items-center gap-1 mt-1 text-[11px] text-neutral-400 truncate">
                                    <Tag className="w-2.5 h-2.5 shrink-0" />
                                    <span>{prob.tags.slice(0, 4).join(', ')}</span>
                                    {prob.tags.length > 4 && (
                                      <span>+{prob.tags.length - 4}</span>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => handleQuickAdd(e, prob)}
                                  className="px-2 py-1 text-[11px] font-semibold bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/50 dark:hover:bg-brand-900/50 text-brand-600 dark:text-brand-400 rounded-md border border-brand-200/60 dark:border-brand-800/40 transition-colors flex items-center gap-1"
                                  title="Add instantly to revision queue"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>1-Tap Add</span>
                                </button>
                                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                                  <span>Edit</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>

                      {/* Manual Fallback Link */}
                      <div className="pt-2 flex items-center justify-between text-xs">
                        <span className="text-neutral-500 dark:text-dark-textMuted">
                          Can't find what you're looking for?
                        </span>
                        <button
                          type="button"
                          onClick={() => setMode('manual')}
                          className="font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                        >
                          <span>Add manually with URL</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* --- MODE 2: MANUAL URL PASTE & VERIFY FLOW (ORIGINAL FALLBACK) --- */}
              {mode === 'manual' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        Problem Link <span className="text-rose-500">*</span>
                      </label>
                      {platform && (
                        <div className="flex items-center gap-1.5">
                          <PlatformBadge platform={platform} size="sm" />
                          {canonicalUrl && (
                            <a
                              href={canonicalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-brand-600 hover:underline inline-flex items-center gap-0.5"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="relative flex items-center">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onBlur={() => {
                          if (url && !title) handleAutoExtractManual();
                        }}
                        placeholder="https://leetcode.com/problems/two-sum/ or GFG or Codeforces..."
                        className={`w-full bg-neutral-50 dark:bg-dark-bg border ${
                          urlError
                            ? 'border-rose-400 focus:border-rose-500'
                            : 'border-neutral-200 dark:border-dark-border focus:border-brand-500'
                        } rounded-lg px-3.5 py-2 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none transition-colors pr-24`}
                      />

                      <button
                        type="button"
                        onClick={handleAutoExtractManual}
                        disabled={isVerifying || !url.trim()}
                        className="absolute right-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-dark-surface border border-neutral-200 dark:border-dark-border hover:bg-neutral-50 text-neutral-700 dark:text-neutral-300 text-xs font-medium flex items-center gap-1 transition-colors disabled:opacity-40"
                      >
                        {isVerifying ? (
                          <Loader2 className="w-3 h-3 animate-spin text-brand-600" />
                        ) : (
                          <Sparkles className="w-3 h-3 text-brand-600 dark:text-brand-400" />
                        )}
                        <span>{isVerifying ? 'Fetching' : 'Extract'}</span>
                      </button>
                    </div>

                    {urlError && (
                      <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{urlError}</span>
                      </p>
                    )}

                    {isLinkVerified && !urlError && (
                      <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Verified problem metadata</span>
                      </p>
                    )}
                  </div>

                  {/* Title & Difficulty */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Problem Title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Trapping Rain Water"
                        className="w-full bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border focus:border-brand-500 rounded-lg px-3.5 py-2 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Difficulty
                      </label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                        className="w-full bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border focus:border-brand-500 rounded-lg px-2.5 py-2 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none transition-colors"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  {/* Organic Catalog Community Notice */}
                  <div className="p-3 rounded-lg bg-neutral-100 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                    <Database className="w-4 h-4 text-brand-600 shrink-0" />
                    <span>
                      Adding this link also adds it to the shared catalog so it's searchable next time.
                    </span>
                  </div>
                </div>
              )}

              {/* --- COMMON FIELDS (Shown once a problem is picked or in manual mode) --- */}
              {(selectedCatalogProblem || mode === 'manual') && (
                <>
                  {/* Tags / Patterns */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Algorithm Patterns
                    </label>

                    {selectedTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {selectedTags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-dark-surfaceHover text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-dark-border"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => toggleTag(tag)}
                              className="text-neutral-400 hover:text-neutral-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="max-h-24 overflow-y-auto p-2 rounded-lg border border-neutral-200 dark:border-dark-border bg-neutral-50 dark:bg-dark-bg/60 flex flex-wrap gap-1">
                      {PRESET_TAGS.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={`text-[11px] font-medium px-2 py-0.5 rounded transition-colors ${
                              isSelected
                                ? 'bg-brand-600 text-white'
                                : 'bg-white dark:bg-dark-surface text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-dark-surfaceHover border border-neutral-200 dark:border-dark-border'
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="text"
                        value={customTagInput}
                        onChange={(e) => setCustomTagInput(e.target.value)}
                        onKeyDown={handleAddCustomTag}
                        placeholder="Add custom pattern..."
                        className="flex-1 bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border focus:border-brand-500 rounded-lg px-3 py-1.5 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomTag}
                        className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  {/* Initial Confidence Rating */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Initial Confidence (SM-2 Interval)
                    </label>
                    <p className="text-[11px] text-neutral-500 dark:text-dark-textMuted mb-2">
                      Determines when this problem will appear for your first active recall session.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'struggled', label: 'Struggled', sub: 'In 1 day' },
                        { id: 'hints', label: 'Needed Hints', sub: 'In 1 day' },
                        { id: 'independent', label: 'Independent', sub: 'In 2 days' },
                        { id: 'instant', label: 'Instant Master', sub: 'In 4 days' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setConfidence(opt.id as InitialConfidence)}
                          className={`p-2.5 rounded-lg border text-left transition-colors ${
                            confidence === opt.id
                              ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/30 text-brand-900 dark:text-brand-200 font-semibold'
                              : 'border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-bg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50'
                          }`}
                        >
                          <div className="text-xs">{opt.label}</div>
                          <div className="text-[10px] text-neutral-400 mt-0.5">{opt.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Approach & Notes (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Key intuition, data structures used, edge cases, time/space complexity..."
                      className="w-full bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border focus:border-brand-500 rounded-lg p-3 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none transition-colors leading-relaxed"
                    />
                  </div>
                </>
              )}

              {/* Actions & Catalog Stats Footer */}
              <div className="pt-4 border-t border-neutral-200 dark:border-dark-border flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-dark-textMuted">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    Catalog: {catalogStats.leetcode.toLocaleString()} LeetCode ·{' '}
                    {catalogStats.codeforces.toLocaleString()} Codeforces · GFG (growing)
                  </span>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-auto">
                  <button type="button" onClick={closePanel} className="btn-secondary">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || (!selectedCatalogProblem && !title.trim())}
                    className="btn-primary disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save to Revision Queue</span>
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
