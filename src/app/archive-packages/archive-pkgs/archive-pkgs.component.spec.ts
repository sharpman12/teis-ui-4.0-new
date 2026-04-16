import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchivePkgsComponent } from './archive-pkgs.component';

describe('ArchivePkgsComponent', () => {
  let component: ArchivePkgsComponent;
  let fixture: ComponentFixture<ArchivePkgsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArchivePkgsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchivePkgsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
