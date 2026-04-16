import { Component, OnInit } from '@angular/core';
import { BreadCrumbService } from 'src/app/core/service/breadcrumb.service';
import { HeaderService } from 'src/app/core/service/header.service';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {

  constructor(
    private header: HeaderService,
    public breadcrumb: BreadCrumbService,
    public sharedService: SharedService,
  ) { }

  ngOnInit() {
    this.header.show(); // show hide header
    if (localStorage.getItem('source')) {
      this.breadcrumb.visible = true;
    } else {
      this.breadcrumb.visible = true;
      this.breadcrumb.previousHide(); // show hide breadcrumb
    }
  }

}
