import { Injectable } from '@angular/core';

import { Item } from '../../models/item';

@Injectable()
export class Items {
  items: Item[] = [];

  defaultItem: any = {
    "name": "Burt Bear",
    "profilePic": "assets/img/bear.jpg",
    "about": "Burt is a Bear.",
  };

  constructor() {
    let items = [
      {
        "name": "DINNER",
        "profilePic": "assets/img/1.jpg",
        "about": "Burt is a Bear.", 
        "items" : [{
          "name": "Donald Duck",
          "profilePic": "assets/img/1.jpg",
          "about": "Donald is a Duck.",
          "collection" : [{
              "name": "Donald Duck",
              "profilePic": "assets/img/1.jpg",
              "about": "Donald is a Duck."
            },
            {
              "name": "TEST1",
              "profilePic": "assets/img/2.jpg",
              "about": "Eva is an Eagle."
            },
            {
              "name": "Ellie Elephant",
              "profilePic": "assets/img/3.jpg",
              "about": "Ellie is an Elephant."
            },
            {
              "name": "Molly Mouse",
              "profilePic": "assets/img/4.jpg",
              "about": "Molly is a Mouse."
            },
            {
              "name": "Paul Puppy",
              "profilePic": "assets/img/5.jpg",
              "about": "Paul is a Puppy."
            }]
        },
        {
          "name": "TEST1",
          "profilePic": "assets/img/2.jpg",
          "about": "Eva is an Eagle.",
          "collection" : [{
              "name": "Donald Duck",
              "profilePic": "assets/img/1.jpg",
              "about": "Donald is a Duck."
            },
            {
              "name": "TEST1",
              "profilePic": "assets/img/2.jpg",
              "about": "Eva is an Eagle."
            },
            {
              "name": "Ellie Elephant",
              "profilePic": "assets/img/3.jpg",
              "about": "Ellie is an Elephant."
            },
            {
              "name": "Molly Mouse",
              "profilePic": "assets/img/4.jpg",
              "about": "Molly is a Mouse."
            },
            {
              "name": "Paul Puppy",
              "profilePic": "assets/img/5.jpg",
              "about": "Paul is a Puppy."
            }]
        },
        {
          "name": "Ellie Elephant",
          "profilePic": "assets/img/3.jpg",
          "about": "Ellie is an Elephant."
        },
        {
          "name": "Molly Mouse",
          "profilePic": "assets/img/4.jpg",
          "about": "Molly is a Mouse."
        },
        {
          "name": "Paul Puppy",
          "profilePic": "assets/img/5.jpg",
          "about": "Paul is a Puppy."
        }]
      },
      {
        "name": "PARTY",
        "profilePic": "assets/img/2.jpg",
        "about": "Charlie is a Cheetah.", 
        "items" : [{
          "name": "Donald Duck",
          "profilePic": "assets/img/1.jpg",
          "about": "Donald is a Duck."
        },
        {
          "name": "Eva Eagle",
          "profilePic": "assets/img/2.jpg",
          "about": "Eva is an Eagle."
        },
        {
          "name": "Ellie Elephant",
          "profilePic": "assets/img/3.jpg",
          "about": "Ellie is an Elephant."
        },
        {
          "name": "Molly Mouse",
          "profilePic": "assets/img/4.jpg",
          "about": "Molly is a Mouse."
        },
        {
          "name": "Paul Puppy",
          "profilePic": "assets/img/5.jpg",
          "about": "Paul is a Puppy."
        }]
      },
      {
        "name": "LEISURE",
        "profilePic": "assets/img/3.jpg",
        "about": "Donald is a Duck.", 
        "items" : [{
          "name": "Donald Duck",
          "profilePic": "assets/img/1.jpg",
          "about": "Donald is a Duck."
        },
        {
          "name": "Eva Eagle",
          "profilePic": "assets/img/2.jpg",
          "about": "Eva is an Eagle."
        },
        {
          "name": "Ellie Elephant",
          "profilePic": "assets/img/3.jpg",
          "about": "Ellie is an Elephant."
        },
        {
          "name": "Molly Mouse",
          "profilePic": "assets/img/4.jpg",
          "about": "Molly is a Mouse."
        },
        {
          "name": "Paul Puppy",
          "profilePic": "assets/img/5.jpg",
          "about": "Paul is a Puppy."
        }]
      },
      {
        "name": "BUSINESS",
        "profilePic": "assets/img/4.jpg",
        "about": "Eva is an Eagle.", 
        "items" : [{
          "name": "Donald Duck",
          "profilePic": "assets/img/1.jpg",
          "about": "Donald is a Duck."
        },
        {
          "name": "Eva Eagle",
          "profilePic": "assets/img/2.jpg",
          "about": "Eva is an Eagle."
        },
        {
          "name": "Ellie Elephant",
          "profilePic": "assets/img/3.jpg",
          "about": "Ellie is an Elephant."
        },
        {
          "name": "Molly Mouse",
          "profilePic": "assets/img/4.jpg",
          "about": "Molly is a Mouse."
        },
        {
          "name": "Paul Puppy",
          "profilePic": "assets/img/5.jpg",
          "about": "Paul is a Puppy."
        }]
      }
    ];

    for (let item of items) {
      this.items.push(new Item(item));
    }
  }

  query(params?: any) {
    if (!params) {
      return this.items;
    }

    return this.items.filter((item) => {
      for (let key in params) {
        let field = item[key];
        if (typeof field == 'string' && field.toLowerCase().indexOf(params[key].toLowerCase()) >= 0) {
          return item;
        } else if (field == params[key]) {
          return item;
        }
      }
      return null;
    });
  }

  add(item: Item) {
    this.items.push(item);
  }

  delete(item: Item) {
    this.items.splice(this.items.indexOf(item), 1);
  }
}
