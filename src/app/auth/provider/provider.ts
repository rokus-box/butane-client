import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-provider',
  template: 'loading...',
})
export class Provider {
  isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );

  constructor(
    private router: Router,
    private activated: ActivatedRoute,
  ) {
    if (!this.isMobile) {
      window.close();
      return;
    }

    this.router.navigate(['auth'], {
      queryParams: {
        provider: this.activated.snapshot.paramMap.get('provider'),
        code: new URLSearchParams(window.location.search).get('code'),
      },
    });
  }
}
