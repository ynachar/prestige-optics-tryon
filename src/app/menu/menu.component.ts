import { AfterViewInit, Component, ElementRef, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";

import { menuItems } from "../menu-items";
import {
  AppLang,
  persistLang,
  resolveStoredLang,
  SUPPORTED_LANGS,
} from "../language";

@Component({
  standalone: false,
  selector: "app-menu",
  templateUrl: "./menu.component.html",
  styleUrls: ["./menu.component.css"]
})
export class MenuComponent implements OnInit, AfterViewInit {
  menuItems = menuItems;
  langs = [...SUPPORTED_LANGS];
  selectedLang: AppLang = resolveStoredLang();
  keyword = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public translateService: TranslateService,
    private elementRef: ElementRef
  ) {}
  
  ngAfterViewInit(): void {
    this.SetProductTabActive(false);    
  }

  ngOnInit() {
    this.selectedLang = resolveStoredLang();
    this.translateService.use(this.selectedLang);

    window.onclick = e => {
      this.setActiveTab(e.target);
    };

    if(document.body.clientWidth < 688) {    
      var searchBox = document.getElementById("searchBox");
  
      if(searchBox != null) {
        if(window.location.href.indexOf('product-list') < 0){
          console.log('ngOnInit() - searchBoxExpanded removed.');
        }
      }
    }
  }

  switchLang(lang: string) {
    const nextLang = persistLang(lang);
    this.selectedLang = nextLang;
    this.translateService.use(nextLang).subscribe({
      next: () => location.reload(),
      error: () => location.reload(),
    });
  }

  goToUrl(url: string | string[]) {
    const path = Array.isArray(url) ? url[0] : url;
    this.router.navigateByUrl(path);
    this.SetProductTabActive(true);
  }

  SetProductTabActive(autoSet) {
    if(autoSet || window.location.href.indexOf('keyword') > -1) {
      var menuItems = document.getElementsByClassName("menuItem");

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
    var menuItems = document.getElementsByClassName("menuItem");
    var homePageMenuItem = '';
    var productPageMenuItem = '';
    var promoPageMenuItem = '';

    if ((item != "undefined" && item.classList.contains("menuItem")) || item == "[object HTMLHeadingElement]") {
      for (var i = 0; i < menuItems.length; i++) {
        if(i == 0)
          homePageMenuItem = menuItems[i].textContent.toLowerCase().trim();

        if(i == 1)
          productPageMenuItem = menuItems[i].textContent.toLowerCase().trim().split(' ')[0];

        if(i == 2)
          promoPageMenuItem = menuItems[i].textContent.toLowerCase().trim().split(' ')[0];        
        
        menuItems[i].classList.remove("active");
      }      

      if (item != undefined) {
        item.classList.add("active");

        if(window.location.href.indexOf('product-list') > 0) {
          var searchTextBox = document.getElementById("searchTextBox");
      
          if(searchTextBox != null)
            searchTextBox.classList.add('showSearchTextBox');
        }        
        else{
          var searchTextBox = document.getElementById("searchTextBox");
      
          if(searchTextBox != null)
            searchTextBox.classList.remove('showSearchTextBox');
        }
        
        if(item.innerHTML.trim().toLowerCase().startsWith(homePageMenuItem)) {
          window.dispatchEvent(new CustomEvent('ngRunSlick'));
        }
      } 
      else {
        menuItems[0].classList.add("active");
        console.log(menuItems[0].innerHTML + ' added - default.');        
      }
    }

    if(window.location.pathname.toLowerCase().includes('/product-list')) {
      window.dispatchEvent(new CustomEvent('ngRunMultiSelect'));
    }    
  }

  toggleMenu() {
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
      this.goToUrl('/product-list/keyword/' + searchTextBox.value.trim());
    }    
  }
}
