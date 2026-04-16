import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfigurationsService } from '../configurations.service';
import { Router } from '@angular/router';
import { HeaderService } from 'src/app/core/service/header.service';
import { BreadCrumbService } from 'src/app/core/service/breadcrumb.service';

@Component({
  selector: 'app-plugin-info',
  templateUrl: './plugin-info.component.html',
  styleUrls: ['./plugin-info.component.scss']
})
export class PluginInfoComponent implements OnInit, OnChanges, OnDestroy {
  @Input() tabIndex: number;
  scrWidth: number;
  plugins = [];

  pluginsInfoSub = Subscription.EMPTY;

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
    // if (!this.plugins?.length) {
    //   if (this.tabIndex === 3) {
    //     this.getPluginInfo();
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
    this.getPluginInfo();
  }

  onRefresh() {
    this.getPluginInfo();
  }

  /*=========== Get Plugin Info ===========*/
  getPluginInfo() {
    this.pluginsInfoSub = this.configurationsService.getPluginInfo().subscribe(res => {
      this.plugins = res;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  ngOnDestroy(): void {
    this.pluginsInfoSub.unsubscribe();
  }

}
