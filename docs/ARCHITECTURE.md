# RevisionDSA Architecture

```
Client (React 19 + TypeScript + Zustand)
       │
       ├── useProblemStore (Local-First Offline Storage)
       │       │
       │       ├── SuperMemo SM-2 Engine (lib/spacedRepetition.ts)
       │       └── Supabase Client (syncs on network available)
       │
       └── AuthContext (Hybrid Authentication)
               ├── Supabase Auth (Email + Google OAuth + Anonymous)
               └── Local Storage Session Fallback
```
