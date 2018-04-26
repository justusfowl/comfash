import { Input, Component, ViewChild, HostListener } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';


@Component({
  selector: 'link-collection',
  templateUrl: 'link-collection.component.html'
})
export class LinkCollectionComponent {
  
    @Input() 
    collectionTitle: string;

    @Input() 
    collectionId: number;

    constructor(
        public navCtrl: NavController
    ) {
    }

    @HostListener('click', ['$event.target']) onClick(btn) {
        this.navTo(this.collectionId);
    }

    navTo(collectionId : number){

        let params = {
          collectionId : collectionId
        }

        this.navCtrl.push('ImgCollectionPage', params);

    }

    


}
