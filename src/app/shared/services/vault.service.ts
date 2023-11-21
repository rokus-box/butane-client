import { Injectable } from '@angular/core';
import { InMemoryService, Metadatum, Secret, Vault } from './in-memory.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../constant';
import { CryptoService } from './crypto.service';

@Injectable({
  providedIn: 'root',
})
export class VaultService {
  vaults: Vault[] = [];
  private cached = false;

  constructor(
    private cache: InMemoryService,
    private http: HttpClient,
    private cryptoService: CryptoService,
  ) {}

  async getVaults() {
    if (this.cached) {
      return this.vaults;
    }

    const vaults = await firstValueFrom(
      this.http.get<Vault[]>(`${API_URL}/vault`, {
        headers: {
          Authorization: await this.cache.getToken(),
        },
      }),
    );

    for (const vault of vaults) {
      vault.display_name = await this.cryptoService.decrypt(vault.display_name);
    }

    this.vaults = vaults;
    this.cached = true;

    return vaults;
  }

  async createVault(displayName: string) {
    const encrypted = await this.cryptoService.encrypt(displayName);
    const vaultId = await firstValueFrom(
      this.http.post(`${API_URL}/vault`, encrypted, {
        responseType: 'text',
        headers: {
          Authorization: await this.cache.getToken(),
        },
      }),
    );

    const vault: Vault = {
      id: vaultId,
      display_name: displayName,
    };

    this.vaults.push(vault);

    return vault;
  }

  async updateVault(id: string, display_name: string): Promise<Vault> {
    const encrypted = await this.cryptoService.encrypt(display_name);

    await firstValueFrom(
      this.http.patch<Vault>(`${API_URL}/vault/${id}`, encrypted, {
        headers: {
          Authorization: await this.cache.getToken(),
        },
      }),
    );

    const vault = this.vaults.find((vault) => vault.id === id);
    vault!.display_name = display_name;

    return {
      id,
      display_name,
    };
  }

  async deleteVault(id: string) {
    await firstValueFrom(
      this.http.delete(`${API_URL}/vault/${id}`, {
        headers: {
          Authorization: await this.cache.getToken(),
        },
      }),
    );

    this.vaults.splice(
      this.vaults.findIndex((vault) => vault.id === id),
      1,
    );
  }

  async getSecrets(vaultId: string) {
    let vault = this.vaults.find((vault) => vault.id === vaultId);

    if (vault?.secrets) {
      return vault.secrets;
    }

    if (null == vault) {
      const vaults = await this.getVaults();
      vault = vaults.find((vault) => vault.id === vaultId);

      if (null == vault) {
        throw new Error('Vault not found');
      }

      this.vaults = vaults;
    }

    const secrets = await firstValueFrom(
      this.http.get<Secret[]>(`${API_URL}/vault/${vaultId}/secret`, {
        headers: {
          Authorization: await this.cache.getToken(),
        },
      }),
    );

    for (let i = 0; i < secrets.length; i++) {
      const metadata: Metadatum[] = [];

      if (secrets[i].metadata?.length > 0) {
        for (const md of secrets[i].metadata!) {
          metadata.push({
            key: await this.cryptoService.decrypt(md.key),
            value: await this.cryptoService.decrypt(md.value),
            type: md.type,
          });
        }
      }

      secrets[i] = {
        id: secrets[i].id,
        display_name: await this.cryptoService.decrypt(secrets[i].display_name),
        ...(secrets[i].uri && {
          uri: await this.cryptoService.decrypt(secrets[i].uri),
        }),
        ...(secrets[i].username && {
          username: await this.cryptoService.decrypt(secrets[i].username),
        }),
        ...(secrets[i].password && {
          password: await this.cryptoService.decrypt(secrets[i].password),
        }),
        ...(metadata.length > 0 && { metadata }),
      } as Secret;
    }

    vault!.secrets = secrets;

    return secrets;
  }

  async createSecret(vaultId: string, secret: Partial<Secret>) {
    const metadata: Metadatum[] = [];

    if (secret.metadata!.length > 0) {
      for (const md of secret.metadata!) {
        metadata.push({
          key: await this.cryptoService.encrypt(md.key),
          value: await this.cryptoService.encrypt(md.value),
          type: md.type,
        });
      }
    }

    const encrypted: Partial<Secret> = {
      display_name: await this.cryptoService.encrypt(secret.display_name!),
      ...(secret?.uri && { uri: await this.cryptoService.encrypt(secret.uri) }),
      ...(secret?.username && {
        username: await this.cryptoService.encrypt(secret.username),
      }),
      ...(secret?.password && {
        password: await this.cryptoService.encrypt(secret.password),
      }),
      ...(metadata.length > 0 && { metadata }),
    };

    const id = await firstValueFrom(
      this.http.post(`${API_URL}/vault/${vaultId}/secret`, encrypted, {
        responseType: 'text',
        headers: {
          Authorization: await this.cache.getToken(),
        },
      }),
    );

    const sc = {
      id,
      display_name: secret.display_name,
      ...(secret?.uri && { uri: secret.uri }),
      ...(secret?.username && { username: secret.username }),
      ...(secret?.password && { password: secret.password }),
      ...(metadata.length > 0 && { metadata }),
    } as Secret;

    const vault = this.vaults.find((vault) => vault.id === vaultId);
    vault!.secrets!.push(sc);

    return secret;
  }

  async updateSecret(vaultId: string, secret: Partial<Secret>) {
    const metadata: Metadatum[] = [];

    if (secret.metadata!.length > 0) {
      for (const md of secret.metadata!) {
        metadata.push({
          key: await this.cryptoService.encrypt(md.key),
          value: await this.cryptoService.encrypt(md.value),
          type: md.type,
        });
      }
    }

    const encrypted: Partial<Secret> = {
      display_name: await this.cryptoService.encrypt(secret.display_name!),
      ...(secret?.uri && { uri: await this.cryptoService.encrypt(secret.uri) }),
      ...(secret?.username && {
        username: await this.cryptoService.encrypt(secret.username),
      }),
      ...(secret?.password && {
        password: await this.cryptoService.encrypt(secret.password),
      }),
      ...(metadata.length > 0 && { metadata }),
    };

    await firstValueFrom(
      this.http.patch(
        `${API_URL}/vault/${vaultId}/secret/${secret.id}`,
        encrypted,
        {
          headers: {
            Authorization: await this.cache.getToken(),
          },
        },
      ),
    );

    const vault = this.vaults.find((vault) => vault.id === vaultId);
    const sc = vault!.secrets!.find((sc) => sc.id === secret.id);

    sc!.display_name = <string>secret.display_name;
    sc!.uri = <string>secret.uri;
    sc!.username = <string>secret.username;
    sc!.password = <string>secret.password;
    sc!.metadata = <Metadatum[]>secret.metadata;

    return secret;
  }

  async deleteSecret(vaultId: string, secretId: string) {
    const vault = this.vaults.find((vault) => vault.id === vaultId);

    if (null == vault) {
      throw new Error('Vault not found');
    }

    await firstValueFrom(
      this.http.delete(`${API_URL}/vault/${vaultId}/secret/${secretId}`, {
        headers: {
          Authorization: await this.cache.getToken(),
        },
      }),
    );

    vault.secrets = vault.secrets!.filter((secret) => secret.id !== secretId);
  }
}
