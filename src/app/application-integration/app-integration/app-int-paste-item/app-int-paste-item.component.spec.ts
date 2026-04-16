import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppIntPasteItemComponent } from './app-int-paste-item.component';

describe('AppIntPasteItemComponent', () => {
  let component: AppIntPasteItemComponent;
  let fixture: ComponentFixture<AppIntPasteItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppIntPasteItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppIntPasteItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
