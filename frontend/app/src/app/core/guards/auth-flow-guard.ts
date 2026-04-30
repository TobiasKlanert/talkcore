import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

const ALLOWED_STATE_KEYS_BY_ROUTE: Record<string, string[]> = {
  'register-success': ['fromRegisterSubmit'],
  'forgot-password': ['fromLoginLink', 'fromForgotPasswordSuccess'],
  'forgot-password-success': ['fromForgotPasswordSubmit'],
};

export const authFlowGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const stateKeys = ALLOWED_STATE_KEYS_BY_ROUTE[route.routeConfig?.path ?? ''];
  const navigationState = router.getCurrentNavigation()?.extras.state;

  if (stateKeys?.some((stateKey) => navigationState?.[stateKey] === true)) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
