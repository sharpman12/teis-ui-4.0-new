import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppIntAddEditItemComponent } from './app-int-add-edit-item.component';

describe('AppIntAddEditItemComponent', () => {
  let component: AppIntAddEditItemComponent;
  let fixture: ComponentFixture<AppIntAddEditItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppIntAddEditItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppIntAddEditItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
