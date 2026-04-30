import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotPasswordSuccessPage } from './forgot-password-success-page';

describe('ForgotPasswordSuccessPage', () => {
  let component: ForgotPasswordSuccessPage;
  let fixture: ComponentFixture<ForgotPasswordSuccessPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgotPasswordSuccessPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordSuccessPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
