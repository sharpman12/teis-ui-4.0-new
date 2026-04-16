import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable, ReplaySubject } from 'rxjs';
@Injectable()
export class ProgressiveLoaderService {
    isLoading = new Subject<boolean>();
    private isItemRefreshing = new BehaviorSubject(false);
    //  isItemRefreshing = new Subject<boolean>();

    constructor() { }
    isItemRefreshing$ = this.isItemRefreshing.asObservable();
    show() {
        this.isLoading.next(true);
    }
    hide() {
        this.isLoading.next(false);
    }
    showItemRefreshing() {
        this.isItemRefreshing.next(true);
    }
    hideItemRefreshing() {
        this.isItemRefreshing.next(false);
    }
}
