import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { DbService } from '../services/db.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export const AuthGuard: CanActivateFn = async (route, state) => {
  const db = inject(DbService);
  const router = inject(Router);
  const snack = inject(MatSnackBar);

  await db.getToken().catch(() => {
    snack.open('You must be logged in to access this page', '', {
      duration: 5000,
    });
    return router.navigate(['/auth']);
  });

  return true;
};
