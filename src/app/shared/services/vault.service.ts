import { Injectable } from '@angular/core';
import { DbService, Vault } from './db.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { cacheExpired } from '../helpers/cacheHelper';

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
        this.http.get<Vault[]>('http://localhost:3000/vault', {
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
}
