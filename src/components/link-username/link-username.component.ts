import { Input, Component, ViewChild, HostListener } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';


@Component({
  selector: 'link-username',
  templateUrl: 'link-username.component.html'
})
export class LinkUsernameComponent {
  
    @Input() 
    userName: string;

    @Input() 
    userId: string;

    constructor(
        public navCtrl: NavController
    ) {
    }

    @HostListener('click', ['$event.target']) onClick(btn) {
        this.navTo(this.userId);
    }

    navTo(userId){

        let params = {
            userId : userId
          };

        this.navCtrl.push('MyRoomPage', params);

    }

    


}
