import { AfterViewInit, Directive, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GoogleMap } from '@angular/google-maps';
import { HttpClient } from '@angular/common/http';
import { AddressService, LocationEntry } from './address.service';
import { AuthService } from './auth.service';

@Directive()
export abstract class MapBaseComponent implements OnInit, AfterViewInit {
  @ViewChild(GoogleMap) map?: GoogleMap;

  addressForm!: FormGroup;
  center: google.maps.LatLngLiteral = { lat: 35.5, lng: -79.0 };
  zoom = 6;
  savedLocations: LocationEntry[] = [];
  filteredLocations: LocationEntry[] = [];
  markerOptions: google.maps.MarkerOptions = { draggable: false, icon: { url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' } };
  markerPosition: google.maps.LatLngLiteral | null = null;
  markers: Array<{ id: string; position: google.maps.LatLngLiteral }> = [];
  selectedLocationId: string | null = null;
  editingLocationId: string | null = null;
  selectedStateFilter: string = '';
  mapLoaded = false;
  initialViewSet: boolean = false;
  isAuthenticated: boolean = false;

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
    protected fb: FormBuilder,
    protected addressService: AddressService,
    protected http: HttpClient,
    protected authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });
    this.isAuthenticated = this.authService.isAuthenticated();

    this.addressForm = this.fb.group({
      organizationName: [''],
      organizationDetails: [''],
      street: [''],
      city: [''],
      state: [''],
      zip: [''],
      website: [''],
      email: ['']
    });

    this.savedLocations = this.addressService.getLocations();

    if (this.savedLocations.length === 0) {
      const sampleLocations: LocationEntry[] = [
        {
          id: this.generateId(),
          organizationName: 'NCCAHT (North Carolina Council Against Abuse and Trafficking)',
          organizationDetails: 'Non-profit Organization',
          street: '',
          city: 'Raleigh',
          state: 'NC',
          zip: '',
          website: 'www.nccaht.org',
          email: 'info@nccaht.org'
        },
        {
          id: this.generateId(),
          organizationName: 'Safe Haven Shelter',
          organizationDetails: 'Confidential Safe House',
          street: '',
          city: 'Charlotte',
          state: 'NC',
          zip: '',
          website: 'www.safehavenshelter.org',
          email: 'contact@safehavenshelter.org'
        },
        {
          id: this.generateId(),
          organizationName: 'Empire State Building',
          organizationDetails: 'Historic Landmark',
          street: '350 5th Ave',
          city: 'New York',
          state: 'NY',
          zip: '10118',
          website: 'www.esbnyc.com',
          email: 'info@esbnyc.com'
        }
      ];
      sampleLocations.forEach(location => this.addressService.saveLocation(location));
      this.savedLocations = this.addressService.getLocations();
    }

    this.filteredLocations = [...this.savedLocations];
  }

  ngAfterViewInit() {
    if ((window as any).google?.maps) {
      this.initializeMap();
    } else {
      window.addEventListener('google-map-ready', () => this.initializeMap(), { once: true });
    }
  }

  protected initializeMap() {
    this.mapLoaded = true;
    const ncSW: google.maps.LatLngLiteral = { lat: 33.84, lng: -84.32 };
    const ncNE: google.maps.LatLngLiteral = { lat: 36.6, lng: -75.45 };

    if (this.map && this.map.googleMap) {
      try {
        const bounds = new google.maps.LatLngBounds(ncSW as any, ncNE as any);
        this.map.googleMap.fitBounds(bounds);
        this.map.googleMap.setCenter({ lat: 35.5, lng: -79.0 });
        this.map.googleMap.setZoom(6);
        this.initialViewSet = true;
      } catch (e) {
        this.center = { lat: 35.5, lng: -79.0 };
        this.zoom = 6;
      }
    } else {
      this.center = { lat: 35.5, lng: -79.0 };
      this.zoom = 6;
      this.initialViewSet = true;
    }

    this.loadAllMarkers();
  }

  onStateFilterChange() {
    this.applyStateFilter();
    this.loadAllMarkers();
  }

  protected applyStateFilter() {
    if (!this.selectedStateFilter) {
      this.filteredLocations = [...this.savedLocations];
    } else {
      this.filteredLocations = this.savedLocations.filter(location =>
        location.state === this.selectedStateFilter
      );
    }
  }

  protected loadAllMarkers() {
    this.markers = [];
    if (this.filteredLocations.length === 0) {
      return;
    }

    const geocodingPromises = this.filteredLocations.map(location =>
      this.geocodeLocation(location).then(position => ({ location, position }))
    );

    Promise.all(geocodingPromises).then(results => {
      this.markers = results
        .filter(result => result.position !== null)
        .map(result => ({ id: result.location.id, position: result.position as google.maps.LatLngLiteral }));
      this.adjustMapBounds();
    });
  }

  protected geocodeLocation(location: LocationEntry): Promise<google.maps.LatLngLiteral | null> {
    let address = location.city && location.state ? `${location.city}, ${location.state}` : '';
    if (location.street) {
      address = `${location.street}, ${address}`;
    }
    if (location.zip && location.zip.trim()) {
      address = `${address} ${location.zip}`;
    }
    return address ? this.geocodeAddress(address) : Promise.resolve(null);
  }

  selectAddress(location: LocationEntry) {
    this.selectedLocationId = location.id;
    const marker = this.markers.find(m => m.id === location.id);
    if (marker && this.map?.googleMap) {
      this.map.googleMap.panTo(marker.position);
      this.map.googleMap.setCenter(marker.position);
      this.map.googleMap.setZoom(10);
    }
  }

  protected geocodeAddress(address: string): Promise<google.maps.LatLngLiteral | null> {
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

  protected adjustMapBounds() {
    if (this.initialViewSet) {
      this.initialViewSet = false;
      return;
    }
  }

  getMarkerOptions(markerId: string): google.maps.MarkerOptions {
    const selected = markerId === this.selectedLocationId;
    return {
      draggable: false,
      icon: {
        url: selected
          ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
          : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
      }
    };
  }

  trackByMarker(index: number, marker: { id: string; position: google.maps.LatLngLiteral }): string {
    return `${marker.id}-${marker.position.lat}-${marker.position.lng}`;
  }

  protected generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  logout(): void {
    this.authService.logout();
    this.isAuthenticated = false;
    this.editingLocationId = null;
    this.addressForm.reset();
  }
}
