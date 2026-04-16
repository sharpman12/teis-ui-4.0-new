import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertiesTriggerActivatorsComponent } from './properties-trigger-activators.component';

describe('PropertiesTriggerActivatorsComponent', () => {
  let component: PropertiesTriggerActivatorsComponent;
  let fixture: ComponentFixture<PropertiesTriggerActivatorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PropertiesTriggerActivatorsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertiesTriggerActivatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
