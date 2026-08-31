import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from "@angular/common";
import { banners } from '../banners';
import { brands } from '../brands';
import { products } from '../products';
import { slogans } from '../slogans';
import { TranslateService } from '@ngx-translate/core';

@Component({
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
    var primaryImg = "https://secure.i.telegraph.co.uk/multimedia/archive/03249/archetypal-male-fa_3249635c.jpg";
    var otherImg = "";
    this.imgSwitchInterval = setInterval(function() {
      var modelImg = document.getElementById('modelImg');
      otherImg = modelImg.src;
      
      modelImg.classList.add("fade-out");
      modelImg.classList.remove("fade-in");                 

      this.tryOnTimer = setTimeout(() => {
          modelImg.src = primaryImg;
          
          modelImg.classList.remove("fade-out");
          modelImg.classList.add("fade-in");

          primaryImg = otherImg;          
        },
        750
      );     

    }, 23500);
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