import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  convertToParamMap,
} from '@angular/router';

import { mailLinkGuard } from './mail-link-guard';

describe('mailLinkGuard', () => {
  const loginTree = {};
  let router: { createUrlTree: ReturnType<typeof vi.fn> };

  const executeGuard = (queryParams: Record<string, string>) =>
    TestBed.runInInjectionContext(() =>
      mailLinkGuard(
        { queryParamMap: convertToParamMap(queryParams) } as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
      ),
    );

  beforeEach(() => {
    router = {
      createUrlTree: vi.fn().mockReturnValue(loginTree),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: router }],
    });
  });

  it('allows mail links with uid and token', () => {
    expect(executeGuard({ uid: 'abc', token: 'xyz' })).toBe(true);
  });

  it('redirects routes without complete mail link parameters', () => {
    expect(executeGuard({ uid: 'abc' })).toBe(loginTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
