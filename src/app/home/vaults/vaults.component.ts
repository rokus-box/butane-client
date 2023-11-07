import { Component, OnInit } from '@angular/core';
import { Vault } from '../../shared/services/db.service';
import { VaultService } from '../../shared/services/vault.service';

@Component({
  selector: 'app-vaults',
  templateUrl: './vaults.component.html',
  styleUrls: ['./vaults.component.scss'],
})
export class VaultsComponent implements OnInit {
  vaults: Vault[] = [];

  constructor(private vaultService: VaultService) {}

  ngOnInit() {
    this.vaultService.getVaults().then((vaults) => {
      this.vaults = vaults;
    });
  }
}
