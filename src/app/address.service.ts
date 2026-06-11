import { Injectable } from '@angular/core';
import { GitHubStorageService } from './github-storage.service';

export interface LocationEntry {
  id: string;
  organizationName: string;
  organizationDetails: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  website: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private storageKey = 'savedLocations';
  private dataFilePath = 'data/locations.json';
  private locationCache: LocationEntry[] = [];
  private isInitialized = false;

  constructor(private gitHubService: GitHubStorageService) {
    this.initializeData();
  }

  private initializeData() {
    if (this.isInitialized) return;
    this.isInitialized = true;

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
          this.locationCache = JSON.parse(content);
        } catch (e) {
          console.error('Error parsing GitHub data:', e);
          this.locationCache = [];
        }
      },
      error: (err) => {
        console.warn('Could not load from GitHub, using local storage:', err);
        this.loadFromLocalStorage();
      }
    });
  }

  private loadFromLocalStorage() {
    const data = localStorage.getItem(this.storageKey);
    this.locationCache = data ? JSON.parse(data) : [];
  }

  saveLocation(location: LocationEntry): void {
    const locations = this.getLocations();
    location.id = location.id || this.generateId();
    locations.push(location);

    if (this.gitHubService.isConfigured()) {
      this.gitHubService.writeFile(
        this.dataFilePath,
        locations,
        `Add location: ${location.organizationName || 'Unknown'}`
      ).subscribe({
        error: (err) => {
          console.error('Error saving to GitHub:', err);
          localStorage.setItem(this.storageKey, JSON.stringify(locations));
        }
      });
    }

    localStorage.setItem(this.storageKey, JSON.stringify(locations));
    this.locationCache = locations;
  }

  getLocations(): LocationEntry[] {
    return [...this.locationCache];
  }

  deleteLocation(id: string): void {
    const locations = this.getLocations();
    const index = locations.findIndex(loc => loc.id === id);
    if (index > -1) {
      locations.splice(index, 1);

      if (this.gitHubService.isConfigured()) {
        this.gitHubService.writeFile(
          this.dataFilePath,
          locations,
          'Delete location'
        ).subscribe({
          error: (err) => {
            console.error('Error deleting from GitHub:', err);
            localStorage.setItem(this.storageKey, JSON.stringify(locations));
          }
        });
      }

      localStorage.setItem(this.storageKey, JSON.stringify(locations));
      this.locationCache = locations;
    }
  }

  updateLocation(id: string, location: LocationEntry): void {
    const locations = this.getLocations();
    const index = locations.findIndex(loc => loc.id === id);
    if (index > -1) {
      location.id = id;
      locations[index] = location;

      if (this.gitHubService.isConfigured()) {
        this.gitHubService.writeFile(
          this.dataFilePath,
          locations,
          `Update location: ${location.organizationName || 'Unknown'}`
        ).subscribe({
          error: (err) => {
            console.error('Error updating GitHub:', err);
            localStorage.setItem(this.storageKey, JSON.stringify(locations));
          }
        });
      }

      localStorage.setItem(this.storageKey, JSON.stringify(locations));
      this.locationCache = locations;
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getAddressString(location: LocationEntry): string {
    return `${location.street}, ${location.city}, ${location.state} ${location.zip}`;
  }
}
