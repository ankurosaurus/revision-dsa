import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/useUIStore';
import { useProblemStore } from '../../store/useProblemStore';
import { CheckCircle2, BookOpen } from 'lucide-react';

const COMMON_COMPANIES = ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Atlassian', 'Uber', 'Salesforce'];

export const OnboardingModal: React.FC = () => {
  const isOpen = useUIStore((s) => s.isOnboardingOpen);
  const setIsOpen = useUIStore((s) => s.setIsOnboardingOpen);
  const profile = useProblemStore((s) => s.profile);
  const updateProfile = useProblemStore((s) => s.updateProfile);

  const [name, setName] = useState(profile.full_name || '');
  const [dailyGoal, setDailyGoal] = useState<number>(profile.daily_goal || 5);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>(
    profile.target_companies || ['Google', 'Amazon']
  );
  const [customCompany, setCustomCompany] = useState('');

  if (!isOpen) return null;

  const toggleCompany = (company: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(company) ? prev.filter((c) => c !== company) : [...prev, company]
    );
  };

  const handleAddCustom = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = customCompany.trim();
      if (val && !selectedCompanies.includes(val)) {
        setSelectedCompanies([...selectedCompanies, val]);
        setCustomCompany('');
      }
    }
  };

  const handleSave = () => {
    updateProfile({
      full_name: name.trim() || 'Candidate',
      daily_goal: dailyGoal,
      target_companies: selectedCompanies,
    });
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 dark:bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.16 }}
          className="w-full max-w-md bg-white dark:bg-dark-surface border border-neutral-200 dark:border-dark-border rounded-xl p-6 shadow-elevated relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-dark-surfaceHover border border-neutral-200 dark:border-dark-border flex items-center justify-center text-brand-600 dark:text-brand-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Welcome to RevisionDSA
              </h2>
              <p className="text-xs text-neutral-500 dark:text-dark-textMuted mt-0.5">
                Set up your daily revision goal and target companies.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Candidate Name */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Sharma"
                className="w-full bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border focus:border-brand-500 rounded-lg px-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none transition-colors"
              />
            </div>

            {/* Daily Revision Target */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Daily Revision Target
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[3, 5, 8, 10].map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => setDailyGoal(goal)}
                    className={`py-1.5 px-2 rounded-lg border text-center text-xs transition-colors ${
                      dailyGoal === goal
                        ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-600 text-brand-700 dark:text-brand-300 font-semibold'
                        : 'bg-neutral-50 dark:bg-dark-bg border-neutral-200 dark:border-dark-border text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100'
                    }`}
                  >
                    {goal} / day
                  </button>
                ))}
              </div>
            </div>

            {/* Target Companies */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Target Companies (Optional)
              </label>
              <div className="flex flex-wrap gap-1 mb-2">
                {COMMON_COMPANIES.map((company) => {
                  const isSelected = selectedCompanies.includes(company);
                  return (
                    <button
                      key={company}
                      type="button"
                      onClick={() => toggleCompany(company)}
                      className={`text-[11px] font-medium px-2 py-0.5 rounded transition-colors ${
                        isSelected
                          ? 'bg-brand-600 text-white'
                          : 'bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100'
                      }`}
                    >
                      {company}
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                value={customCompany}
                onChange={(e) => setCustomCompany(e.target.value)}
                onKeyDown={handleAddCustom}
                placeholder="Add other company and press enter..."
                className="w-full bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border focus:border-brand-500 rounded-lg px-3 py-1.5 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6 pt-3 border-t border-neutral-200 dark:border-dark-border flex justify-end">
            <button
              onClick={handleSave}
              className="btn-primary w-full py-2 text-xs flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Get Started</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
