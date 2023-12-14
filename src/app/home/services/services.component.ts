import { Component } from '@angular/core';
import { VaultService } from '../../shared/services/vault.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Secret, Vault } from '../../shared/services/in-memory.service';
import { CryptoService } from '../../shared/services/crypto.service';
import { EditSecretComponent } from '../../shared/components/edit-secret/edit-secret.component';

interface PwnedSecret extends Secret {
  vaultId: string;
  count: number;
}

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
})
export class ServicesComponent {
  isMobile = window.innerWidth < 768;
  loading = false;

  haveIBeenPwnedRunning = false;
  secrets: PwnedSecret[] = [];
  pwnedSecrets: PwnedSecret[] = [];

  uploadedVaults: Vault[] = [];

  constructor(
    private vaultService: VaultService,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private cryptoService: CryptoService,
  ) {
    this.loading = true;
    this.vaultService.getVaults().then(async (vaults) => {
      for (const vault of vaults) {
        await this.vaultService.getSecrets(vault.id);
      }

      this.loading = false;
    });
  }

  async runHaveIBeenPwned() {
    this.secrets = [];
    this.pwnedSecrets = [];

    this.haveIBeenPwnedRunning = true;
    const vaults = await this.vaultService.getVaults();

    for (const vault of vaults) {
      if (!this.haveIBeenPwnedRunning) {
        break;
      }

      const secrets = (await this.vaultService.getSecrets(vault.id)).map(
        (x) =>
          ({
            ...x,
            vaultId: vault.id,
          }) as PwnedSecret,
      );

      this.secrets.push(...secrets);
    }

    for (const secret of this.secrets) {
      if (!this.haveIBeenPwnedRunning) {
        break;
      }

      // Delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1600));

      if (!this.haveIBeenPwnedRunning) {
        break;
      }

      const count = await this.checkPassword(secret.password);

      if (count === 0) {
        continue;
      }

      if (count === -1) {
        console.log(
          `Error checking password for ${secret.display_name}. Skipping.`,
        );
        continue;
      }

      this.pwnedSecrets.push({ ...secret, count });
    }

    this.haveIBeenPwnedRunning = false;
  }

  async checkPassword(password: string): Promise<number> {
    const hashedPassword = await this.cryptoService.sha1(password);
    const prefix = hashedPassword.substring(0, 5);
    const suffix = hashedPassword.substring(5);
    const apiUrl = `https://api.pwnedpasswords.com/range/${prefix}`;

    try {
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Butane Browser/1.0.0',
        },
      });
      const data = await response.text();

      const regex = new RegExp(`${suffix}:(\\d+)`, 'i');
      const match = data.match(regex);

      if (match) {
        return parseInt(match[1]);
      } else {
        return 0;
      }
    } catch (error) {
      console.error('Error checking password. Please try again.', error);
      return -1;
    }
  }

  editSecret(secret: PwnedSecret) {
    const { count, vaultId, ...rest } = secret;

    this.dialog.open(EditSecretComponent, {
      data: { vaultId: vaultId, secret: rest },
    });
  }

  cancelHaveIBeenPwned() {
    this.haveIBeenPwnedRunning = false;

    this.snack.open('Cancelled', 'OK', {
      duration: 3000,
    });
  }

  async exportVaults() {
    const vaults = this.vaultService.vaults;

    for (const vault of vaults) {
      // @ts-ignore
      delete vault.id;

      for (const secret of vault.secrets as Secret[]) {
        // @ts-ignore
        delete secret.id;
      }
    }

    const data = JSON.stringify(vaults);
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.download = 'butane-export-' + new Date().toISOString().split('T')[0];
    link.href = url;
    link.click();

    window.URL.revokeObjectURL(url);
    link.remove();
  }

  importVaults() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = async () => {
      const file = input.files?.[0];

      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');

      reader.onload = async (event) => {
        const data = event.target?.result as string;
        this.uploadedVaults = JSON.parse(data);

        this.snack.open('Imported vaults', 'OK', {
          duration: 3000,
        });
      };
    };

    input.click();
  }

  // async saveVaults() {
  //   for (const vault of this.uploadedVaults) {
  //     await this.vaultService.createVault(vault.display_name);
  //   }
  //
  //   this.snack.open('Saved vaults', 'OK', {
  //     duration: 3000,
  //   });
  // }
}
