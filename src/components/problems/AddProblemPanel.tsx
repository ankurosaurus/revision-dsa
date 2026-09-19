import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Tag,
  Undo2,
  Trash2,
} from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { useProblemStore } from '../../store/useProblemStore';
import { Platform, Difficulty, InitialConfidence, CatalogProblem, CatalogStats, Problem } from '../../types';
import { detectAndValidateUrl, verifyAndFetchMetadata } from '../../lib/urlValidators';
import { PRESET_TAGS } from '../../lib/sampleData';
import { searchCatalog, getCatalogStats } from '../../lib/catalogService';
import { PlatformBadge } from './PlatformBadge';
import { DifficultyBadge } from './DifficultyBadge';

export const AddProblemPanel: React.FC = () => {
  const isOpen = useUIStore((s) => s.isAddPanelOpen);
  const closePanel = useUIStore((s) => s.closeAddPanel);
  const problems = useProblemStore((s) => s.problems);
  const addProblem = useProblemStore((s) => s.addProblem);
  const deleteProblem = useProblemStore((s) => s.deleteProblem);
  const restoreProblem = useProblemStore((s) => s.restoreProblem);

  // Fast single-pass O(1) map of user's active problems matching on catalog_id or url
  const userProblemsMap = useMemo(() => {
    const map = new Map<string, Problem>();
    for (const p of problems) {
      if (p.catalog_id) map.set(p.catalog_id, p);
      if (p.url) map.set(p.url, p);
    }
    return map;
  }, [problems]);

  // Toast & optimistic add/remove state with 5s Undo
  const [toast, setToast] = useState<{
    type: 'added' | 'removed';
    id: string;
    title: string;
    problem: Problem;
  } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleToggleProblem = async (e: React.MouseEvent, prob: CatalogProblem) => {
    e.stopPropagation();
    const existing = userProblemsMap.get(prob.id) || userProblemsMap.get(prob.url);
    if (existing) {
      try {
        await deleteProblem(existing.id);
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setToast({
          type: 'removed',
          id: existing.id,
          title: prob.title,
          problem: existing,
        });
        toastTimerRef.current = setTimeout(() => setToast(null), 5000);
      } catch (err) {
        console.error('Failed to remove problem:', err);
      }
    } else {
      try {
        const added = await addProblem({
          catalog_id: prob.id,
          title: prob.title,
          url: prob.url,
          platform: prob.platform,
          difficulty: prob.difficulty || 'medium',
          tags: prob.tags || [],
        });
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setToast({
          type: 'added',
          id: added.id,
          title: prob.title,
          problem: added,
        });
        toastTimerRef.current = setTimeout(() => setToast(null), 5000);
      } catch (err) {
        console.error('Failed to add problem:', err);
      }
    }
  };

  const handleUndo = async () => {
    if (!toast) return;
    if (toast.type === 'added') {
      await deleteProblem(toast.id);
    } else if (toast.type === 'removed') {
      await restoreProblem(toast.problem);
    }
    setToast(null);
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
        return 'GeeksforGeeks';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePanel}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Slide-in Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="fixed top-0 right-0 z-50 h-full w-full max-w-xl bg-surface border-l border-line flex flex-col overflow-hidden text-ink"
          >
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-line flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-ink">
                    Log problem
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded-[10px] bg-surface-subtle text-ink-secondary border border-line">
                    Search-first
                  </span>
                </div>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Pick from 15,000+ indexed problems or enter a custom link.
                </p>
              </div>

              <button
                onClick={closePanel}
                className="p-1.5 rounded-[10px] text-ink-muted hover:text-ink hover:bg-surface-hover transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher Banner if Manual */}
            {mode === 'manual' && (
              <div className="px-6 py-2.5 bg-surface-subtle border-b border-line flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMode('catalog')}
                  className="text-xs font-medium text-ink hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to problem catalog search</span>
                </button>
                <span className="text-xs text-ink-muted">
                  Manual link mode
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
                    <div className="p-4 rounded-[10px] border border-line bg-surface-subtle space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <PlatformBadge platform={selectedCatalogProblem.platform} size="sm" />
                            {selectedCatalogProblem.problem_number && (
                              <span className="text-xs text-ink-secondary tabular-nums">
                                {selectedCatalogProblem.problem_number}
                              </span>
                            )}
                            {selectedCatalogProblem.rating ? (
                              <span className="text-xs text-ink-secondary font-medium tabular-nums">
                                ★ {selectedCatalogProblem.rating}
                              </span>
                            ) : selectedCatalogProblem.difficulty ? (
                              <DifficultyBadge difficulty={selectedCatalogProblem.difficulty} size="sm" />
                            ) : null}
                          </div>
                          <h3 className="text-base font-medium text-ink leading-snug">
                            {selectedCatalogProblem.title}
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={handleClearSelection}
                          className="text-xs text-ink-secondary hover:text-ink underline shrink-0 font-medium"
                        >
                          Change
                        </button>
                      </div>

                      {/* Working URL & Tags */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-line">
                        <a
                          href={selectedCatalogProblem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-ink hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                        >
                          <span>Open on {formatPlatformBadge(selectedCatalogProblem.platform)}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        {selectedCatalogProblem.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {selectedCatalogProblem.tags.slice(0, 3).map((t) => (
                              <span
                                key={t}
                                className="text-[11px] px-1.5 py-0.5 rounded bg-surface-subtle text-ink-secondary border border-line"
                              >
                                {t}
                              </span>
                            ))}
                            {selectedCatalogProblem.tags.length > 3 && (
                              <span className="text-[11px] text-ink-muted">
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
                      <div className="flex items-center gap-1 p-1 bg-surface-subtle border border-line rounded-[10px] text-xs">
                        {[
                          { id: 'all', label: 'All', count: `${(catalogStats.total / 1000).toFixed(1)}k` },
                          { id: 'leetcode', label: 'LeetCode', count: catalogStats.leetcode.toLocaleString() },
                          { id: 'codeforces', label: 'Codeforces', count: catalogStats.codeforces.toLocaleString() },
                          { id: 'gfg', label: 'GFG', count: catalogStats.gfg > 100 ? `${catalogStats.gfg}` : 'Organic' },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setPlatformTab(tab.id as Platform | 'all')}
                            className={`flex-1 py-1.5 px-2 rounded-[10px] font-medium text-center transition-all flex items-center justify-center gap-1 ${
                              platformTab === tab.id
                                ? 'bg-surface text-ink shadow-xs border border-line'
                                : 'text-ink-muted hover:text-ink'
                            }`}
                          >
                            <span>{tab.label}</span>
                            <span className="text-[10px] opacity-70">({tab.count})</span>
                          </button>
                        ))}
                      </div>

                      {/* Search Input Box */}
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
                          {isSearching ? (
                            <Loader2 className="w-4 h-4 animate-spin text-ink" />
                          ) : (
                            <Search className="w-4 h-4" />
                          )}
                        </div>
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search 15,000+ problems (e.g. Two Sum, 1500A, DP)…"
                          className="w-full bg-surface-subtle border border-line focus:border-[#2D5A6B] rounded-[10px] pl-9 pr-9 py-2.5 text-xs text-ink placeholder:text-ink-muted focus:outline-none transition-colors shadow-xs"
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink-muted hover:text-ink"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* GFG Specific Notification if GFG tab chosen */}
                      {platformTab === 'gfg' && (
                        <div className="p-3 rounded-[10px] bg-surface-subtle border border-line text-xs text-ink-secondary flex items-start gap-2">
                          <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#2D5A6B]" />
                          <div>
                            <span className="font-semibold text-ink">GFG note:</span> GeeksforGeeks problems are seeded from classic interview sets; entering any GFG link via manual mode saves it into the shared index for future recall.
                          </div>
                        </div>
                      )}

                      {/* Results List */}
                      <div className="border border-line rounded-[10px] bg-surface divide-y divide-line max-h-96 overflow-y-auto">
                        {searchResults.length === 0 ? (
                          <div className="p-6 text-center">
                            <p className="text-xs text-ink-muted">
                              {isSearching
                                ? 'Searching catalog…'
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
                              className="mt-2 text-xs font-medium text-[#2D5A6B] hover:underline inline-flex items-center gap-1"
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
                              className="w-full text-left px-3.5 py-2.5 hover:bg-surface-hover transition-colors flex items-center justify-between gap-3 group"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <PlatformBadge platform={prob.platform} size="sm" showLabel={false} />
                                  {prob.problem_number && (
                                    <span className="text-xs text-ink-secondary tabular-nums">
                                      {prob.problem_number}
                                    </span>
                                  )}
                                  {prob.rating ? (
                                    <span className="text-xs text-ink-secondary font-medium tabular-nums">
                                      ★ {prob.rating}
                                    </span>
                                  ) : prob.difficulty ? (
                                    <DifficultyBadge difficulty={prob.difficulty} size="sm" />
                                  ) : null}

                                  {prob.is_paid_only && (
                                    <span className="text-[10px] text-ink-secondary font-medium">
                                      Premium
                                    </span>
                                  )}
                                </div>

                                <div className="text-sm font-medium text-ink truncate group-hover:text-[#2D5A6B] transition-colors">
                                  {prob.title}
                                </div>

                                {prob.tags.length > 0 && (
                                  <div className="flex items-center gap-1 mt-1 text-[11px] text-ink-muted truncate">
                                    <Tag className="w-2.5 h-2.5 shrink-0" />
                                    <span>{prob.tags.slice(0, 4).join(', ')}</span>
                                    {prob.tags.length > 4 && (
                                      <span>+{prob.tags.length - 4}</span>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {userProblemsMap.has(prob.id) || userProblemsMap.has(prob.url) ? (
                                  <button
                                    type="button"
                                    onClick={(e) => handleToggleProblem(e, prob)}
                                    className="px-2.5 py-1 text-xs font-medium text-[#2D5A6B] bg-[#2D5A6B]/10 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-[#C25B5B] hover:border-rose-200 dark:hover:border-rose-900/40 rounded-[10px] border border-[#2D5A6B]/30 transition-colors flex items-center gap-1 group/btn"
                                    title="Click to remove from revision queue (has 5s Undo)"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 group-hover/btn:hidden" />
                                    <Trash2 className="w-3.5 h-3.5 hidden group-hover/btn:inline" />
                                    <span className="group-hover/btn:hidden">In revision</span>
                                    <span className="hidden group-hover/btn:inline">Remove</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(e) => handleToggleProblem(e, prob)}
                                    className="px-2.5 py-1 text-xs font-medium bg-surface hover:bg-surface-hover text-ink rounded-[10px] border border-line transition-colors flex items-center gap-1"
                                    title="Add instantly to revision queue"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>+ Add</span>
                                  </button>
                                )}
                              </div>
                            </button>
                          ))
                        )}
                      </div>

                      {/* Manual Fallback Link */}
                      <div className="pt-2 flex items-center justify-between text-xs">
                        <span className="text-ink-muted">
                          Can't find what you're looking for?
                        </span>
                        <button
                          type="button"
                          onClick={() => setMode('manual')}
                          className="font-medium text-ink hover:underline flex items-center gap-1"
                        >
                          <span>Add manually with URL</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* --- MODE 2: MANUAL URL PASTE & VERIFY FLOW --- */}
              {mode === 'manual' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-ink">
                        Problem link <span className="text-[#C25B5B]">*</span>
                      </label>
                      {platform && (
                        <div className="flex items-center gap-1.5">
                          <PlatformBadge platform={platform} size="sm" />
                          {canonicalUrl && (
                            <a
                              href={canonicalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-ink hover:underline inline-flex items-center gap-0.5 font-mono"
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
                        placeholder="https://leetcode.com/problems/two-sum/ or GFG or Codeforces…"
                        className={`w-full bg-surface-subtle border ${
                          urlError
                            ? 'border-[#C25B5B] focus:border-[#C25B5B]'
                            : 'border-line focus:border-[#2D5A6B]'
                        } rounded-[10px] px-3.5 py-2 text-xs text-ink placeholder:text-ink-muted focus:outline-none transition-colors pr-24 font-mono`}
                      />

                      <button
                        type="button"
                        onClick={handleAutoExtractManual}
                        disabled={isVerifying || !url.trim()}
                        className="absolute right-1.5 px-2.5 py-1 rounded-[10px] bg-surface border border-line hover:bg-surface-hover text-ink text-xs font-medium flex items-center gap-1 transition-colors disabled:opacity-40"
                      >
                        {isVerifying ? (
                          <Loader2 className="w-3 h-3 animate-spin text-ink" />
                        ) : (
                          <Sparkles className="w-3 h-3 text-[#2D5A6B]" />
                        )}
                        <span>{isVerifying ? 'Fetching' : 'Extract'}</span>
                      </button>
                    </div>

                    {urlError && (
                      <p className="mt-1.5 text-xs text-[#C25B5B] flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{urlError}</span>
                      </p>
                    )}

                    {isLinkVerified && !urlError && (
                      <p className="mt-1.5 text-xs text-[#5A9367] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Verified problem link</span>
                      </p>
                    )}
                  </div>

                  {/* Title & Difficulty */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-ink mb-1.5">
                        Problem title <span className="text-[#C25B5B]">*</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Trapping Rain Water"
                        className="w-full bg-surface-subtle border border-line focus:border-[#2D5A6B] rounded-[10px] px-3.5 py-2 text-xs text-ink placeholder:text-ink-muted focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-ink mb-1.5">
                        Difficulty
                      </label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                        className="w-full bg-surface-subtle border border-line focus:border-[#2D5A6B] rounded-[10px] px-2.5 py-2 text-xs text-ink focus:outline-none transition-colors cursor-pointer"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  {/* Community Notice */}
                  <div className="p-3 rounded-[10px] bg-surface-subtle border border-line text-xs text-ink-secondary flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#2D5A6B] shrink-0" />
                    <span>
                      Adding this problem URL indexes it into the shared catalog for future recall.
                    </span>
                  </div>
                </div>
              )}

              {/* --- COMMON FIELDS --- */}
              {(selectedCatalogProblem || mode === 'manual') && (
                <>
                  {/* Tags / Patterns */}
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1.5">
                      Algorithm archetypes
                    </label>

                    {selectedTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {selectedTags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-[10px] bg-surface-subtle text-ink border border-line"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => toggleTag(tag)}
                              className="text-ink-muted hover:text-ink"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="max-h-24 overflow-y-auto p-2 rounded-[10px] border border-line bg-surface-subtle flex flex-wrap gap-1">
                      {PRESET_TAGS.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={`text-xs px-2.5 py-0.5 rounded-[10px] transition-colors ${
                              isSelected
                                ? 'bg-[#2D5A6B] text-white font-medium'
                                : 'bg-surface text-ink-secondary hover:text-ink border border-line'
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
                        placeholder="Add custom pattern…"
                        className="flex-1 bg-surface-subtle border border-line focus:border-[#2D5A6B] rounded-[10px] px-3 py-1.5 text-xs text-ink placeholder:text-ink-muted focus:outline-none transition-colors"
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
                    <label className="block text-xs font-medium text-ink mb-1">
                      Initial confidence (SM-2 interval)
                    </label>
                    <p className="text-xs text-ink-muted mb-2">
                      Determines when this problem will appear for your first active recall session.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'struggled', label: 'Struggled', sub: 'In 1 day' },
                        { id: 'hints', label: 'Needed hints', sub: 'In 1 day' },
                        { id: 'independent', label: 'Independent', sub: 'In 2 days' },
                        { id: 'instant', label: 'Instant recall', sub: 'In 4 days' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setConfidence(opt.id as InitialConfidence)}
                          className={`p-2.5 rounded-[10px] border text-left transition-colors ${
                            confidence === opt.id
                              ? 'border-[#2D5A6B] bg-[#2D5A6B]/10 text-ink font-medium'
                              : 'border-line bg-surface-subtle text-ink-secondary hover:bg-surface-hover'
                          }`}
                        >
                          <div className="text-xs">{opt.label}</div>
                          <div className="text-[10px] text-ink-muted mt-0.5">{opt.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1">
                      Approach & notes (optional)
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Key algorithmic invariant, data structures used, edge cases, time/space complexity…"
                      className="w-full bg-surface-subtle border border-line focus:border-[#2D5A6B] rounded-[10px] p-3 text-xs text-ink placeholder:text-ink-muted focus:outline-none transition-colors leading-relaxed font-mono"
                    />
                  </div>
                </>
              )}

              {/* Actions & Catalog Stats Footer */}
              <div className="pt-4 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A6B]" />
                  <span>
                    Catalog: {catalogStats.leetcode.toLocaleString()} LeetCode · {catalogStats.codeforces.toLocaleString()} Codeforces
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
                    <span>Save to revision queue</span>
                  </button>
                </div>
              </div>
            </form>

            {/* 5-Second Undo Toast */}
            <AnimatePresence>
              {toast && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-20 left-6 right-6 z-50 flex items-center justify-between gap-3 px-4 py-3 bg-surface text-ink rounded-[10px] border border-line text-xs shadow-lg"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className={`w-6 h-6 rounded-[10px] flex items-center justify-center shrink-0 ${
                      toast.type === 'added' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-[#5A9367] border border-emerald-200 dark:border-emerald-900/40' : 'bg-rose-50 dark:bg-rose-950/20 text-[#C25B5B] border border-rose-200 dark:border-rose-900/40'
                    }`}>
                      {toast.type === 'added' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </div>
                    <span className="truncate">
                      {toast.type === 'added' ? 'Added ' : 'Removed '}
                      <strong className="font-semibold">{toast.title}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleUndo}
                    className="flex items-center gap-1 font-medium text-[#2D5A6B] hover:underline px-2 py-1 rounded-[10px] hover:bg-surface-hover transition-colors shrink-0"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>Undo</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
