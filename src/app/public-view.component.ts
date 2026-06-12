import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { Router } from '@angular/router';
import { MapBaseComponent } from './map-base.component';
import { AddressService } from './address.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-public-view',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './public-view.component.html'
})
export class PublicViewComponent extends MapBaseComponent {
  constructor(
    fb: FormBuilder,
    addressService: AddressService,
    http: HttpClient,
    authService: AuthService,
    private router: Router
  ) {
    super(fb, addressService, http, authService);
  }

  goToAdmin() {
    this.router.navigate(['/admin']);
  }
}
