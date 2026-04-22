import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivatePage } from './activate-page';

describe('ActivatePage', () => {
  let component: ActivatePage;
  let fixture: ComponentFixture<ActivatePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivatePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivatePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
