import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppIntCreateFolderComponent } from './app-int-create-folder.component';

describe('AppIntCreateFolderComponent', () => {
  let component: AppIntCreateFolderComponent;
  let fixture: ComponentFixture<AppIntCreateFolderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppIntCreateFolderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppIntCreateFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
