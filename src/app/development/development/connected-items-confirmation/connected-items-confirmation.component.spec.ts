import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectedItemsConfirmationComponent } from './connected-items-confirmation.component';

describe('ConnectedItemsConfirmationComponent', () => {
  let component: ConnectedItemsConfirmationComponent;
  let fixture: ComponentFixture<ConnectedItemsConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConnectedItemsConfirmationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectedItemsConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
