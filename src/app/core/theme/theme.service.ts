import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'blogapp-theme';
  readonly darkMode = signal(this.getInitialTheme());

  constructor() {
    this.applyTheme(this.darkMode());
  }

  toggle(): void {
    const enabled = !this.darkMode();
    this.darkMode.set(enabled);
    this.applyTheme(enabled);
    this.document.defaultView?.localStorage.setItem(this.storageKey, enabled ? 'dark' : 'light');
  }

  private getInitialTheme(): boolean {
    const window = this.document.defaultView;
    const savedTheme = window?.localStorage.getItem(this.storageKey);

    if (savedTheme) return savedTheme === 'dark';
    return window?.matchMedia('(prefers-color-scheme: dark)').matches ?? false;
  }

  private applyTheme(enabled: boolean): void {
    this.document.documentElement.classList.toggle('dark-theme', enabled);
  }
}
