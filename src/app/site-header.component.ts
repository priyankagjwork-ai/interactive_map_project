import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SiteConfigService } from './site-config.service';

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './site-header.component.html',
  styleUrls: ['./site-header.component.scss']
})
export class SiteHeaderComponent {
  editing = false;
  adminMode = false;
  title = '';
  summary = '';

  constructor(private cfg: SiteConfigService) {
    const c = this.cfg.getConfig();
    this.title = c.title;
    this.summary = c.summary;
  }

  enterAdmin() {
    const pw = prompt('Enter admin password to edit header (temporary local mode)');
    // Temporary/local gate: password 'admin' enables editing for the session.
    if (pw === 'admin') {
      this.adminMode = true;
      sessionStorage.setItem('site-admin', '1');
    } else {
      alert('Incorrect password');
    }
  }

  startEdit() {
    if (!this.adminMode && sessionStorage.getItem('site-admin') !== '1') {
      this.enterAdmin();
    }
    if (this.adminMode || sessionStorage.getItem('site-admin') === '1') {
      this.editing = true;
    }
  }

  save() {
    this.cfg.saveConfig({ title: this.title || '', summary: this.summary || '' });
    this.editing = false;
  }

  cancel() {
    const c = this.cfg.getConfig();
    this.title = c.title;
    this.summary = c.summary;
    this.editing = false;
  }
}
