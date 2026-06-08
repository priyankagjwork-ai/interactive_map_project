import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GoogleMapsModule, GoogleMap } from '@angular/google-maps';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AddressService } from './address.service';
import { SiteHeaderComponent } from './site-header.component';

@Component({
  selector: 'app-root', 
  standalone: true,
  imports: [RouterOutlet, CommonModule, ReactiveFormsModule, GoogleMapsModule, HttpClientModule, FormsModule, SiteHeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild(GoogleMap) map?: GoogleMap;

  addressForm!: FormGroup;
  center: google.maps.LatLngLiteral = { lat: 39.8283, lng: -98.5795 }; // Center of USA
  zoom = 3; // Show entire USA more clearly on initial load
  savedAddresses: string[] = [];
  filteredAddresses: string[] = [];
  markerOptions: google.maps.MarkerOptions = { draggable: false };
  markerPosition: google.maps.LatLngLiteral | null = null;
  markers: google.maps.LatLngLiteral[] = [];
  editingAddress: string | null = null;
  selectedStateFilter: string = '';
  mapLoaded = false;

  states = [
    { code: '', name: 'All States' },
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' }
  ];

  constructor(
    private fb: FormBuilder,
    private addressService: AddressService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.addressForm = this.fb.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]]
    });

    this.savedAddresses = this.addressService.getAddresses();
    
    // Add sample addresses if none exist
    if (this.savedAddresses.length === 0) {
      const sampleAddresses = [
        '1600 Pennsylvania Avenue NW, Washington, DC 20500',
        '1 Infinite Loop, Cupertino, CA 95014',
        '350 5th Ave, New York, NY 10118',
        '1000 S Fremont Ave, Alhambra, CA 91803'
      ];
      sampleAddresses.forEach(address => this.addressService.saveAddress(address));
      this.savedAddresses = this.addressService.getAddresses();
    }
    
    this.filteredAddresses = [...this.savedAddresses];
  }

  ngAfterViewInit() {
    if ((window as any).google?.maps) {
      this.initializeMap();
    } else {
      window.addEventListener('google-map-ready', () => this.initializeMap(), { once: true });
    }
  }

  private initializeMap() {
    this.mapLoaded = true;
    this.loadAllMarkers();
  }

  onSubmit() {
    if (!this.addressForm.valid) {
      alert('Please fill in all fields correctly. Zip must be in format 12345 or 12345-6789');
      return;
    }

    const formData = this.addressForm.value;
    const fullAddress = `${formData.street}, ${formData.city}, ${formData.state} ${formData.zip}`;

    if (this.editingAddress) {
      this.addressService.updateAddress(this.editingAddress, fullAddress);
      this.editingAddress = null;
    } else {
      this.addressService.saveAddress(fullAddress);
    }

    this.savedAddresses = this.addressService.getAddresses();
    this.applyStateFilter();
    this.geocodeAndUpdateMap(fullAddress);
    this.addressForm.reset();
  }

  selectAddress(address: string) {
    this.geocodeAndUpdateMap(address);
  }

  editAddress(address: string, event: Event) {
    event.stopPropagation();
    this.editingAddress = address;
    
    // Parse the address and populate the form
    const parts = address.match(/^(.+),\s+(.+),\s+(\w{2})\s+(\d{5}(?:-\d{4})?)$/);
    if (parts) {
      this.addressForm.patchValue({
        street: parts[1],
        city: parts[2],
        state: parts[3],
        zip: parts[4]
      });
    }
  }

  deleteAddress(address: string, event: Event) {
    event.stopPropagation();
    if (confirm(`Delete address: ${address}?`)) {
      this.addressService.deleteAddress(address);
      this.savedAddresses = this.addressService.getAddresses();
      this.applyStateFilter();
      this.markerPosition = null;
    }
  }

  onStateFilterChange() {
    this.applyStateFilter();
  }

  private applyStateFilter() {
    if (!this.selectedStateFilter) {
      this.filteredAddresses = [...this.savedAddresses];
    } else {
      this.filteredAddresses = this.savedAddresses.filter(address => {
        const parts = address.match(/,\s+(\w{2})\s+\d/);
        return parts && parts[1] === this.selectedStateFilter;
      });
    }
  }

  private geocodeAndUpdateMap(address: string) {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

    this.http.get<any[]>(nominatimUrl).subscribe({
      next: (results) => {
        if (results && results.length > 0) {
          this.center = {
            lat: parseFloat(results[0].lat),
            lng: parseFloat(results[0].lon)
          };
          this.markerPosition = { ...this.center };
          this.zoom = 15;
        } else {
          alert('Address not found: ' + address);
          this.markerPosition = null;
        }
      },
      error: (error) => {
        alert('Geocoding error: ' + error.message);
        this.markerPosition = null;
      }
    });
  }

  private loadAllMarkers() {
    this.markers = [];
    if (this.filteredAddresses.length === 0) {
      return;
    }

    // Geocode all addresses and collect their positions
    const geocodingPromises = this.filteredAddresses.map(address =>
      this.geocodeAddress(address)
    );

    Promise.all(geocodingPromises).then(positions => {
      this.markers = positions.filter(pos => pos !== null) as google.maps.LatLngLiteral[];
      this.adjustMapBounds();
    });
  }

  private geocodeAddress(address: string): Promise<google.maps.LatLngLiteral | null> {
    return new Promise((resolve) => {
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

      this.http.get<any[]>(nominatimUrl).subscribe({
        next: (results) => {
          if (results && results.length > 0) {
            resolve({
              lat: parseFloat(results[0].lat),
              lng: parseFloat(results[0].lon)
            });
          } else {
            resolve(null);
          }
        },
        error: () => {
          resolve(null);
        }
      });
    });
  }

  private adjustMapBounds() {
    if (this.markers.length === 0) {
      // No markers: focus on North Carolina by default
      // NC approximate bounds: SW lat/lng and NE lat/lng
      const ncSW: google.maps.LatLngLiteral = { lat: 33.8361, lng: -84.3219 };
      const ncNE: google.maps.LatLngLiteral = { lat: 36.5881, lng: -75.4605 };
      if (this.map && this.map.googleMap) {
        const bounds = new google.maps.LatLngBounds(ncSW as any, ncNE as any);
        this.map.fitBounds(bounds);
      } else {
        // Fallback center/zoom for NC
        this.center = { lat: 35.5, lng: -79.0 };
        this.zoom = 6;
      }
      return;
    }

    if (this.map && this.markers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      this.markers.forEach(marker => bounds.extend(marker));
      this.map.fitBounds(bounds);
      return;
    }

    if (this.markers.length === 1) {
      this.center = this.markers[0];
      this.zoom = 8;
      return;
    }

    // Fallback bounds for multiple markers when the map instance is not ready
    let minLat = this.markers[0].lat;
    let maxLat = this.markers[0].lat;
    let minLng = this.markers[0].lng;
    let maxLng = this.markers[0].lng;

    this.markers.forEach(marker => {
      minLat = Math.min(minLat, marker.lat);
      maxLat = Math.max(maxLat, marker.lat);
      minLng = Math.min(minLng, marker.lng);
      maxLng = Math.max(maxLng, marker.lng);
    });

    this.center = {
      lat: (minLat + maxLat) / 2,
      lng: (minLng + maxLng) / 2
    };

    // Calculate appropriate zoom level
    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff);

    if (maxDiff < 0.01) {
      this.zoom = 15;
    } else if (maxDiff < 0.1) {
      this.zoom = 12;
    } else if (maxDiff < 1) {
      this.zoom = 10;
    } else if (maxDiff < 5) {
      this.zoom = 8;
    } else {
      this.zoom = 5;
    }
  }

  trackByMarker(index: number, marker: google.maps.LatLngLiteral): string {
    return `${marker.lat}-${marker.lng}`;
  }
}
