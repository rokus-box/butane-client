import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { VaultService } from '../../services/vault.service';
import { ClassValidatorFormBuilderService } from 'ngx-reactive-form-class-validator';
import { getFirstError } from '../../helpers/getFirstError';
import { Length } from 'class-validator';

export class CreateVaultForm {
  @Length(2, 32, { message: 'Must be between 2 and 32 characters' })
  displayName: string;
}

@Component({
  selector: 'app-create-vault',
  templateUrl: './create-vault.component.html',
  styleUrls: ['./create-vault.component.scss'],
})
export class CreateVaultComponent {
  loading = false;
  createVaultForm = this.fb.group(CreateVaultForm, {
    displayName: '',
  });

  constructor(
    private vaultService: VaultService,
    private ref: MatDialogRef<CreateVaultComponent>,
    private fb: ClassValidatorFormBuilderService,
  ) {}

  async createVault() {
    this.loading = true;
    await this.vaultService.createVault(
      this.createVaultForm.controls['displayName'].value,
    );
    this.ref.close(true);
  }

  protected readonly getFirstError = getFirstError;
}
