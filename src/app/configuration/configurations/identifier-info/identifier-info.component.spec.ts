import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentifierInfoComponent } from './identifier-info.component';

describe('IdentifierInfoComponent', () => {
  let component: IdentifierInfoComponent;
  let fixture: ComponentFixture<IdentifierInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IdentifierInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IdentifierInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
