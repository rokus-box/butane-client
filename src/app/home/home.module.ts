import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeComponent } from './home.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { RouterModule, Routes } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: 'vaults',
        loadChildren: () =>
          import('./vaults/vaults.module').then((m) => m.VaultsModule),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./settings/settings.module').then((m) => m.SettingsModule),
      },
      {
        path: 'services',
        loadChildren: () =>
          import('./services/services.module').then((m) => m.ServicesModule),
      },
      {
        path: 'audit-log',
        loadChildren: () =>
          import('./audit-log/audit-log.module').then((m) => m.AuditLogModule),
      },
      { path: '**', redirectTo: 'vaults' },
    ],
  },
];

@NgModule({
  declarations: [HomeComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatTooltipModule,
    MatProgressBarModule,
  ],
  exports: [RouterModule],
})
export class HomeModule {}
