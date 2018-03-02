import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { CollectionCreatePage } from './collection-create';

@NgModule({
  declarations: [
    CollectionCreatePage,
  ],
  imports: [
    IonicPageModule.forChild(CollectionCreatePage),
    TranslateModule.forChild()
  ],
  exports: [
    CollectionCreatePage
  ]
})
export class CollectionCreatePageModule { }
