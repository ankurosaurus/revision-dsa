/**
 * pistonService.ts
 *
 * Client service for executing code in sandboxed environments via Piston API.
 * Supports: Python 3.10, Java 15, C 10.2, C++ 10.2
 *
 * Implements 10-second timeout via AbortController, error parsing,
 * execution timing, and status badges (SUCCESS, COMPILE_ERROR, RUNTIME_ERROR, TIMEOUT).
 */

import { SupportedLanguage } from '../types';

export type ExecutionStatus = 'SUCCESS' | 'COMPILE_ERROR' | 'RUNTIME_ERROR' | 'TIMEOUT' | 'ERROR';

export interface ExecutionResult {
  status: ExecutionStatus;
  stdout: string;
  stderr: string;
  durationMs: number;
  memory?: string;
  language: SupportedLanguage;
  version?: string;
}

export interface LanguageConfig {
  id: SupportedLanguage;
  label: string;
  monacoLang: string;
  pistonLangV1: string;
  pistonLangV2: string;
  version: string;
  fileExt: string;
  starterTemplate: string;
}

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageConfig> = {
  python: {
    id: 'python',
    label: 'Python 3.10',
    monacoLang: 'python',
    pistonLangV1: 'python3',
    pistonLangV2: 'python',
    version: '3.10.0',
    fileExt: 'py',
    starterTemplate: `import sys

def solution():
    # Read custom input from stdin if provided
    raw_input = sys.stdin.read().strip()
    if raw_input:
        print(f"Received input: {raw_input}")
    
    # Write your solution algorithm here:
    print("Solution executed successfully!")

if __name__ == "__main__":
    solution()
`,
  },
  java: {
    id: 'java',
    label: 'Java 15',
    monacoLang: 'java',
    pistonLangV1: 'java',
    pistonLangV2: 'java',
    version: '15.0.2',
    fileExt: 'java',
    starterTemplate: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (scanner.hasNextLine()) {
            System.out.println("Received input: " + scanner.nextLine());
        }

        // Write your solution algorithm here:
        System.out.println("Solution executed successfully!");
    }
}
`,
  },
  c: {
    id: 'c',
    label: 'C (GCC 10.2)',
    monacoLang: 'c',
    pistonLangV1: 'c',
    pistonLangV2: 'c',
    version: '10.2.0',
    fileExt: 'c',
    starterTemplate: `#include <stdio.h>
#include <string.h>

int main() {
    char buffer[256];
    if (fgets(buffer, sizeof(buffer), stdin)) {
        buffer[strcspn(buffer, "\\n")] = 0;
        printf("Received input: %s\\n", buffer);
    }

    // Write your solution algorithm here:
    printf("Solution executed successfully!\\n");
    return 0;
}
`,
  },
  cpp: {
    id: 'cpp',
    label: 'C++ (G++ 10.2)',
    monacoLang: 'cpp',
    pistonLangV1: 'cpp',
    pistonLangV2: 'c++',
    version: '10.2.0',
    fileExt: 'cpp',
    starterTemplate: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

int main() {
    // Fast I/O
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string inputLine;
    if (getline(cin, inputLine) && !inputLine.empty()) {
        cout << "Received input: " << inputLine << "\\n";
    }

    // Write your solution algorithm here:
    cout << "Solution executed successfully!" << "\\n";
    return 0;
}
`,
  },
};

const CUSTOM_PISTON_URL = import.meta.env.VITE_PISTON_URL as string | undefined;

/**
 * Executes source code via Piston execution sandbox.
 * Handles timeouts (10s limit), compilation failures, and runtime errors cleanly.
 */
export async function executeCode(options: {
  language: SupportedLanguage;
  code: string;
  stdin?: string;
  timeoutMs?: number;
}): Promise<ExecutionResult> {
  const { language, code, stdin = '', timeoutMs = 10000 } = options;
  const config = SUPPORTED_LANGUAGES[language];
  const startTime = performance.now();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // 1. If custom Piston endpoint is specified in env (or self-hosted v2)
    if (CUSTOM_PISTON_URL) {
      try {
        const v2Response = await fetch(`${CUSTOM_PISTON_URL}/api/v2/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language: config.pistonLangV2,
            version: config.version,
            files: [{ content: code }],
            stdin: stdin,
          }),
          signal: controller.signal,
        });

        if (v2Response.ok) {
          clearTimeout(timeoutId);
          const data = await v2Response.json();
          const duration = Math.round(performance.now() - startTime);

          const runStdout = data.run?.stdout || '';
          const runStderr = data.run?.stderr || '';
          const compileStderr = data.compile?.stderr || '';
          const stderr = compileStderr ? `${compileStderr}\n${runStderr}`.trim() : runStderr;

          let status: ExecutionStatus = 'SUCCESS';
          if (compileStderr || data.compile?.code !== 0 && data.compile?.code !== undefined) {
            status = 'COMPILE_ERROR';
          } else if (data.run?.code !== 0 || runStderr) {
            status = 'RUNTIME_ERROR';
          }

          return {
            status,
            stdout: runStdout,
            stderr,
            durationMs: duration,
            language,
            version: data.version || config.version,
          };
        }
      } catch (e: any) {
        if (e && e.name === 'AbortError') {
          return {
            status: 'TIMEOUT',
            stdout: '',
            stderr: `Execution timed out (${timeoutMs / 1000}s limit exceeded)`,
            durationMs: timeoutMs,
            language,
          };
        }
      }
    }

    // 2. Primary active execution endpoint: Piston API v1
    const response = await fetch('https://emkc.org/api/v1/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: config.pistonLangV1,
        source: code,
        stdin: stdin,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const duration = Math.round(performance.now() - startTime);

    if (!response.ok) {
      const errorText = await response.text();
      return {
        status: 'ERROR',
        stdout: '',
        stderr: `Compiler service returned HTTP ${response.status}: ${errorText}`,
        durationMs: duration,
        language,
      };
    }

    const data = await response.json();
    const stdout = data.stdout || '';
    const stderr = data.stderr || (data.ran === false && data.output ? data.output : '');

    let status: ExecutionStatus = 'SUCCESS';
    if (data.ran === false) {
      if (
        stderr.includes('SyntaxError') ||
        stderr.includes('error:') ||
        stderr.includes('javac') ||
        stderr.includes('Compilation failed')
      ) {
        status = 'COMPILE_ERROR';
      } else {
        status = 'RUNTIME_ERROR';
      }
    } else if (stderr && stderr.trim().length > 0) {
      status = stdout ? 'SUCCESS' : 'RUNTIME_ERROR';
    }

    return {
      status,
      stdout,
      stderr,
      durationMs: duration,
      language,
      version: data.version || config.version,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const duration = Math.round(performance.now() - startTime);

    if (err && err.name === 'AbortError') {
      return {
        status: 'TIMEOUT',
        stdout: '',
        stderr: `Execution timed out (${timeoutMs / 1000}s limit exceeded)`,
        durationMs: timeoutMs,
        language,
      };
    }

    return {
      status: 'ERROR',
      stdout: '',
      stderr: err?.message || 'Network error while contacting code execution engine.',
      durationMs: duration,
      language,
    };
  }
}
