import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

import { Item } from '../../models/item';

@IonicPage()
@Component({
  selector: 'page-cards',
  templateUrl: 'cards.html'
})
export class CardsPage {
  cardItems: any[];

  constructor(public navCtrl: NavController) {
    this.cardItems = [
      {
        user: {
          avatar: 'assets/img/marty-avatar.png',
          name: 'Tom Miller'
        },
        date: '35min ago',
        image: 'assets/img/office.jpg',
        content: 'Business dinner fashion', 
        "items" : [{
          "name": "Donald Duck",
          "profilePic": "assets/img/speakers/1.jpg",
          "about": "Donald is a Duck.", 
          "active" : true
        },
        {
          "name": "TEST1",
          "profilePic": "assets/img/speakers/2.jpg",
          "about": "Eva is an Eagle."
        },
        {
          "name": "Ellie Elephant",
          "profilePic": "assets/img/speakers/3.jpg",
          "about": "Ellie is an Elephant."
        },
        {
          "name": "Molly Mouse",
          "profilePic": "assets/img/speakers/4.jpg",
          "about": "Molly is a Mouse."
        },
        {
          "name": "Paul Puppy",
          "profilePic": "assets/img/speakers/5.jpg",
          "about": "Paul is a Puppy."
        }]
      },
      {
        user: {
          avatar: 'assets/img/sarah-avatar.png.jpeg',
          name: 'Sally McLoy'
        },
        date: '2d ago',
        image: 'assets/img/prom.jpg',
        content: 'Prom dress'
      },
      {
        user: {
          avatar: 'assets/img/ian-avatar.png',
          name: 'Kim Schiller'
        },
        date: '11min ago',
        image: 'assets/img/dress.jpg',
        content: 'Office cloths'
      }
    ];

  }

  openItem(item: Item) {
    this.navCtrl.push('ItemDetailPage', {
      item: item
    });
  }

}
