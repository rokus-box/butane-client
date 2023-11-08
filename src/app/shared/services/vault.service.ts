import { Injectable } from '@angular/core';
import { DbService, Vault } from './db.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { cacheExpired } from '../helpers/cacheHelper';
import { API_URL } from '../constant';

@Injectable({
  providedIn: 'root',
})
export class VaultService {
  constructor(
    private dbService: DbService,
    private http: HttpClient,
  ) {}

  async getVaults() {
    if (cacheExpired()) {
      const vaults = await firstValueFrom(
        this.http.get<Vault[]>(`${API_URL}/vault`, {
          headers: {
            Authorization: await this.dbService.getToken(),
          },
        }),
      );

      await this.dbService.vaults.clear();
      await this.dbService.vaults.bulkPut(vaults);

      return vaults;
    }

    return this.dbService.vaults.toArray();
  }

  async createVault(displayName: string) {
    const vault = await firstValueFrom(
      this.http.post<Vault>(`${API_URL}/vault`, displayName, {
        headers: {
          Authorization: await this.dbService.getToken(),
        },
      }),
    );

    await this.dbService.vaults.put(vault);
    return vault;
  }

  async updateVault(vault: Vault) {
    await firstValueFrom(
      this.http.patch<Vault>(
        `${API_URL}/vault/${vault.id}`,
        vault.display_name,
        {
          headers: {
            Authorization: await this.dbService.getToken(),
          },
        },
      ),
    );

    await this.dbService.vaults.update(vault.id, vault);
    return vault;
  }

  async deleteVault(id: string) {
    await firstValueFrom(
      this.http.delete(`${API_URL}/vault/${id}`, {
        headers: {
          Authorization: await this.dbService.getToken(),
        },
      }),
    );

    await this.dbService.vaults
      .delete(id)
      .then((x) => {
        console.log(x);
      })
      .catch((x) => {
        console.warn(x);
      });
  }
}
