import { Component } from '@angular/core';

@Component({
  selector: 'app-provider',
  template: 'loading...',
})
export class Provider {
  constructor() {
    window.close();
  }
}
