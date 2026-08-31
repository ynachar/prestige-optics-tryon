import { AfterViewInit, Component, ElementRef, EventEmitter,  OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";

import { menuItems } from "../menu-items";

@Component({
  selector: "app-menu",
  templateUrl: "./menu.component.html",
  styleUrls: ["./menu.component.css"]
})
export class MenuComponent implements OnInit, AfterViewInit {
  menuItems = menuItems;
  langs = ['en', 'fr'];
  defaultLang = 'fr';
  browserlang = '';
  keyword = '';
  
  @ViewChild("langSelection") langSelec: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private translateService: TranslateService,
    private elementRef: ElementRef
  ) {
    translateService.addLangs(this.langs);
    translateService.setDefaultLang(this.defaultLang);
  }
  
  ngAfterViewInit(): void {
    if(localStorage.getItem('lang') != null) {
      //console.log('browserlang: '  + this.browserlang);
      
      var lanSelectionEle = this.langSelec.nativeElement;      
      
      if(lanSelectionEle != null) {
        //console.log('lanSelectionEle.value before: '  + lanSelectionEle.value);
        lanSelectionEle.value = this.browserlang;
        //console.log('lanSelectionEle.value after: '  + lanSelectionEle.value);
      }
    }
    else {
      this.browserlang = this.translateService.getBrowserLang();
    }

    //console.log('ngAfterViewInit...');
    this.SetProductTabActive(false);    
  }

  ngOnInit() {
    window.onclick = e => {
      this.setActiveTab(e.target);
      //console.log('path: ' + e.target);      
    };
    
    this.browserlang = localStorage.getItem('lang');

    //console.log('start: browserlang: ' + this.browserlang);
    if (this.langs.indexOf(this.browserlang) > -1)
      this.translateService.setDefaultLang(this.browserlang);
    else 
      this.translateService.setDefaultLang('en');   
    //console.log('end: browserlang: ' + this.browserlang);

    var searchBox = document.getElementById("searchBox");
  
    if(document.body.clientWidth < 688) {    
      var searchBox = document.getElementById("searchBox");
  
      if(searchBox != null) {
        if(window.location.href.indexOf('product-list') < 0){
          //searchBox.classList.remove('searchBoxExpanded'); 
          console.log('ngOnInit() - searchBoxExpanded removed.');
        }
      }
    }
  }

  switchLang(lang: string) {
    //console.log('switchLang - lan: ' + lang);
    this.translateService.use(lang);
    localStorage.setItem('lang', lang);
    location.reload(true);
  }

  goToUrl(url) {
    this.router.navigateByUrl(url, { skipLocationChange: false });
    setTimeout(() => this.router.navigate(url));

    this.SetProductTabActive(true);
  }

  SetProductTabActive(autoSet) {
    //console.log(window.location.href + '|' + (this.router.url.indexOf('keyword') > -1));
    
    if(autoSet || window.location.href.indexOf('keyword') > -1) {
      var menuItems = document.getElementsByClassName("menuItem");
      var homePageMenuItem = '';

      for (var i = 0; i < menuItems.length; i++) 
        menuItems[i].classList.remove("active");
      
      if (menuItems!= null && menuItems.length > 2) {
        menuItems[1].classList.add("active");      
      }
    }
  }

  //Fixed 12/15/2020
  //Added home menu variable to handle multi linguale home page check
  setActiveTab(item) {
    //console.log('item: ' + item);
    var menuItems = document.getElementsByClassName("menuItem");
    var homePageMenuItem = '';
    var productPageMenuItem = '';
    var promoPageMenuItem = '';

    //console.log('Found...: ' + window.location.pathname);

    if ((item != "undefined" && item.classList.contains("menuItem")) || item == "[object HTMLHeadingElement]") {
      for (var i = 0; i < menuItems.length; i++) {
        if(i == 0)
          homePageMenuItem = menuItems[i].textContent.toLowerCase().trim();

        if(i == 1)
          productPageMenuItem = menuItems[i].textContent.toLowerCase().trim().split(' ')[0];

        if(i == 2)
          promoPageMenuItem = menuItems[i].textContent.toLowerCase().trim().split(' ')[0];        
        
        menuItems[i].classList.remove("active");
        //console.log(menuItems[i].innerHTML + ' removed.');
      }      

      //console.log('item: ' + item.innerHTML.trimStart());
      if (item != undefined) {
        item.classList.add("active");
        //console.log('item: ' + item.innerHTML.trimStart());

        //if(item.innerHTML.trimStart().startsWith('Pro')){
        if(window.location.href.indexOf('product-list') > 0) {
          //console.log('Found...: ' + window.location);

          var searchTextBox = document.getElementById("searchTextBox");
      
          if(searchTextBox != null)
            searchTextBox.classList.add('showSearchTextBox');
        }        
        else{
          var searchTextBox = document.getElementById("searchTextBox");
      
          if(searchTextBox != null)
            searchTextBox.classList.remove('showSearchTextBox');
        }
        
        //console.log(item.innerHTML + ' added.');
        //console.log('homePageMenuItem before: ' + homePageMenuItem);
        if(item.innerHTML.trim().toLowerCase().startsWith(homePageMenuItem)) {
          //console.log('homePageMenuItem inside: ' + homePageMenuItem + '|' + item.innerHTML.trim().toLowerCase());
          //console.log('Reloading...');
          window.dispatchEvent(new CustomEvent('ngRunSlick'));
        }

        //console.log('outside: ' + productPageMenuItem + '|' + item.innerHTML.trim().toLowerCase());        
        /*
        if(item.innerHTML.trim().toLowerCase().startsWith(productPageMenuItem) || item.innerHTML.trim().toLowerCase().startsWith(promoPageMenuItem)) {
          //console.log('Reloading...');
          window.dispatchEvent(new CustomEvent('ngRunMultiSelect'));
        }
        */
      } 
      else {
        menuItems[0].classList.add("active");
        console.log(menuItems[0].innerHTML + ' added - default.');        
      }
    }

    if(window.location.pathname.toLowerCase().includes('/product-list')) {
      //console.log(window.location.pathname);
      window.dispatchEvent(new CustomEvent('ngRunMultiSelect'));
    }    
  }

  toggleMenu() {
    //console.log('toggleMenu()...');
    //console.log(document.body.clientWidth);
    let htmlWidth = document.body.clientWidth;
    
    if(document.body.clientWidth < 688) {    
      var menuCont = document.getElementById("menuContainer");

      if (menuCont.style.visibility == "visible")
        menuCont.style.visibility = "collapse";
      else
        menuCont.style.visibility = "visible";      

       var searchBox = document.getElementById("searchBox");
  
      if(searchBox != null) {
        if(window.location.href.indexOf('product-list') < 0){
          searchBox.classList.remove('searchBoxExpanded'); 
          console.log('ngOnInit() - searchBoxExpanded removed.');
        }
      }
    }
  }

  searchIconClick() {
    var searchTextBox = document.getElementById("searchTextBox");
    
    if(searchTextBox != null)
      searchTextBox.classList.add('showSearchTextBox');
    
    if(document.body.clientWidth < 688) {    
      var searchBox = document.getElementById("searchBox");
  
      if(searchBox != null) {
        searchBox.classList.add('searchBoxExpanded'); 
        console.log('searchIconClick() - searchBoxExpanded added.');
      }
    }
    
    if(searchTextBox.classList.contains("showSearchTextBox") && searchTextBox.value.length > 0) {
      //console.log('text: ' + searchTextBox.value);

      this.goToUrl('/product-list/keyword/' + searchTextBox.value.trim());
    }    
  }
}
