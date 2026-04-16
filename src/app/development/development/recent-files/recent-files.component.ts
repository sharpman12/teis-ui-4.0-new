import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-recent-files',
  templateUrl: './recent-files.component.html',
  styleUrls: ['./recent-files.component.scss']
})
export class RecentFilesComponent implements OnInit {
  recentFiles: string[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { recentFiles: string[] }) { }

  ngOnInit(): void {
    this.recentFiles = this.data.recentFiles;
  }
}