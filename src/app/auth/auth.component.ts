import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../shared/constant';
import { firstValueFrom } from 'rxjs';
import { TotpService } from '../shared/services/totp.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ClassValidatorFormBuilderService } from 'ngx-reactive-form-class-validator';
import { Matches, MaxLength, MinLength } from 'class-validator';
import { getFirstError } from '../shared/helpers/getFirstError';
import { CryptoService } from '../shared/services/crypto.service';

class PasswordForm {
  @MinLength(12, {
    message: 'Password must be at least 12 characters long.',
  })
  @MaxLength(72, { message: 'Password must be less than 72 characters.' })
  @Matches(/[a-z]/, {
    message: 'Password must contain at least one lowercase letter.',
  })
  @Matches(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter.',
  })
  @Matches(/\d/, { message: 'Password must contain at least one number.' })
  @Matches(/[^A-Za-z0-9]/, { message: 'Password must contain a symbol.' })
  password: string;
}

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent {
  isMobile = window.innerWidth < 768;
  totpObj: { secret: string; url: string } | null;
  loading = false;
  otpCode = '';
  oauthCode = '';
  currentProvider = '';
  isRegistering = true;
  // rdrUri = 'https://butane.rokusbox.com';
  rdrUri = 'http://localhost:4200';

  googleUrl =
    'https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=' +
    this.rdrUri +
    '/auth/google&client_id=470074248070-456k1vvum68rqg85u4ritcqcseqfs4br.apps.googleusercontent.com&access_type=offline&response_type=code&prompt=consent&scope=https://www.googleapis.com/auth/userinfo.email';

  discordUrl =
    'https://discord.com/api/oauth2/authorize?client_id=1178419723390685326&redirect_uri=' +
    this.rdrUri +
    '/auth/discord&response_type=code&scope=email identify';

  authFormGroup = this.fb.group(PasswordForm, {
    password: [''],
  });

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    public snack: MatSnackBar,
    private http: HttpClient,
    private activated: ActivatedRoute,
    public totp: TotpService,
    private router: Router,
    private fb: ClassValidatorFormBuilderService,
    private cryptoService: CryptoService,
  ) {
    let provider = this.activated.snapshot.queryParamMap.get('provider');
    let code = this.activated.snapshot.queryParamMap.get('code');

    if (performance.navigation.type == 1) {
      provider = null;
      code = null;
    }

    if (null != provider && null != code) {
      this.oauthCode = code;
      this.totpObj = this.totp.generateSecret(code);
      this.currentProvider = provider;
    }

    this.authFormGroup.markAllAsTouched();
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
      'discord',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/discord.svg'),
    );

    (<any>window).CallOnClose = (loc: Location) => {
      try {
        const code = new URL(loc.href).searchParams.get('code');
        if (null == code || '' == code) {
          this.snack.open('Something went wrong. Please try again later.', '', {
            duration: 5000,
          });

          return;
        }

        this.oauthCode = code;
        this.totpObj = this.totp.generateSecret(code);
        this.currentProvider = provider as string;
      } catch (e) {
        console.log(e);
        this.snack.open('Something went wrong. Please try again later.', '', {
          duration: 5000,
        });
      }
    };
  }

  popGoogle(url: string) {
    if (this.isMobile) {
      window.location.href = url;
      return;
    }
    this.handleDesktopOauth(url, 'google');
  }

  popDiscord(url: string) {
    if (this.isMobile) {
      window.location.href = url;
      return;
    }

    this.handleDesktopOauth(url, 'discord');
  }

  async authorize() {
    this.loading = true;
    firstValueFrom(
      this.http.post(
        `${API_URL}/oauth/${this.currentProvider}/authenticate`,
        this.oauthCode + '\n' + this.authFormGroup.controls['password'].value,
        {
          responseType: 'text',
          headers: {
            'X-Mfa-Challenge': this.otpCode,
          },
        },
      ),
    )
      .then(async (res) => {
        this.loading = false;
        await this.cryptoService.generateKey(
          this.authFormGroup.controls['password'].value,
        );

        sessionStorage.setItem('token', res);

        await this.router.navigate(['home']);
      })
      .catch((err) => {
        const message =
          'Invalid MFA code' === err.error
            ? 'Invalid code provided. Please re-authenticate.'
            : 'Something went wrong. Please try again later.';

        this.snack.open(message, '', {
          duration: 5000,
        });

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

  protected readonly getFirstError = getFirstError;

  handleDesktopOauth(url: string, provider: string) {
    this.loading = true;
    const popup = window.open(url, 'name', 'height=800,width=1050,return true');
    if (null != window.focus && null != popup) {
      popup.focus();
    }
  }
}
