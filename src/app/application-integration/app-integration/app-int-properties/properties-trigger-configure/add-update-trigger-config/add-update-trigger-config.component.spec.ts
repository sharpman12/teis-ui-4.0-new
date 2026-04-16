import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateTriggerConfigComponent } from './add-update-trigger-config.component';

describe('AddUpdateTriggerConfigComponent', () => {
  let component: AddUpdateTriggerConfigComponent;
  let fixture: ComponentFixture<AddUpdateTriggerConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddUpdateTriggerConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUpdateTriggerConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
