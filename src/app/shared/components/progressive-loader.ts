import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from "rxjs";
import { Subject } from 'rxjs';
import { ProgressiveLoaderService } from '../../core/service/progressiveloader.service';
@Component({
  selector: 'progressive-loader',
  templateUrl: './progressive-loader.component.html',
  // styles: []
})
export class ProgressiveLoader {
  isLoading: Subject<boolean> = this.loaderService.isLoading;
  constructor(private loaderService: ProgressiveLoaderService) { }
}
