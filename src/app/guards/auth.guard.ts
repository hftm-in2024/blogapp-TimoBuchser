import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthStore } from '../services/auth-store';

export const authGuard: CanMatchFn = async (_route, segments) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  await authStore.ready;
  if (authStore.isAuthenticated()) return true;

  const returnUrl = `/${segments.map((segment) => segment.path).join('/')}`;
  return router.createUrlTree(['/login'], { queryParams: { returnUrl } });
};
