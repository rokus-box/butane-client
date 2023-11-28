import { Component } from '@angular/core';
import {
  AuditLog,
  AuditLogService,
} from '../../shared/services/audit-log.service';

@Component({
  selector: 'app-audit-log',
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.scss'],
})
export class AuditLogComponent {
  auditLogs: AuditLog[] = [];
  loading = false;
  cursor?: string;

  constructor(private auditLogService: AuditLogService) {
    this.getAuditLogs();
  }

  async getAuditLogs() {
    this.loading = true;
    this.auditLogs = await this.auditLogService.getAuditLogs();
    this.loading = false;
  }

  parseUserAgent(userAgentString: string) {
    const ua = userAgentString.toLowerCase();
    let match;

    let browser = 'Unknown';
    if (
      (match = ua.match(
        /(edge|chrome|safari|firefox|opera|msie|trident(?=\/))\/?/,
      ))
    ) {
      browser = match[1] === 'trident' || match[1] === 'msie' ? 'IE' : match[1];
    }

    let os = 'Unknown';
    if ((match = ua.match(/(windows|mac os|android|linux|iphone|ipad)/))) {
      os = match[1];
    }

    browser = browser.charAt(0).toUpperCase() + browser.slice(1);
    os = os.charAt(0).toUpperCase() + os.slice(1);

    return browser + ' - ' + os;
  }
}
