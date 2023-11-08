import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';

export type Vault = {
  id: string;
  display_name: string;
};

export type Secret = {
  id: string;
  uri: string;
  username: string;
  password: string;
  metadata: Metadatum[];
};

export type Metadatum = {
  key: string;
  value: string;
  type: number;
};

export type AppDatabase = {
  id: string;
  token?: string;
};

@Injectable({ providedIn: 'root' })
export class DbService extends Dexie {
  vaults: Table<Vault, string>;
  app: Table<AppDatabase, string>;

  constructor() {
    super('$');

    this.version(1).stores({
      app: 'id, token',
      vaults: 'id, display_name',
    });
  }

  async saveToken(token: string) {
    this.app.put({ id: 'token', token });
  }

  async getToken() {
    const data = await this.app.get('token').catch(() => null);
    if (null == data) {
      return '';
    }
    return data!.token as string;
  }
}
