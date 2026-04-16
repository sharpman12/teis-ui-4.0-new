import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfigurationsService } from '../configurations.service';
import { Router } from '@angular/router';
import { HeaderService } from 'src/app/core/service/header.service';
import { BreadCrumbService } from 'src/app/core/service/breadcrumb.service';

@Component({
  selector: 'app-identifier-info',
  templateUrl: './identifier-info.component.html',
  styleUrls: ['./identifier-info.component.scss']
})
export class IdentifierInfoComponent implements OnInit, OnChanges, OnDestroy {
  @Input() tabIndex: number;
  scrWidth: number;
  identifiers = [];

  allIdentifiersSub = Subscription.EMPTY;

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    this.scrWidth = window.innerWidth;
  }

  constructor(
    private router: Router,
    private header: HeaderService,
    private breadcrumb: BreadCrumbService,
    private configurationsService: ConfigurationsService,
  ) {
    this.getScreenSize();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // if (!this.identifiers?.length) {
    //   if (this.tabIndex === 2) {
    //     this.getIdentifiers();
    //   }
    // }
  }

  ngOnInit(): void {
    this.header.show(); // show hide header
    if (localStorage.getItem('source') || this.router.url === '/configuration/adapter_information') {
      this.breadcrumb.visible = true;
      this.breadcrumb.previousHide();
    } else {
      this.breadcrumb.visible = false;
      this.breadcrumb.previous(); // show hide breadcrumb
    }
    this.getIdentifiers();
  }

  onRefresh() {
    this.getIdentifiers();
  }

  /*=========== Get All Identifiers ===========*/
  getIdentifiers() {
    this.allIdentifiersSub = this.configurationsService.getAllIdentifiers().subscribe(res => {
      this.identifiers = res;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  ngOnDestroy(): void {
    this.allIdentifiersSub.unsubscribe();
  }

}
