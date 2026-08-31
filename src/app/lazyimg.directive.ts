import { Attribute, Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({ selector: '[appImgLazy]' })
export class LazyImgDirective {
  constructor(
    @Attribute('loader') public loader: string,
    @Attribute('onErrorSrc') public onErrorSrc: string,
    private renderer: Renderer2,
    private el: ElementRef,
    { nativeElement }: ElementRef<HTMLImageElement>) {
    const supports = 'loading' in HTMLImageElement.prototype;
    
    if (supports) {
      //console.log('Lazyloading supported!')
      nativeElement.setAttribute('loading', 'lazy');
      
    }
    else
    {
      console.log('Lazyloading Not supported!')
    }    
  }
  /*
  @HostListener('load') onLoad() {
    this.renderer.setAttribute(this.el.nativeElement, 'src', this.el.nativeElement.src);
  }
  @HostListener('error') onError() {
    this.renderer.setAttribute(this.el.nativeElement, 'src', this.onErrorSrc);
  }
  */
}