import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveFlowComponent } from './archive-flow.component';

describe('ArchiveFlowComponent', () => {
  let component: ArchiveFlowComponent;
  let fixture: ComponentFixture<ArchiveFlowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArchiveFlowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchiveFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
