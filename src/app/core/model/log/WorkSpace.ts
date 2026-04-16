import { Injectable } from '@angular/core';

export class Workspace {
    constructor(
        public name: string,
        public id: number,
        public type: string
    ) { }
}
