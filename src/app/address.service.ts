import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AddressService {

  private storageKey = 'savedAddresses';

  constructor() { }

  saveAddress(address: string): void {
    const addresses = this.getAddresses();
    addresses.push(address);
    localStorage.setItem(this.storageKey, JSON.stringify(addresses));
  }

  getAddresses(): string[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  deleteAddress(address: string): void {
    const addresses = this.getAddresses();
    const index = addresses.indexOf(address);
    if (index > -1) {
      addresses.splice(index, 1);
      localStorage.setItem(this.storageKey, JSON.stringify(addresses));
    }
  }

  updateAddress(oldAddress: string, newAddress: string): void {
    const addresses = this.getAddresses();
    const index = addresses.indexOf(oldAddress);
    if (index > -1) {
      addresses[index] = newAddress;
      localStorage.setItem(this.storageKey, JSON.stringify(addresses));
    }
  }
}
