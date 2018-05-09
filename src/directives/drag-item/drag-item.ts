import { Directive, Input, ElementRef, Renderer, HostListener } from '@angular/core';
import { DomController } from 'ionic-angular';
 
@Directive({
  selector: '[drag-item]'
})
export class DragItemDirective {
 
    startLeft: any;
    startTop: any;

    origLeft: any; 
    origTop: any;
 
    constructor(public element: ElementRef, public renderer: Renderer, public domCtrl: DomController) {
 
    }

    @HostListener('touchstart', ['$event']) touchstart(event){
      console.log("touchstart for event:", event)
      let itemPos = event.target.getClientRects()[0];
      this.startLeft = itemPos.left;
      this.startTop = itemPos.top;
      this.element.nativeElement.classList.toggle("dragged");
    }

    @HostListener('touchend', ['$event']) touchend(event){
      console.log("touchend for event:", event);
      this.element.nativeElement.classList.toggle("dragged");
      let self = this;
      setTimeout(self.resetOrigDefauts.bind(self), 300);
      
    }
 
    ngAfterViewInit() {

        let itemPos = this.element.nativeElement.getClientRects()[0];
        this.origLeft = itemPos.left;
        this.origTop = itemPos.top;

        this.resetOrigDefauts();
 
        let hammer = new window['Hammer'](this.element.nativeElement);
        hammer.get('pan').set({ direction: window['Hammer'].DIRECTION_ALL });
 
        hammer.on('pan', (ev) => {
          this.handlePan(ev);
        });
 
    }

    resetOrigDefauts(){
      this.startLeft = this.origLeft; 
      this.startTop = this.origTop; 


      this.element.nativeElement.style.removeProperty("top");
      this.element.nativeElement.style.removeProperty("left");
    }
 
  handlePan(ev){

      let newLeft = ev.center.x;
      let newTop = ev.center.y;

      this.domCtrl.write(() => {
          this.renderer.setElementStyle(this.element.nativeElement, 'left', newLeft + 'px');
          this.renderer.setElementStyle(this.element.nativeElement, 'top', newTop + 'px');
      });

  }

}