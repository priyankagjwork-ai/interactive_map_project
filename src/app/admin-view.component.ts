import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MapBaseComponent } from './map-base.component';
import { AddressService } from './address.service';
import { AuthService } from './auth.service';
import { GitHubConfigComponent } from './github-config.component';

@Component({
  selector: 'app-admin-view',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, GoogleMapsModule, HttpClientModule, GitHubConfigComponent],
  templateUrl: './admin-view.component.html'
})
export class AdminViewComponent extends MapBaseComponent {
  constructor(
    fb: FormBuilder,
    addressService: AddressService,
    http: HttpClient,
    authService: AuthService
  ) {
    super(fb, addressService, http, authService);
  }

  override ngOnInit() {
    super.ngOnInit();
    this.addressForm = this.fb.group({
      organizationName: ['', Validators.required],
      organizationDetails: [''],
      street: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', [Validators.pattern(/^\d{5}(-\d{4})?$/)]],
      website: [''],
      email: ['', [Validators.pattern(/^[^\s@]*@[^\s@]+\.[^\s@]+$|^$/)]]
    });
  }

  onSubmit() {
    if (!this.addressForm.valid) {
      alert('Please fill in all required fields and ensure email format is valid (if provided). ZIP is optional.');
      return;
    }

    const formData = this.addressForm.value;
    const location = {
      id: this.editingLocationId || this.generateId(),
      organizationName: formData.organizationName,
      organizationDetails: formData.organizationDetails,
      street: formData.street,
      city: formData.city,
      state: formData.state,
      zip: formData.zip,
      website: formData.website,
      email: formData.email
    };

    if (this.editingLocationId) {
      this.addressService.updateLocation(this.editingLocationId, location);
      this.editingLocationId = null;
    } else {
      this.addressService.saveLocation(location);
    }

    this.savedLocations = this.addressService.getLocations();
    this.applyStateFilter();
    this.loadAllMarkers();
    this.addressForm.reset();
  }

  editAddress(location: any, event: Event) {
    event.stopPropagation();
    this.editingLocationId = location.id;
    this.addressForm.patchValue({
      organizationName: location.organizationName,
      organizationDetails: location.organizationDetails,
      street: location.street,
      city: location.city,
      state: location.state,
      zip: location.zip,
      website: location.website,
      email: location.email
    });
  }

  deleteAddress(location: any, event: Event) {
    event.stopPropagation();
    if (confirm(`Delete ${location.organizationName}?`)) {
      this.addressService.deleteLocation(location.id);
      this.savedLocations = this.addressService.getLocations();
      this.applyStateFilter();
      this.loadAllMarkers();
      this.markerPosition = null;
    }
  }

  promptForPassword(): void {
    const password = prompt('Enter password to add/edit pins:');
    if (password !== null) {
      if (this.authService.authenticate(password)) {
        this.isAuthenticated = true;
      } else {
        alert('Incorrect password');
      }
    }
  }
}
