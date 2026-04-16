import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FlowGroup } from '../../../../core/model/flow/FlowGroup';
import { FlowService } from '../../../../core/service/flow.service';
import { ProgressiveLoaderService } from '../../../../core/service/progressiveloader.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-flowcard',
  templateUrl: './flowcard.component.html'
})
export class FlowcardComponent implements OnInit, OnChanges {

  @Input() card: FlowGroup;
  @Output() refreshCardData = new EventEmitter<number>();
  @Input() allCards: FlowGroup[];
  public Floading: boolean = false;
  loadCardStatus;
  public cards = [];
  isFailed: boolean;
  status: boolean = true;
  constructor(private flowService: FlowService,
    private router: Router) { }

  ngOnChanges() {
    this.cards = this.allCards;
  }
  ngOnInit(): void {
  }
  clickEvent() {
    this.status = !this.status;
  }
  selectCard(id, e) {
    this.router.navigate(['/flows', id]);
    e.stopPropagation();
  }

  refreshFlowCard(id, e) {
    this.card.loadCardStatus = true;
    this.flowService.refreshFlowById(id).subscribe(result => {
      this.card.errorCount = result.errorCount;
      this.card.avail = result.avail;
      this.card.loadCardStatus = false;
    });
    e.stopPropagation();
  }


}
