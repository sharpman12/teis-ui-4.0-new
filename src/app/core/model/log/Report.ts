import { Injectable } from '@angular/core';
import Adapter from '../../interface/adapter';
import { ItemData } from './ItemData';

export class Report {
    constructor(
        public id: number,
        public name: string,
        public description: string,
        public searchText: string,
        public timeFrame: string,
        public errorCount: number,
        public error: boolean,
        public items: Array<ItemData>,
        public defaultValue: boolean,
        public avail?: boolean,
        public loadCardStatus?: boolean
    ) { }

}


