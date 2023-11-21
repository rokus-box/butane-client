import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../shared/services/theme.service';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  animations: [
    trigger('themeButtonAnimation', [
      state(
        'default',
        style({
          transform: 'rotate(90deg)',
          color: 'white',
        }),
      ),
      state(
        'rotated',
        style({
          transform: 'rotate(36deg)',
          color: 'black',
        }),
      ),
      transition('default => rotated', animate('0.4s ease-in-out')),
      transition('rotated => default', animate('0.4s ease-in-out')),
    ]),
  ],
})
export class SettingsComponent implements OnInit {
  isMobile = window.innerWidth < 768;
  hasEntered = false;
  themeButtonState = this.themeService.isLightTheme() ? 'rotated' : 'default';

  charsInputFc = new FormControl(localStorage.getItem('chars'), [
    Validators.required,
    Validators.minLength(26),
    Validators.maxLength(94),
  ]);
  charLengthSlider = new FormControl<number>(
    parseInt(localStorage.getItem('charsLength')!, 10),
    { nonNullable: true },
  );

  constructor(public themeService: ThemeService) {
    if (!localStorage.getItem('chars')) {
      localStorage.setItem(
        'chars',
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789*"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~',
      );

      localStorage.setItem('charsLength', '16');
      this.charsInputFc.setValue(localStorage.getItem('chars'));
    }
  }

  toggleLightTheme() {
    this.themeService.toggleLightTheme();
    this.themeButtonState =
      this.themeButtonState === 'default' ? 'rotated' : 'default';
  }

  ngOnInit() {
    this.charsInputFc.markAsTouched();
    this.charsInputFc.valueChanges.subscribe((value) => {
      this.charsInputFc.setValue([...new Set(value)].join(''), {
        emitEvent: false,
      });
      if (this.charsInputFc.valid) {
        localStorage.setItem('chars', value!);
      }
    });

    this.charLengthSlider.valueChanges.subscribe((value) => {
      localStorage.setItem('charsLength', value.toString());
    });
  }

  escapeFromCursor(twofaToggle: MatSlideToggle) {
    if (!this.hasEntered) {
      twofaToggle._elementRef.nativeElement.style.left = '0px';
      this.hasEntered = true;
    }

    setTimeout(() => {
      const left = Math.random() * -500;
      twofaToggle._elementRef.nativeElement.style.left = `${left}px`;

      setTimeout(() => {
        const left = Math.random() * -500;
        twofaToggle._elementRef.nativeElement.style.left = `${left}px`;
      }, 200);
    }, 100);
  }
}
