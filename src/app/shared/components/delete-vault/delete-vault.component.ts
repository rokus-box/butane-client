import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Vault } from '../../services/db.service';
import { VaultService } from '../../services/vault.service';

@Component({
  selector: 'app-delete-vault',
  templateUrl: './delete-vault.component.html',
  styleUrls: ['./delete-vault.component.scss'],
})
export class DeleteVaultComponent {
  confirmName = '';
  loading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public vault: Vault,
    private vaultService: VaultService,
    private ref: MatDialogRef<DeleteVaultComponent>,
  ) {}

  async deleteVault() {
    this.loading = true;

    await this.vaultService.deleteVault(this.vault.id);

    this.loading = false;

    this.ref.close(true);
  }
}
