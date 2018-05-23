import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Api, UtilService} from '../../providers/providers';
import { User } from '../../models/datamodel';
import { TranslateService } from '@ngx-translate/core';

/**
 * Generated class for the SearchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
})
export class SearchPage implements OnInit{

  tmpSearchlist : any;
  searchTerm : string;

  searchPlaceholder : string = "";

  hasRun : boolean = false;
  noResults : boolean = false;
  isLoading : boolean = false;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public api: Api,
    private translate : TranslateService,
    public util: UtilService) {
  }

  ngOnInit(){

    this.translate.get(['SEARCH_PLACEHOLDER']).subscribe(values => {

      this.searchPlaceholder = values['SEARCH_PLACEHOLDER'];

    });

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SearchPage');
  }

  public searchClear(event){

    this.hasRun = false;

  }

  public searchChanged(event) {

    let userSearch = this.searchTerm;

    if (userSearch.length == 0){
      this.hasRun = false;
      this.noResults = false;
      this.tmpSearchlist.length = 0;
    }

    if (userSearch.length >= 3){
      this.isLoading = true;

      this.api.getUser(userSearch).subscribe(
        (data : any) => {

          try{

            let outData = data.map(function(item){
              let friend = new User(item);
              return friend;
    
            }); 

            this.tmpSearchlist = outData;

            this.hasRun = true;

            if (data.length == 0){
              this.noResults = true;
            }

            this.isLoading = false;

            
          }
          catch(err){
            console.log(err);
            this.isLoading = false;
            return null;
          } 
  
        },
        error => {
          this.isLoading = false;
          this.api.handleAPIError(error);
        }
      )
    }

  }

}
