import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertiesNetUserComponent } from './properties-net-user.component';

describe('PropertiesNetUserComponent', () => {
  let component: PropertiesNetUserComponent;
  let fixture: ComponentFixture<PropertiesNetUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PropertiesNetUserComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertiesNetUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
