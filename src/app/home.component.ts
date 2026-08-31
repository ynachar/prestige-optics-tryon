import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from "@angular/common";
import { banners } from '../banners';
import { brands } from '../brands';
import { products } from '../products';
import { slogans } from '../slogans';
import { TranslateService } from '@ngx-translate/core';
import { fitGlassesOverlay } from '../try-on-fit';

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  banners = banners;
  brands = brands;
  products = products;
  slogans = slogans;
  i = 1;
  route: string;
  location;
  tryOnTimer;
  imgSwitchInterval;

  constructor(
    location: Location, 
    router: Router,
    private translate: TranslateService) {      
    ;
  }

  //12/24/2020 - Fixed single image product hover
  mouseOver(product) {
    var randNum = Math.floor(Math.random() * 3) + 1;
    var prodImg = document.getElementById("prodImg_" + product.id);
    //console.log('randNum: ' + randNum + '|' + prodImg.src);
    if(prodImg !== null && product.img.length > 1)
      prodImg.src = product.img[randNum];
  }

  mouseLeave(product) {
    var prodImg = document.getElementById("prodImg_" + product.id);
    
    if(prodImg !== null)
      prodImg.src = product.img[0];
  }
  
  ngOnInit() {
  }

  ngAfterViewInit(): void {
    window.dispatchEvent(new CustomEvent('ngRunSlick'));
    this.onModelLoad();
  }

  onModelLoad() {
    var photo = document.getElementById('modelImg') as HTMLImageElement;
    var overlay = document.querySelector('.productPreviewBox') as HTMLElement;
    if (photo && overlay) {
      fitGlassesOverlay(photo, overlay);
    }
  }

  ngOnDestroy() {
    //console.log('ngOnDestroy()');
    clearTimeout(this.tryOnTimer);
    clearInterval(this.imgSwitchInterval);
  }
  
  DomParser(slogId, sloganText) {
    let slogDivId = 'slogDiv_' + slogId;
    var div = document.getElementById(slogDivId);
    var slogansLen = slogans.length;
    
    if(div != null && this.i++ <= slogansLen) {
      //console.log('sloganText: ' + sloganText);

      let transText = this.translate.get(sloganText);

      //console.log('=>transText: ' + transText.subscribe(key => console.log('key: ' + key)));

      transText.subscribe(transValue => {
        div.insertAdjacentHTML('beforeend', '<p>❝ ' + transValue + ' ❞</p>');  
      });      
    }
  }  
}