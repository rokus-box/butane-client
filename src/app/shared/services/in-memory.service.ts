import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

export type Vault = {
  id: string;
  display_name: string;
  secrets?: Secret[];
};

export type Secret = {
  id: string;
  uri: string;
  display_name: string;
  username: string;
  password: string;
  metadata: Metadatum[];
};

export type Metadatum = {
  key: string;
  value: string;
  type: number;
};

@Injectable({ providedIn: 'root' })
export class InMemoryService {
  constructor(
    private router: Router,
    private snack: MatSnackBar,
  ) {}

  async getToken(): Promise<string> {
    const token = sessionStorage.getItem('token');
    if (token === null) {
      await this.router.navigate(['/auth']);
      this.snack.open('Something went wrong. Please login again.', 'Dismiss', {
        duration: 5000,
      });

      throw new Error('No token');
    }

    return token as string;
  }
}
