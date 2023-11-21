import { Component } from '@angular/core';
import { generatePassword } from '../shared/helpers/generatePassword';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InMemoryService } from '../shared/services/in-memory.service';
import { Router } from '@angular/router';

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
    {
      label: 'Sessions',
      path: 'sessions',
      icon: 'group',
    },
  ];

  constructor(
    private snack: MatSnackBar,
    private dbService: InMemoryService,
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
    sessionStorage.clear();
    await this.router.navigate(['auth']);
  }
}
