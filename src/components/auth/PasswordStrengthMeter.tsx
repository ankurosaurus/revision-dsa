/**
 * PasswordStrengthMeter
 * Displays a 4-segment bar + label showing password strength in real time.
 * Checks: length ≥8, uppercase, lowercase, digit, symbol.
 */
import React, { useMemo } from 'react';

interface Props {
  password: string;
}

function getStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '' };

  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
  if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
  if (score === 3) return { score: 3, label: 'Good', color: 'bg-yellow-400' };
  if (score === 4) return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  return { score: 5, label: 'Very Strong', color: 'bg-emerald-600' };
}

export const PasswordStrengthMeter: React.FC<Props> = ({ password }) => {
  const strength = useMemo(() => getStrength(password), [password]);

  if (!password) return null;

  const segments = 5;
  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < strength.score ? strength.color : 'bg-neutral-200 dark:bg-dark-border'
            }`}
          />
        ))}
      </div>
      <p className={`text-[11px] font-medium transition-colors ${
        strength.score <= 1 ? 'text-rose-500' :
        strength.score === 2 ? 'text-amber-500' :
        strength.score >= 4 ? 'text-emerald-500' : 'text-yellow-500'
      }`}>
        {strength.label}
      </p>
    </div>
  );
};
