import { Component, Input, Output, EventEmitter, OnChanges, OnInit } from '@angular/core';
import { Report } from '../../../core/model/log/Report';
import { LogService } from '../../../core/service/log.service';
import { Router } from '@angular/router';
import { ProgressiveLoaderService } from '../../../core/service/progressiveloader.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ConfirmationComponent } from '../../../shared/components/confirmation/confirmation.component';
import { LogCriteria } from 'src/app/core/model/log/LogCriteria';
import { Constants } from 'src/app/shared/components/constants';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  @Input() card: Report;
  @Output() selectedReport = new EventEmitter<object>();
  @Output() deleteReport = new EventEmitter<any>();
  @Output() editCardId = new EventEmitter<number>();
  @Input() index: number;
  loadCardStatus;
  status: boolean;
  openDropDown: boolean;
  selectedCard: Report;
  showModalRemoveCard: boolean;
  currentUser: any = null;

  constructor(
    private logService: LogService,
    private router: Router,
    private loaderService: ProgressiveLoaderService,
    private dialog: MatDialog) {
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
  }

  ngOnInit() { }

  clickEvent() {
    this.status = !this.status;
  }

  onSelect(card): void {
    this.selectedCard = card;
    this.selectedReport.emit({ card: card, index: this.index });
  }

  deleteCard(id, e, name) {
    e.stopPropagation();
    this.showModalRemoveCard = true;
  }

  removedCard(id, e, name) {
    this.deleteReport.emit({ id: id, index: this.index, name: name });
    this.openDropDown = false;
    this.showModalRemoveCard = false;
    e.stopPropagation();
  }

  cancelRemovedCard() {
    this.showModalRemoveCard = false;
  }

  editCard(id, e) {
    this.editCardId.emit(id);
    this.openDropDown = false;
    e.stopPropagation();
  }

  refreshLogCardById(card, e) {
    this.card.loadCardStatus = true;
    const criteria = new LogCriteria(
      card.id,
      card.name,
      card.description,
      card.searchText,
      card.timeFrame,
      card.error,
      1,
      "Message",
      "",
      card.items,
      (card?.defaultValue && Number(this.currentUser?.profileRef) === 11) ? false : true
    );
    this.logService.refreshLogById(card?.id, criteria).subscribe(result => {
      this.card.errorCount = result.errorCount;
      this.card.avail = result.avail;
      this.card.loadCardStatus = false;
    });
    e.stopPropagation();
  }

  openDD(e) {
    this.openDropDown = true;
    e.stopPropagation();
  }

  closeDD(e) {

    this.openDropDown = false;
    e.stopPropagation();
  }
}
