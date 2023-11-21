import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Secret } from '../../services/in-memory.service';
import { VaultService } from '../../services/vault.service';

@Component({
  selector: 'app-delete-secret',
  templateUrl: './delete-secret.component.html',
  styleUrls: ['./delete-secret.component.scss'],
})
export class DeleteSecretComponent {
  confirmName = '';
  loading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { vaultId: string; secret: Secret },
    private vaultService: VaultService,
    private ref: MatDialogRef<DeleteSecretComponent>,
  ) {}

  async deleteSecret() {
    this.loading = true;
    await this.vaultService.deleteSecret(
      this.data.vaultId,
      this.data.secret.id,
    );
    this.ref.close(true);
  }
}
