import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GitHubStorageService } from './github-storage.service';

@Component({
  selector: 'app-github-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `<div> </div>`
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
