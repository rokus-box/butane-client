import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthComponent } from './auth.component';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { QRCodeModule } from 'angularx-qrcode';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { NgxMaskDirective } from 'ngx-mask';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { FlameComponent } from '../shared/components/flame/flame.component';

const routes: Routes = [
  {
    path: ':provider',
    loadChildren: () =>
      import('./provider/provider.module').then((m) => m.ProviderModule),
  },
  {
    path: '',
    component: AuthComponent,
  },
];

@NgModule({
  declarations: [AuthComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatButtonModule,
    QRCodeModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatInputModule,
    ClipboardModule,
    NgxMaskDirective,
    FormsModule,
    ReactiveFormsModule,
    FlameComponent,
  ],
  exports: [RouterModule],
})
export class AuthModule {}
