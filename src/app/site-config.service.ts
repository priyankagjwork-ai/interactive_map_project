import { Injectable } from '@angular/core';
import { GitHubStorageService } from './github-storage.service';

export interface SiteConfig {
  title: string;
  summary: string;
}

@Injectable({ providedIn: 'root' })
export class SiteConfigService {
  private storageKey = 'interactive_map_site_config';
  private dataFilePath = 'data/config.json';
  private configCache: SiteConfig | null = null;
  private defaultConfig: SiteConfig = {
    title: 'NCCAHT Member & Partner Organizations Map',
    summary: 'Explore organizations and services across the state.'
  };
  private oldDefaultConfig: SiteConfig = {
    title: 'Interactive Map Project',
    summary: 'Explore organizations and services across the region.'
  };

  constructor(private gitHubService: GitHubStorageService) {
    this.loadConfig();
  }

  private loadConfig() {
    if (this.gitHubService.isConfigured()) {
      this.loadFromGitHub();
    } else {
      this.loadFromLocalStorage();
    }
  }

  private loadFromGitHub() {
    this.gitHubService.readFile(this.dataFilePath).subscribe({
      next: (response: any) => {
        try {
          const content = atob(response.content);
          this.configCache = JSON.parse(content);
        } catch (e) {
          console.error('Error parsing GitHub config:', e);
          this.configCache = { ...this.defaultConfig };
        }
      },
      error: (err) => {
        console.warn('Could not load config from GitHub, using local storage:', err);
        this.loadFromLocalStorage();
      }
    });
  }

  private loadFromLocalStorage() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const loadedConfig = JSON.parse(raw) as SiteConfig;
        this.configCache = this.migrateOldConfig(loadedConfig);
        if (this.configCache.title === this.defaultConfig.title && this.configCache.summary === this.defaultConfig.summary) {
          localStorage.setItem(this.storageKey, JSON.stringify(this.configCache));
        }
        return;
      }
    } catch (e) {
      console.error('Error parsing local config:', e);
    }
    this.configCache = { ...this.defaultConfig };
  }

  private migrateOldConfig(config: SiteConfig): SiteConfig {
    if (config.title === this.oldDefaultConfig.title && config.summary === this.oldDefaultConfig.summary) {
      return { ...this.defaultConfig };
    }
    return config;
  }

  getConfig(): SiteConfig {
    if (!this.configCache) {
      this.configCache = { ...this.defaultConfig };
    }
    return { ...this.configCache };
  }

  saveConfig(cfg: SiteConfig) {
    this.configCache = cfg;

    if (this.gitHubService.isConfigured()) {
      this.gitHubService.writeFile(
        this.dataFilePath,
        cfg,
        'Update site configuration'
      ).subscribe({
        error: (err) => {
          console.error('Error saving config to GitHub:', err);
          localStorage.setItem(this.storageKey, JSON.stringify(cfg));
        }
      });
    }

    localStorage.setItem(this.storageKey, JSON.stringify(cfg));
  }
}
