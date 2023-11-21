import { Component, OnInit } from '@angular/core';
import { Vault } from '../../shared/services/in-memory.service';
import { VaultService } from '../../shared/services/vault.service';
import { MatDialog } from '@angular/material/dialog';
import { EditVaultComponent } from '../../shared/components/edit-vault/edit-vault.component';
import { CreateVaultComponent } from '../../shared/components/create-vault/create-vault.component';
import { DeleteVaultComponent } from '../../shared/components/delete-vault/delete-vault.component';

@Component({
  selector: 'app-vaults',
  templateUrl: './vaults.component.html',
  styleUrls: ['./vaults.component.scss'],
})
export class VaultsComponent implements OnInit {
  vaults: Vault[] = [];
  loading = false;

  constructor(
    private vaultService: VaultService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.loading = true;
    this.vaultService.getVaults().then(async (vaults) => {
      this.vaults = vaults;
      this.loading = false;
    });
  }

  editVault(vault: Vault) {
    this.dialog.open(EditVaultComponent, { data: vault });
  }

  createVault() {
    this.dialog.open(CreateVaultComponent);
  }

  deleteVault(vault: Vault) {
    this.dialog.open(DeleteVaultComponent, { data: vault });
  }
}
