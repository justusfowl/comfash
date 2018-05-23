import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NotificationsPage } from './notifications';
import { TranslateModule } from '@ngx-translate/core';
import { LinkUsernameModule } from "../../components/link-username/link-username.module";

@NgModule({
  declarations: [
    NotificationsPage,
  ],
  imports: [
    IonicPageModule.forChild(NotificationsPage),
    TranslateModule.forChild(),
    LinkUsernameModule
  ],
})
export class NotificationsPageModule {}

