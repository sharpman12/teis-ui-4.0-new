import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
 // styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnChanges, OnInit {

  @Output() readonly getNextPage = new EventEmitter();
  @Input() activePage;
  @Input() totalRecords;
  @Input() nextPageToken;
  @Input() selectedLeg;
  @Input() recordsPerPage;

  // pagination
  public paginators = [];
  public pagination: number;
  public paginationSize: number;
  public firstVisibleIndex = 1;
  public lastVisibleIndex = 5;
  public lastPageNo: number;
  public firstPageNo: number;
  public prevPageLabel: string;
  public nextPageLabel: string;

  constructor(private readonly router: Router) { }

  ngOnInit(): void {
    this.prevPageLabel = 'First';
    this.nextPageLabel = 'Last';
    this.firstPageNo = 1;
    if (!this.recordsPerPage) {
      this.recordsPerPage = 5;
    }
    this.lastPageNo = Math.ceil(this.totalRecords / this.recordsPerPage);
    this.paginators = this.getPager(this.totalRecords, this.activePage, this.recordsPerPage);
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        if (!event.url.indexOf('tripId')) {
          this.activePage = 1;
        }
        this.paginators = this.getPager(this.totalRecords, this.activePage, this.recordsPerPage);
      }
    });
  }

  // Total records can change based on list filtering.  Detect changes and update the pagination values
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.activePage) {
      this.activePage = changes.activePage.currentValue;
    }
    if (changes.totalRecords) {
      this.totalRecords = changes.totalRecords.currentValue;
      this.lastPageNo = Math.ceil(this.totalRecords / this.recordsPerPage);
    }
    this.paginators = this.getPager(this.totalRecords, this.activePage, this.recordsPerPage);
  }

  nextPage(event: any): void {
    if (this.activePage === this.lastPageNo) {
      return;
    }
    this.activePage += 1;
    this.getNextPage.emit({
      activePage: this.activePage,
      firstVisibleIndex: this.firstVisibleIndex,
      lastVisibleIndex: this.lastVisibleIndex
    });
    this.paginators = this.getPager(this.totalRecords, this.activePage, this.recordsPerPage);
  }

  previousPage(event: any): void {
    if (this.activePage === this.firstPageNo) {
      return;
    }
    this.activePage -= 1;
    this.getNextPage.emit({
      activePage: this.activePage,
      firstVisibleIndex: this.firstVisibleIndex,
      lastVisibleIndex: this.lastVisibleIndex
    });
    this.paginators = this.getPager(this.totalRecords, this.activePage, this.recordsPerPage);
  }

  changePage(event: any): void {
    this.activePage = +event.target.text;
    this.getNextPage.emit({
      activePage: this.activePage,
      firstVisibleIndex: this.firstVisibleIndex,
      lastVisibleIndex: this.lastVisibleIndex
    });
    this.paginators = this.getPager(this.totalRecords, this.activePage, this.recordsPerPage);
  }

  firstPage(): void {
    if (this.activePage === this.firstPageNo) {
      return;
    }
    this.activePage = this.firstPageNo;
    this.getNextPage.emit({
      activePage: this.activePage,
      firstVisibleIndex: this.firstVisibleIndex,
      lastVisibleIndex: this.lastVisibleIndex
    });
    this.paginators = this.getPager(this.totalRecords, this.activePage, this.recordsPerPage);
  }

  lastPage(): void {
    if (this.activePage === this.lastPageNo) {
      return;
    }
    this.activePage = this.lastPageNo;
    this.getNextPage.emit({
      activePage: this.activePage,
      firstVisibleIndex: this.firstVisibleIndex,
      lastVisibleIndex: this.lastVisibleIndex
    });
    this.paginators = this.getPager(this.totalRecords, this.activePage, this.recordsPerPage);
  }

  getPager(totalItems: number, currentPage: number = 1, pageSize: number = this.recordsPerPage): Array<number> {

    const totalPages = Math.ceil(totalItems / pageSize);
    let startPage: number, endPage: number;

    if (totalPages <= 5) {
      startPage = 1;
      endPage = totalPages;
    } else if (currentPage <= 3) {
      startPage = 1;
      endPage = 5;
    } else if (currentPage + 1 >= totalPages) {
      startPage = totalPages - 4;
      endPage = totalPages;
    } else if ((totalPages - (currentPage - 2)) === 5) {
      startPage = currentPage - 1;
      endPage = currentPage + 3;
    } else {
      startPage = currentPage - 2;
      endPage = currentPage + 2;
    }

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);
    let pages = [];
    for(let i = startPage; i < endPage + 1; i++) {
      pages.push(i);
    }
    return pages;
  }

  more(): void {
    this.activePage = this.activePage + 1;
    this.getNextPage.emit({
      activePage: this.activePage,
      firstVisibleIndex: this.firstVisibleIndex,
      lastVisibleIndex: this.lastVisibleIndex
    });
    this.paginators = this.getPager(this.totalRecords, this.activePage, this.recordsPerPage);
  }
}
