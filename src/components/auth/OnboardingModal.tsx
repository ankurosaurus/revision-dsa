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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-subtle/80 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.16 }}
          className="w-full max-w-md bg-surface border border-line rounded-[10px] p-6 shadow-lg relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-[10px] bg-surface-hover border border-line flex items-center justify-center text-[#2D5A6B]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-ink">
                Welcome to RevisionDSA
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Set up your daily revision goal and target companies.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Candidate Name */}
            <div>
              <label className="block text-xs font-medium text-ink mb-1">
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Sharma"
                className="w-full bg-surface-subtle border border-line focus:border-[#2D5A6B] rounded-[10px] px-3 py-2 text-xs text-ink placeholder:text-ink-muted focus:outline-none transition-colors"
              />
            </div>

            {/* Daily Revision Target */}
            <div>
              <label className="block text-xs font-medium text-ink mb-1">
                Daily revision target
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[3, 5, 8, 10].map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => setDailyGoal(goal)}
                    className={`py-1.5 px-2 rounded-[10px] border text-center text-xs transition-colors font-medium ${
                      dailyGoal === goal
                        ? 'bg-[#2D5A6B]/10 border-[#2D5A6B] text-ink font-semibold'
                        : 'bg-surface-subtle border-line text-ink-muted hover:text-ink hover:bg-surface-hover'
                    }`}
                  >
                    {goal} / day
                  </button>
                ))}
              </div>
            </div>

            {/* Target Companies */}
            <div>
              <label className="block text-xs font-medium text-ink mb-1">
                Target companies (optional)
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {COMMON_COMPANIES.map((company) => {
                  const isSelected = selectedCompanies.includes(company);
                  return (
                    <button
                      key={company}
                      type="button"
                      onClick={() => toggleCompany(company)}
                      className={`text-xs font-medium px-2 py-0.5 rounded-[10px] transition-colors ${
                        isSelected
                          ? 'bg-[#2D5A6B] text-white font-medium'
                          : 'bg-surface-subtle border border-line text-ink-muted hover:text-ink hover:bg-surface-hover'
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
                className="w-full bg-surface-subtle border border-line focus:border-[#2D5A6B] rounded-[10px] px-3 py-1.5 text-xs text-ink placeholder:text-ink-muted focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6 pt-3 border-t border-line flex justify-end">
            <button
              onClick={handleSave}
              className="btn-primary w-full py-2 text-xs flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Get started</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
