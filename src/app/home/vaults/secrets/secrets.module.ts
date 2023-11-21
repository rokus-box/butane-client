import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SecretsComponent } from './secrets.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CreateSecretComponent } from '../../../shared/components/create-secret/create-secret.component';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { DeleteSecretComponent } from '../../../shared/components/delete-secret/delete-secret.component';
import { EditSecretComponent } from '../../../shared/components/edit-secret/edit-secret.component';
import { MatChipsModule } from '@angular/material/chips';

const routes: Routes = [{ path: '', component: SecretsComponent }];

@NgModule({
  declarations: [
    SecretsComponent,
    CreateSecretComponent,
    DeleteSecretComponent,
    EditSecretComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatCardModule,
    MatProgressBarModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatExpansionModule,
    MatSelectModule,
    MatTooltipModule,
    NgScrollbarModule,
    ClipboardModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    NgOptimizedImage,
    MatChipsModule,
  ],
})
export class SecretsModule {}
