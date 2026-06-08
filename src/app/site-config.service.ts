import { Injectable } from '@angular/core';

export interface SiteConfig {
  title: string;
  summary: string;
}

@Injectable({ providedIn: 'root' })
export class SiteConfigService {
  private storageKey = 'interactive_map_site_config';

  getConfig(): SiteConfig {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) return JSON.parse(raw) as SiteConfig;
    } catch (e) {
      // ignore
    }
    return {
      title: 'Interactive Map Project',
      summary: 'Explore organizations and services across the region.'
    };
  }

  saveConfig(cfg: SiteConfig) {
    localStorage.setItem(this.storageKey, JSON.stringify(cfg));
  }
}
