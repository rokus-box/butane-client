import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './homepage.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { FlameComponent } from '../shared/components/flame/flame.component';
import { MatIconModule } from '@angular/material/icon';

const routes: Routes = [{ path: '', component: HomepageComponent }];

@NgModule({
  declarations: [HomepageComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatToolbarModule,
    MatButtonModule,
    FlameComponent,
    MatIconModule,
  ],
})
export class HomepageModule {}
