import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { VaultsComponent } from './vaults.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EditVaultComponent } from '../../shared/components/edit-vault/edit-vault.component';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { CreateVaultComponent } from '../../shared/components/create-vault/create-vault.component';
import { DeleteVaultComponent } from '../../shared/components/delete-vault/delete-vault.component';

const routes: Routes = [{ path: '', component: VaultsComponent }];

@NgModule({
  declarations: [
    VaultsComponent,
    EditVaultComponent,
    CreateVaultComponent,
    DeleteVaultComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatInputModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    MatDialogModule,
    FormsModule,
  ],
})
export class VaultsModule {}
