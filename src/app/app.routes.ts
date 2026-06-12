import { Routes } from '@angular/router';
import { PublicViewComponent } from './public-view.component';
import { AdminViewComponent } from './admin-view.component';

export const routes: Routes = [
  { path: '', component: PublicViewComponent },
  { path: 'admin', component: AdminViewComponent },
  { path: '**', redirectTo: '' }
];