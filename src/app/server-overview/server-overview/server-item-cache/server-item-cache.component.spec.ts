import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerItemCacheComponent } from './server-item-cache.component';

describe('ServerItemCacheComponent', () => {
  let component: ServerItemCacheComponent;
  let fixture: ComponentFixture<ServerItemCacheComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServerItemCacheComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServerItemCacheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
