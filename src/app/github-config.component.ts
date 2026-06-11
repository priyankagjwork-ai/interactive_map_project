import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GitHubStorageService } from './github-storage.service';

@Component({
  selector: 'app-github-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="github-config">
      <h3>GitHub Data Storage Setup</h3>
      
      <div class="config-status">
        <p *ngIf="isConfigured" class="success">✓ GitHub storage is configured</p>
        <p *ngIf="!isConfigured" class="info">GitHub storage is not configured yet</p>
      </div>

      <div class="form-group">
        <label for="owner">GitHub Username:</label>
        <input [(ngModel)]="owner" id="owner" placeholder="your-github-username" />
      </div>

      <div class="form-group">
        <label for="repo">GitHub Repository:</label>
        <input [(ngModel)]="repo" id="repo" placeholder="your-repo-name" />
      </div>

      <div class="form-group">
        <label for="token">GitHub Personal Access Token:</label>
        <input [(ngModel)]="token" id="token" type="password" placeholder="ghp_..." />
        <small>Token needs 'contents' and 'repo' permissions</small>
      </div>

      <div class="form-group">
        <label for="branch">Branch (default: main):</label>
        <input [(ngModel)]="branch" id="branch" placeholder="main" />
      </div>

      <button (click)="saveConfig()" class="btn-primary">Save GitHub Config</button>
      <button *ngIf="isConfigured" (click)="clearConfig()" class="btn-secondary">Clear Config</button>

      <div *ngIf="message" [class]="'message ' + messageType">
        {{ message }}
      </div>

      <details class="setup-guide">
        <summary>Setup Guide</summary>
        <ol>
          <li>Go to <a href="https://github.com/new" target="_blank">GitHub</a> and create a new private repository</li>
          <li>Name it something like "map-project-data"</li>
          <li>Create a folder called "data" in your repository and add empty placeholder files</li>
          <li>Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)</li>
          <li>Click "Generate new token" and select scopes: repo, contents</li>
          <li>Copy the token and paste it here</li>
          <li>Enter your GitHub username and repository name</li>
          <li>Click "Save GitHub Config"</li>
          <li>That's it! Data will now sync to GitHub</li>
        </ol>
      </details>
    </div>
  `,
  styles: [`
    .github-config {
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin: 20px 0;
    }

    .config-status {
      margin-bottom: 20px;
      padding: 10px;
      border-radius: 4px;
    }

    .config-status .success {
      background-color: #d4edda;
      color: #155724;
      margin: 0;
    }

    .config-status .info {
      background-color: #d1ecf1;
      color: #0c5460;
      margin: 0;
    }

    .form-group {
      margin-bottom: 15px;
    }

    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }

    .form-group input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
    }

    .form-group small {
      display: block;
      margin-top: 5px;
      color: #666;
    }

    button {
      padding: 10px 20px;
      margin-right: 10px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
    }

    .btn-primary:hover {
      background-color: #0056b3;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #545b62;
    }

    .message {
      margin-top: 15px;
      padding: 10px;
      border-radius: 4px;
    }

    .message.success {
      background-color: #d4edda;
      color: #155724;
    }

    .message.error {
      background-color: #f8d7da;
      color: #721c24;
    }

    .setup-guide {
      margin-top: 20px;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .setup-guide summary {
      cursor: pointer;
      font-weight: bold;
    }

    .setup-guide ol {
      margin-top: 10px;
      padding-left: 20px;
    }

    .setup-guide a {
      color: #007bff;
      text-decoration: none;
    }

    .setup-guide a:hover {
      text-decoration: underline;
    }
  `]
})
export class GitHubConfigComponent implements OnInit {
  owner = '';
  repo = '';
  token = '';
  branch = 'main';
  isConfigured = false;
  message = '';
  messageType = '';

  constructor(private gitHubService: GitHubStorageService) {}

  ngOnInit() {
    this.isConfigured = this.gitHubService.isConfigured();
    this.owner = localStorage.getItem('github_owner') || '';
    this.repo = localStorage.getItem('github_repo') || '';
    this.token = localStorage.getItem('github_token') || '';
    this.branch = localStorage.getItem('github_branch') || 'main';
  }

  saveConfig() {
    if (!this.owner || !this.repo || !this.token) {
      this.message = 'Please fill in all fields';
      this.messageType = 'error';
      return;
    }

    this.gitHubService.setConfig(this.owner, this.repo, this.token, this.branch);
    this.isConfigured = true;
    this.message = 'GitHub configuration saved successfully!';
    this.messageType = 'success';
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }

  clearConfig() {
    localStorage.removeItem('github_token');
    localStorage.removeItem('github_owner');
    localStorage.removeItem('github_repo');
    localStorage.removeItem('github_branch');
    this.owner = '';
    this.repo = '';
    this.token = '';
    this.branch = 'main';
    this.isConfigured = false;
    this.message = 'GitHub configuration cleared';
    this.messageType = 'success';
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }
}
