import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const mailLinkGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const uid = route.queryParamMap.get('uid');
  const token = route.queryParamMap.get('token');

  if (uid && token) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
