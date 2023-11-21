import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateSecretComponent } from '../../../shared/components/create-secret/create-secret.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Secret, Vault } from '../../../shared/services/in-memory.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VaultService } from '../../../shared/services/vault.service';
import { TotpService } from '../../../shared/services/totp.service';
import { DeleteSecretComponent } from '../../../shared/components/delete-secret/delete-secret.component';
import { FormControl } from '@angular/forms';
import { EditSecretComponent } from '../../../shared/components/edit-secret/edit-secret.component';

@Component({
  selector: 'app-secrets',
  templateUrl: './secrets.component.html',
  styleUrls: ['./secrets.component.scss'],
})
export class SecretsComponent implements OnDestroy {
  loading = false;
  vault?: Vault;
  time = 0;
  searchBar = new FormControl<string>('', { nonNullable: true });
  searchBarSub$ = this.searchBar.valueChanges.subscribe((value) => {
    if (value === '') {
      if (this.vault?.secrets) {
        this.vault.secrets = this.cachedVault.secrets;
      }
    } else {
      this.vault!.secrets = this.cachedVault?.secrets?.filter((secret) => {
        return (
          secret.uri.toLowerCase().includes(value.toLowerCase()) ||
          secret.username.toLowerCase().includes(value.toLowerCase()) ||
          secret.display_name.toLowerCase().includes(value.toLowerCase())
        );
      });
    }
  });

  cachedVault: Vault;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private snackbar: MatSnackBar,
    private vaultService: VaultService,
    public totpService: TotpService,
  ) {
    setInterval(() => {
      this.time = 30 - (Math.round(Date.now() / 1000) % 30);
    }, 50);

    this.loading = true;
    this.searchBar.disable();
    const id = this.route.snapshot.paramMap.get('id') as string;

    if (21 !== id.length) {
      this.snackbar.open('Vault not found', 'Close', {
        duration: 5000,
      });
      this.router.navigate(['/home/vaults']);
      return;
    }

    this.vaultService
      .getSecrets(id)
      .then((secrets) => {
        this.vault = this.vaultService.vaults.find((vault) => vault.id === id);
        this.cachedVault = Object.assign({}, this.vault);
        this.vault!.secrets = secrets;
        this.loading = false;
        this.searchBar.enable();
      })
      .catch((err) => {
        if (err.message === 'Vault not found') {
          this.snackbar.open('Vault not found', 'Close', {
            duration: 5000,
          });
          this.router.navigate(['vaults']);
          return;
        }

        console.log(err);

        this.snackbar.open('An unknown error occurred', 'Close', {
          duration: 5000,
        });

        this.router.navigate(['vaults']);
      });
  }

  ngOnDestroy() {
    this.searchBarSub$.unsubscribe();
  }

  createSecret() {
    this.dialog.open(CreateSecretComponent, {
      data: this.vault,
    });
  }

  editSecret(secret: Secret) {
    this.dialog.open(EditSecretComponent, {
      data: {
        vaultId: this.vault!.id,
        secret,
      },
    });
  }

  deleteSecret(secret: Secret) {
    this.dialog.open(DeleteSecretComponent, {
      autoFocus: false,
      data: {
        vaultId: this.vault!.id,
        secret,
      },
    });
  }

  copied(label: string, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }

    this.snackbar.open(`${label} copied to clipboard`, 'Close', {
      duration: 5000,
    });
  }

  handleMissingImage(event: ErrorEvent) {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
