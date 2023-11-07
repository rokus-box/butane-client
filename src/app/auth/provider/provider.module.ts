import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Provider } from './provider';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{ path: '', component: Provider }];

@NgModule({
  declarations: [Provider],
  imports: [RouterModule.forChild(routes), CommonModule],
  exports: [RouterModule],
})
export class ProviderModule {}
