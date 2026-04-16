import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-card-panel',
  templateUrl: './card-panel.component.html',
  styleUrls: ['./card-panel.component.scss']
})
export class CardPanelComponent implements OnInit {

  constructor() { }
  hidden:boolean = false;
  public show:boolean = false;
  @Input() row: any;
  public buttonName:any = '+';

  ngOnInit() {
  }
  toggleSign (){
    this.show = !this.show;     
      if(this.show)  
        this.buttonName = "+";
      else
        this.buttonName = "-";
  }
}
