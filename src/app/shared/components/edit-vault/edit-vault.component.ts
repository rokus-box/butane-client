import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Vault } from '../../services/db.service';
import { VaultService } from '../../services/vault.service';
import { ClassValidatorFormBuilderService } from 'ngx-reactive-form-class-validator';
import { getFirstError } from '../../helpers/getFirstError';
import { Length } from 'class-validator';

export class UpdateVaultForm {
  @Length(2, 32, { message: 'Must be between 2 and 32 characters' })
  displayName: string;
}

@Component({
  selector: 'app-edit-vault',
  templateUrl: './edit-vault.component.html',
  styleUrls: ['./edit-vault.component.scss'],
})
export class EditVaultComponent {
  loading = false;
  updateVaultForm = this.fb.group(UpdateVaultForm, {
    displayName: [this.data.display_name],
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Vault,
    private vaultService: VaultService,
    private ref: MatDialogRef<EditVaultComponent>,
    private fb: ClassValidatorFormBuilderService,
  ) {}

  async updateVault() {
    this.loading = true;

    await this.vaultService.updateVault({
      id: this.data.id,
      display_name: this.updateVaultForm.controls['displayName'].value,
    });

    this.ref.close(true);
  }

  protected readonly getFirstError = getFirstError;
}
