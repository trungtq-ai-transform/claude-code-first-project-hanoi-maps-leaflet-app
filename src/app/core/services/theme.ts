import { Service, effect, signal } from '@angular/core';

const STORAGE_KEY = 'theme-preference';

function getInitialIsDark(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') {
    return stored === 'dark';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

@Service()
export class Theme {
  private hasExplicitPreference = localStorage.getItem(STORAGE_KEY) !== null;
  readonly isDark = signal<boolean>(getInitialIsDark());

  constructor() {
    effect(() => {
      document.documentElement.classList.toggle('dark', this.isDark());
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
      if (!this.hasExplicitPreference) {
        this.isDark.set(event.matches);
      }
    });
  }

  toggle(): void {
    const next = !this.isDark();
    this.isDark.set(next);
    this.hasExplicitPreference = true;
    localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
  }
}
