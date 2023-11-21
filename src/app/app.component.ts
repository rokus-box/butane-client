import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { ThemeService } from './shared/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  constructor(
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    // Initialize the theme service so that the light theme is applied on page load if enabled
    private _: ThemeService,
  ) {
    this.iconRegistry.addSvgIcon(
      'twofa',
      this.sanitizer.bypassSecurityTrustResourceUrl('assets/twofa.svg'),
    );
  }
}
