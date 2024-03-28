import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TotpService {
  private TOTP: any = (<any>window)['TOTP'];

  generateSecret(seed: string): { secret: string; url: string } {
    const secret = new this.TOTP(this.TOTP['base32'].encode(seed.slice(-10)));
    return {
      secret: secret.key,
      url: secret.gaURL('Web', 'Butane'),
    };
  }

  generateCode(secret: string): string {
    return new this.TOTP(secret).genOTP();
  }
}
