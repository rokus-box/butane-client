import { Injectable } from '@angular/core';
import { API_URL } from '../constant';
import { InMemoryService } from './in-memory.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface AuditLog {
  data?: {
    agent: string;
    ip: string;
  };
  message: string;
  // Parse to Date
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuditLogService {
  private fetched = false;
  private auditLogs: AuditLog[] = [];

  constructor(
    private cache: InMemoryService,
    private http: HttpClient,
  ) {}

  async getAuditLogs() {
    if (this.fetched) {
      return this.auditLogs;
    }

    const res = await firstValueFrom(
      this.http.get<AuditLog[]>(`${API_URL}/audit-log`, {
        headers: {
          Authorization: await this.cache.getToken(),
        },
      }),
    );

    this.fetched = true;
    this.auditLogs.push(...res);

    return res;
  }
}
