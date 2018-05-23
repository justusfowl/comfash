import { Component, Input, OnInit } from '@angular/core';

/**
 * Generated class for the VidIconComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'vid-icon',
  templateUrl: 'vid-icon.html'
})

export class VidIconComponent implements OnInit{

  @Input() 
  type: string;

  isVid : boolean = false;

  constructor() {
   
  }

  ngOnInit() {
    this.getIsVid(this.type);
  }

  getIsVid(type){

    try{
      if (type.indexOf("video") != -1){
        this.isVid = true;
      }else{
        this.isVid = false;
      }
    }
    catch(err){
      this.isVid = false;
    }
    
  }

}
