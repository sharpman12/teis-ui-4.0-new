import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerTaskCacheComponent } from './server-task-cache.component';

describe('ServerTaskCacheComponent', () => {
  let component: ServerTaskCacheComponent;
  let fixture: ComponentFixture<ServerTaskCacheComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServerTaskCacheComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServerTaskCacheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
