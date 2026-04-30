import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterSuccessPage } from './register-success-page';

describe('RegisterSuccessPage', () => {
  let component: RegisterSuccessPage;
  let fixture: ComponentFixture<RegisterSuccessPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterSuccessPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterSuccessPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
