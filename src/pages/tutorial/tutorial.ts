import { Component } from '@angular/core';
import { IonicPage, MenuController, NavController, Platform } from 'ionic-angular';

import { TranslateService } from '@ngx-translate/core';
import { AuthService, ConfigService } from '../../providers/providers';

import { MainPage } from '../pages';

export interface Slide {
  title: string;
  description: string;
  image: string;
}

@IonicPage()
@Component({
  selector: 'page-tutorial',
  templateUrl: 'tutorial.html'
})
export class TutorialPage {
  slides: Slide[];
  showSkip = true;
  dir: string = 'ltr';

  constructor(
    public navCtrl: NavController, 
    public menu: MenuController, 
    translate: TranslateService, 
    public config : ConfigService,
    public platform: Platform, 
    public auth : AuthService) {
      this.dir = platform.dir();
      translate.get(["TUTORIAL_SLIDE1_TITLE",
        "TUTORIAL_SLIDE1_DESCRIPTION",
        "TUTORIAL_SLIDE2_TITLE",
        "TUTORIAL_SLIDE2_DESCRIPTION",
        "TUTORIAL_SLIDE3_TITLE",
        "TUTORIAL_SLIDE3_DESCRIPTION",
      ]).subscribe(
        (values) => {
          this.slides = [
            {
              title: values.TUTORIAL_SLIDE1_TITLE,
              description: values.TUTORIAL_SLIDE1_DESCRIPTION,
              image: 'assets/img/step_1_tutorial.png',
            },
            {
              title: values.TUTORIAL_SLIDE2_TITLE,
              description: values.TUTORIAL_SLIDE2_DESCRIPTION,
              image: 'assets/img/step_3_tutorial.png',
            },
            {
              title: values.TUTORIAL_SLIDE3_TITLE,
              description: values.TUTORIAL_SLIDE3_DESCRIPTION,
              image: 'assets/img/step_2_tutorial.png',
            }
          ];
        });
  }

  startApp() {

    this.config.setTutorialViewed();

    this.navCtrl.setRoot(MainPage, {
      userId : this.auth.getUserId()
    },{
      animate: true,
      direction: 'forward'
    });

  }

  onSlideChangeStart(slider) {
    this.showSkip = !slider.isEnd();
  }

  ionViewDidEnter() {
    // the root left menu should be disabled on the tutorial page
    this.menu.enable(false);
  }

  ionViewWillLeave() {
    // enable the root left menu when leaving the tutorial page
    this.menu.enable(true);
  }

}
