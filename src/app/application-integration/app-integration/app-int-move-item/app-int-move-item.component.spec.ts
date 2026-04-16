import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppIntMoveItemComponent } from './app-int-move-item.component';

describe('AppIntMoveItemComponent', () => {
  let component: AppIntMoveItemComponent;
  let fixture: ComponentFixture<AppIntMoveItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppIntMoveItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppIntMoveItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
