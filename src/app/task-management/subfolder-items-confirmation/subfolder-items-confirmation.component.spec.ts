import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubfolderItemsConfirmationComponent } from './subfolder-items-confirmation.component';

describe('SubfolderItemsConfirmationComponent', () => {
  let component: SubfolderItemsConfirmationComponent;
  let fixture: ComponentFixture<SubfolderItemsConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubfolderItemsConfirmationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubfolderItemsConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
