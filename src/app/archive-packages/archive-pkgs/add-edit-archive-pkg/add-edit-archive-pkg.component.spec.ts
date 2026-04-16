import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditArchivePkgComponent } from './add-edit-archive-pkg.component';

describe('AddEditArchivePkgComponent', () => {
  let component: AddEditArchivePkgComponent;
  let fixture: ComponentFixture<AddEditArchivePkgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditArchivePkgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditArchivePkgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
