import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { CommentCreatePage } from './comment-create';

@NgModule({
  declarations: [
    CommentCreatePage,
  ],
  imports: [
    IonicPageModule.forChild(CommentCreatePage),
    TranslateModule.forChild()
  ],
  exports: [
    CommentCreatePage
  ]
})
export class CommentCreatePageModule { }
