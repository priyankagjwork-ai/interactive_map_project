import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GitHubStorageService {
  private githubToken = localStorage.getItem('github_token') || '';
  private githubOwner = '';
  private githubRepo = '';
  private githubBranch = 'main';
  private apiBaseUrl = 'https://api.github.com/repos';

  constructor(private http: HttpClient) {
    this.loadConfig();
  }

  setConfig(owner: string, repo: string, token: string, branch: string = 'main') {
    this.githubOwner = owner;
    this.githubRepo = repo;
    this.githubToken = token;
    this.githubBranch = branch;
    localStorage.setItem('github_token', token);
    localStorage.setItem('github_owner', owner);
    localStorage.setItem('github_repo', repo);
    localStorage.setItem('github_branch', branch);
  }

  private loadConfig() {
    this.githubOwner = localStorage.getItem('github_owner') || '';
    this.githubRepo = localStorage.getItem('github_repo') || '';
    this.githubToken = localStorage.getItem('github_token') || '';
    this.githubBranch = localStorage.getItem('github_branch') || 'main';
  }

  isConfigured(): boolean {
    return !!(this.githubToken && this.githubOwner && this.githubRepo);
  }

  getFileUrl(filePath: string): string {
    return `${this.apiBaseUrl}/${this.githubOwner}/${this.githubRepo}/contents/${filePath}`;
  }

  readFile(filePath: string): Observable<any> {
    const url = this.getFileUrl(filePath);
    const headers = this.getHeaders();

    return this.http.get<any>(url, { headers }).pipe(
      catchError(error => {
        console.error('Error reading file from GitHub:', error);
        return throwError(() => new Error(`Failed to read ${filePath} from GitHub`));
      })
    );
  }

  writeFile(filePath: string, content: any, message: string): Observable<any> {
    const url = this.getFileUrl(filePath);
    const headers = this.getHeaders();
    const contentBase64 = btoa(JSON.stringify(content, null, 2));

    // First, try to get the file to get its SHA (required for updates)
    return this.getFileSha(filePath).pipe(
      catchError(() => {
        // File doesn't exist yet, that's fine for creation
        return new Observable(obs => {
          obs.next(null);
          obs.complete();
        });
      }),
      switchMap((response: any) => {
        const sha = response?.sha;
        const body = {
          message: message,
          content: contentBase64,
          branch: this.githubBranch,
          ...(sha && { sha })
        };

        return this.http.put<any>(url, body, { headers });
      }),
      catchError(error => {
        console.error('Error writing file to GitHub:', error);
        return throwError(() => new Error(`Failed to write ${filePath} to GitHub`));
      })
    );
  }

  private getFileSha(filePath: string): Observable<any> {
    return this.readFile(filePath);
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28'
    });
  }
}
