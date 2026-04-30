import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

import { authFlowGuard } from './auth-flow-guard';

describe('authFlowGuard', () => {
  const loginTree = {};
  let router: {
    getCurrentNavigation: ReturnType<typeof vi.fn>;
    createUrlTree: ReturnType<typeof vi.fn>;
  };

  const executeGuard = (path: string) =>
    TestBed.runInInjectionContext(() =>
      authFlowGuard(
        { routeConfig: { path } } as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
      ),
    );

  beforeEach(() => {
    router = {
      getCurrentNavigation: vi.fn(),
      createUrlTree: vi.fn().mockReturnValue(loginTree),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: router }],
    });
  });

  it('allows register-success after a register submit navigation', () => {
    router.getCurrentNavigation.mockReturnValue({
      extras: { state: { fromRegisterSubmit: true } },
    });

    expect(executeGuard('register-success')).toBe(true);
  });

  it('redirects register-success without the required navigation state', () => {
    router.getCurrentNavigation.mockReturnValue({ extras: {} });

    expect(executeGuard('register-success')).toBe(loginTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  it('allows forgot-password from the login link navigation', () => {
    router.getCurrentNavigation.mockReturnValue({
      extras: { state: { fromLoginLink: true } },
    });

    expect(executeGuard('forgot-password')).toBe(true);
  });

  it('allows forgot-password from the forgot-password-success navigation', () => {
    router.getCurrentNavigation.mockReturnValue({
      extras: { state: { fromForgotPasswordSuccess: true } },
    });

    expect(executeGuard('forgot-password')).toBe(true);
  });

  it('allows forgot-password-success after a successful forgot-password request', () => {
    router.getCurrentNavigation.mockReturnValue({
      extras: { state: { fromForgotPasswordSubmit: true } },
    });

    expect(executeGuard('forgot-password-success')).toBe(true);
  });
});
