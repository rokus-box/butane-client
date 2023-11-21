import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  constructor() {
    // the localStorage key is 'lightTheme' and the default/initial value is 'false'
    const theme = localStorage.getItem('lightTheme');

    if (theme === null) {
      localStorage.setItem('lightTheme', 'false');
    }

    if ('true' === theme) {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }

  toggleLightTheme() {
    const lightTheme = localStorage.getItem('lightTheme') === 'true';

    if (lightTheme) {
      localStorage.setItem('lightTheme', 'false');
      document.body.classList.remove('light-theme');
    } else {
      localStorage.setItem('lightTheme', 'true');
      document.body.classList.add('light-theme');
    }
  }

  isLightTheme() {
    return document.body.classList.contains('light-theme');
  }
}
