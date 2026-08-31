import { PlatformLocation } from '@angular/common';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../cart.service';
import { Utils } from '../utils';
import { contactInfo } from '../contact-info';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent implements OnInit, AfterViewInit {
  items = [];
  itemsCnt;
  theme;
  //contactInfoFiltered = contactInfo;
  private contactInfoFiltered = JSON.parse(JSON.stringify(contactInfo))

  constructor(
    //private logger: LoggerService,
    private cartService: CartService,
    private router: Router,
    private utils: Utils,
    location: PlatformLocation,
  ) { 
    location.onPopState(() => {
      ;//console.log('pressed back!');
    });
  }

  ngOnInit() {    
    //console.log('before cnt: ' + this.contactInfoFiltered[0].location.length);
    this.contactInfoFiltered[0].location = this.contactInfoFiltered[0].location.filter((ele) => {
      return ele.contactType != 'Address' && ele.contactType != 'Fax Number';
    })
    //console.log('after cnt: ' + this.contactInfoFiltered[0].location.length);
  }

  ngAfterViewInit(): void {    
    //console.log('ngAfterViewInit()');
    if(this.utils.getFromStorageWithExpiry('theme') != null) {
      //load from local storage
      this.theme = this.utils.getFromStorageWithExpiry('theme');
      //console.log('Theme loaded from localstorage: ' + this.theme);
      document.body.className = this.theme;
    }
    else{
      //Set default Theme
      this.theme = 'blueTheme';
      //console.log('Default theme loaded: ' + this.theme);
      document.body.className = this.theme;
    }
  }
  
  ngDoCheck(){
    this.itemsCnt = this.cartService.getItemsCount();    
  }
  
  goToUrl(url) {
    this.router.navigateByUrl('/', { skipLocationChange: false });    
    
    setTimeout(() => {
      //location.reload();
      window.dispatchEvent(new CustomEvent('ngRunSlick'));
    });    
  }  

  switchTheme(event) {
    var target = event.target || event.srcElement || event.currentTarget;
    this.theme = target.className;    
    //ttl: 360,000 => 1hr
    this.utils.setToStorageWithExpiry('theme', this.theme, 360000);
    //onsole.log('Theme saved to localstorage: ' + this.theme);
    document.body.className = this.theme;
  }
}
