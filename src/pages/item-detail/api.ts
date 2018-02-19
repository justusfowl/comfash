import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

/**
 * Api is a generic REST Api handler. Set your API url first.
 */
@Injectable()
export class Api {
  url: string = 'https://example.com/api/v1';

  public collections : any = [];
  selectedImgCompare : any = [];
  

  constructor(public http: HttpClient) {

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
      this.collections.push(item);
    }

  }


  get(endpoint: string, params?: any, reqOpts?: any) {

    if (endpoint == "collection"){
      return this.collections;
    }
    
    /*
    if (!reqOpts) {
      reqOpts = {
        params: new HttpParams()
      };
    }

    // Support easy query params for GET requests
    if (params) {
      reqOpts.params = new HttpParams();
      for (let k in params) {
        reqOpts.params = reqOpts.params.set(k, params[k]);
      }
    }

    return this.http.get(this.url + '/' + endpoint, reqOpts);
    */
  }

  post(endpoint: string, body: any, reqOpts?: any) {
    return this.http.post(this.url + '/' + endpoint, body, reqOpts);
  }

  put(endpoint: string, body: any, reqOpts?: any) {
    return this.http.put(this.url + '/' + endpoint, body, reqOpts);
  }

  delete(endpoint: string, reqOpts?: any) {
    return this.http.delete(this.url + '/' + endpoint, reqOpts);
  }

  patch(endpoint: string, body: any, reqOpts?: any) {
    return this.http.put(this.url + '/' + endpoint, body, reqOpts);
  }
}
