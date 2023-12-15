import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AuditLogComponent } from './audit-log.component';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgScrollbar } from 'ngx-scrollbar';
import { MatTooltipModule } from '@angular/material/tooltip';

const routes: Routes = [{ path: '', component: AuditLogComponent }];

@NgModule({
  declarations: [AuditLogComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatListModule,
    MatIconModule,
    MatProgressBarModule,
    NgScrollbar,
    MatTooltipModule,
  ],
})
export class AuditLogModule {}
