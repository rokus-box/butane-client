import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../shared/constant';
import { firstValueFrom } from 'rxjs';
import { DbService } from '../shared/services/db.service';
import { TotpService } from '../shared/services/totp.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent {
  totpObj: { secret: string; url: string } | null;
  loading = false;
  otpCode = '';
  oauthCode = '';
  currentProvider = '';
  isRegistering = true;

  googleUrl =
    'https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=http%3A%2F%2Flocalhost%3A4200%2Fauth%2Fgoogle&client_id=470074248070-456k1vvum68rqg85u4ritcqcseqfs4br.apps.googleusercontent.com&access_type=offline&response_type=code&prompt=consent&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email';

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    public snack: MatSnackBar,
    private http: HttpClient,
    private dbService: DbService,
    public totp: TotpService,
    private router: Router,
  ) {
    const isRegistering = localStorage.getItem('registering');
    if (null != isRegistering) {
      this.isRegistering = 'true' === isRegistering;
    } else {
      localStorage.setItem('registering', 'true');
    }

    this.matIconRegistry.addSvgIcon(
      'google',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/google.svg'),
    );
    this.matIconRegistry.addSvgIcon(
      'twitter-x',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/twitter-x.svg'),
    );
    this.matIconRegistry.addSvgIcon(
      'discord',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/discord.svg'),
    );
  }

  popGoogle(url: string) {
    this.loading = true;
    const popup = window.open(url, 'name', 'height=600,width=450');
    if (null != window.focus && null != popup) {
      popup.focus();
    }

    const interval = setInterval(() => {
      if (popup?.closed) {
        clearInterval(interval);
        this.loading = false;
        try {
          const code = new URL(popup!.location.href).searchParams.get('code');
          if (null == code || '' == code) {
            this.snack.open(
              'Something went wrong. Please try again later.',
              '',
              { duration: 5000 },
            );

            return;
          }

          this.oauthCode = code;
          this.totpObj = this.totp.generateSecret(code);
          this.currentProvider = 'google';
        } catch (e) {
          this.snack.open('Something went wrong. Please try again later.', '', {
            duration: 5000,
          });
        }
      }
    }, 1000);
  }

  async authorize() {
    this.loading = true;
    firstValueFrom(
      this.http.post(
        `${API_URL}/oauth/${this.currentProvider}/authenticate`,
        this.oauthCode,
        {
          responseType: 'text',
          headers: {
            'X-Mfa-Challenge': this.totp.generateCode('JB2DER2PNQZG4N2R'),
          },
        },
      ),
    )
      .then(async (res) => {
        this.loading = false;
        await this.dbService.saveToken(res);
        await this.router.navigate(['home']);
      })
      .catch((err) => {
        if ('Invalid MFA code' === err.error) {
          this.snack.open(
            'Invalid code provided. Please re-authenticate.',
            '',
            {
              duration: 5000,
            },
          );
        } else {
          this.snack.open('Something went wrong. Please try again later.', '', {
            duration: 5000,
          });
        }

        this.loading = false;
        this.totpObj = null;
        this.otpCode = '';
        this.oauthCode = '';
        this.currentProvider = '';
      });
  }

  onRegisteringChanged(checked: boolean) {
    localStorage.setItem('registering', checked ? 'true' : 'false');
    this.isRegistering = checked;
  }
}
