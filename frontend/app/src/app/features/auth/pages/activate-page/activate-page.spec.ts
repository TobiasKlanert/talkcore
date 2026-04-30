import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { ActivatePage } from './activate-page';
import { AuthService } from '@core/services/auth.service';

describe('ActivatePage', () => {
  let component: ActivatePage;
  let fixture: ComponentFixture<ActivatePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivatePage],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            activateAccount: () => of({ detail: 'Account activated successfully.' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivatePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
