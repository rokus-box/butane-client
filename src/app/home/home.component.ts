import { Component } from '@angular/core';

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

  constructor() {}

  refresh() {}
}
