import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private snack: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError(async (err: HttpErrorResponse) => {
        this.dialog.closeAll();
        if (err.status === 401) {
          this.snack.open('Something went wrong. Please login again.', '', {
            duration: 5000,
          });
          await this.router.navigate(['auth']);
        } else {
          if (err.error) {
            this.snack.open(err.error, '', {
              duration: 5000,
            });
          } else {
            this.snack.open(err.statusText, '', {
              duration: 5000,
            });
          }
        }
        throw err;
      }),
    );
  }
}
