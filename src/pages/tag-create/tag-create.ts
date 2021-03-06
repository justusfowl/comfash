import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicPage, NavController, ViewController, NavParams, LoadingController } from 'ionic-angular';

import { Api } from '../../providers/providers';
import { PurchaseTag } from '../../models/datamodel';

@IonicPage()
@Component({
  selector: 'page-tag-create',
  templateUrl: 'tag-create.html'
})
export class TagCreatePage {

  isReadyToSave: boolean;

  purchaseTagForm: FormGroup;

  previewItem : any;

  hasResolved : boolean = false;

  myCoords : any;

  canDelete : boolean = false;

  constructor(
    params: NavParams,
    public navCtrl: NavController, 
    public viewCtrl: ViewController, 
    formBuilder: FormBuilder,
    public api: Api, 
    private loadingCtrl : LoadingController) {

    let coords = params.get('coords');
    let tag = params.get('tag');

    if (coords){
      this.myCoords = coords;


      this.purchaseTagForm = formBuilder.group({
        tagTitle : ['', Validators.required],
        tagUrl: ['', Validators.required],
        tagImage: ['', Validators.required],
        tagSeller: ['', Validators.required],
        tagBrand: [''],
      });

    }else if (tag){

      this.hasResolved = true;
      this.isReadyToSave = true;

      this.previewItem = tag;

      this.canDelete = true;

      this.purchaseTagForm = formBuilder.group({
        tagTitle : [tag.tagTitle, Validators.required],
        tagUrl: [tag.tagUrl, Validators.required],
        tagImage: [tag.tagImage, Validators.required],
        tagSeller: [tag.tagSeller, Validators.required],
        tagBrand: [tag.tagBrand],
      });
      this.myCoords = {
        xRatio : tag.xRatio, 
        yRatio : tag.yRatio
      };

    }


    // Watch the form for changes, and
    this.purchaseTagForm.valueChanges.subscribe((v) => {
      this.previewTag(this.purchaseTagForm.value);
      this.isReadyToSave = this.purchaseTagForm.valid;
    });
  }

  ionViewDidLoad() {

  }

  resolveUrl(){

    let targetUrl = this.purchaseTagForm.value.tagUrl;

    if (targetUrl != null && targetUrl != ""){

      let loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
    
      loading.present();

      this.api.resolveUrl(targetUrl).subscribe(
        (data : any) => {
            this.purchaseTagForm.patchValue({"tagTitle" : data.title});
            this.purchaseTagForm.patchValue({"tagImage" : data.image});
            this.purchaseTagForm.patchValue({"tagSeller" : data.seller});
            this.hasResolved = true;

            loading.dismiss();
        },
        error => {
          this.api.handleAPIError(error);
        }
      )

    }


  }

  previewTag(values){
    this.previewItem = values;
  }

  /**
   * The user cancelled, so we dismiss without sending data back.
   */
  cancel() {
    this.viewCtrl.dismiss();
  }

  /**
   * The user is done and wants to create the item, so return it
   * back to the presenter.
   */
  done() {
    if (!this.purchaseTagForm.valid) { return; }
    let tag = new PurchaseTag(this.purchaseTagForm.value);

    tag.xRatio = this.myCoords.xRatio;
    tag.yRatio = this.myCoords.yRatio;

    this.viewCtrl.dismiss(tag);
  }

  remove(){
    let response = {
      delete : true
    };

    this.viewCtrl.dismiss(response);
  }
}
