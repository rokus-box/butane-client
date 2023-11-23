import { Component } from '@angular/core';
import { generatePassword } from '../shared/helpers/generatePassword';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../shared/constant';
import { InMemoryService } from '../shared/services/in-memory.service';

type NavItem = {
  label: string;
  path: string;
  icon: string;
};

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  navItems: NavItem[] = [
    {
      label: 'Vaults',
      path: 'vaults',
      icon: 'lock',
    },
    {
      label: 'Settings',
      path: 'settings',
      icon: 'settings',
    },
  ];

  constructor(
    private snack: MatSnackBar,
    private http: HttpClient,
    private cache: InMemoryService,
    private router: Router,
  ) {}

  isMobile = window.innerWidth < 768;

  async genPassword() {
    const chars = localStorage.getItem('chars')!;
    const length = parseInt(localStorage.getItem('charsLength')!, 10);
    const pass = generatePassword(chars, length);

    this.snack.open('Copied to clipboard!', 'Dismiss', {
      verticalPosition: 'top',
      duration: 3000,
    });

    await navigator.clipboard.writeText(pass);
  }

  async logout() {
    this.router.navigate(['auth']);

    firstValueFrom(
      this.http.delete(`${API_URL}/session`, {
        headers: {
          Authorization: await this.cache.getToken(),
        },
      }),
    )
      .then(() => {
        this.snack.open('Logged out!', 'Dismiss', {
          verticalPosition: 'top',
          duration: 3000,
        });
      })
      .catch((err) => {
        console.log({ err });
        this.snack.open('Something went wrong. Please try again.', 'Dismiss', {
          duration: 5000,
        });
      })
      .finally(() => {
        sessionStorage.clear();
      });
  }
}
