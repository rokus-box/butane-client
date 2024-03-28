import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class CryptoService {
  private sodium: any = (<any>window)['sodium'];

  constructor(private snack: MatSnackBar) {}

  async sha1(message: string) {
    const buffer = new TextEncoder().encode(message);
    const digest = await crypto.subtle.digest('SHA-1', buffer);
    return Array.from(new Uint8Array(digest), (byte) =>
      byte.toString(16).padStart(2, '0'),
    ).join('');
  }

  async generateKey(material: string): Promise<string> {
    const key = await this.sodium.crypto_generichash(32, material);

    sessionStorage.setItem('key', this.sodium.to_base64(key));

    return this.sodium.to_base64(key);
  }

  async encrypt(data: string): Promise<string> {
    const key = sessionStorage.getItem('key');
    try {
      const nonce = await this.sodium.randombytes_buf(24);
      const cipher = await this.sodium.crypto_secretbox_easy(
        data,
        nonce,
        this.sodium.from_base64(key),
      );

      return this.sodium.to_base64(nonce) + this.sodium.to_base64(cipher);
    } catch (e) {
      console.log('e', e);
      this.snack.open('Error encrypting some items', 'Dismiss', {
        duration: 5000,
      });
      return '';
    }
  }

  async decrypt(data: string): Promise<string> {
    const key = sessionStorage.getItem('key');
    try {
      const nonce = this.sodium.from_base64(data.slice(0, 32));
      const cipher = this.sodium.from_base64(data.slice(32));
      return this.sodium.to_string(
        this.sodium.crypto_secretbox_open_easy(
          cipher,
          nonce,
          this.sodium.from_base64(key),
        ),
      );
    } catch (e) {
      console.log('e', e);
      this.snack.open('Some items could not be decrypted', 'Dismiss', {
        duration: 5000,
      });
      return '';
    }
  }
}
