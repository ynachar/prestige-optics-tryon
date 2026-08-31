import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { CrudService } from '../crud.service';
import { products } from '../products';
import { brands } from '../brands';
import { menuItems } from "../menu-items";
import { CountdownConfig } from 'ngx-countdown';

@Component({
  standalone: false,
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, AfterViewInit {
  brands;
  filterBrands = [];
  filterShapes = ['Oval', 'Rectangle', 'Round', 'Square'];
  products;
  private baseProducts = [];
  subTitle: string = '';
  prodType: string;
  promo: string;
  keyword: string;
  brand: string = '';
  menuItems = menuItems;
  isTitleLinkEnabled: boolean;
  slideIndex = 1;
  gender: any;
  isGenderLockedFromUrl = false;
  urlGenderValues: string[] = [];
  todayDate: Date;
  pageBanner;

  prettyConfig: CountdownConfig = {
    leftTime: 60,
    format: 'HH-mm-ss',
    prettyText: (text) => {
      return text
        .split(':')
        .map((v) => `<span>${v}</span>`)
        .join('');
    },
  };

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private crudService: CrudService,
  ){
    // override the route reuse strategy
    //console.log('this.router.url: ' + this.router.url);
    this.router.routeReuseStrategy.shouldReuseRoute = function(){
      return false;
    }    
  }

  ngOnInit() {
    //console.log('ngOnInit() start');
    this.brands = brands;
    this.filterBrands = [...brands]
      .filter((brand) => brand?.name)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    this.filterShapes = [...this.filterShapes].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' }),
    );
    this.products = products;
    this.todayDate = new Date();
    
    this.products.forEach((ele) => {
      if(ele.promoExpiryDate != '') {
        //ele.promoExpiryDateInSeconds
        var secondBetweenTwoDate = Math.abs((new Date(ele.promoExpiryDate).getTime() - new Date().getTime()) / 1000);
        console.log('dates: ' + new Date() + '|' + new Date(ele.promoExpiryDate));
        console.log('secondBetweenTwoDate: ' + new Date().getTime() + '|' + new Date(ele.promoExpiryDate).getTime());
        ele.promoExpiryDateInSeconds = secondBetweenTwoDate;
      }
    })

    this.fetchData();
    this.baseProducts = [...this.products];
    this.filterBrands = [...this.brands]
      .filter((brand) => brand?.name)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

    this.menuItems.forEach((menu) => {
      //this.pageBanner = menu.subItems[0].banner;
      this.pageBanner = menu.banner;
      //console.log('banner init Link: ' + menu.banner);
      //console.log('banner sub Link: ' + menu.subItems[0].banner);
    });
  }

  ngAfterViewInit(): void {
    this.prepopulateFiltersFromRoute();
    this.refreshSlides();
  }

  applyFilters() {
    const genders = this.getSelectedValues('genderSelect');
    const selectedBrands = this.getSelectedValues('brandSelect');
    const shapes = this.getSelectedValues('shapeSelect');

    this.products = this.baseProducts.filter((product) => {
      if (genders.length > 0 && !this.matchesGender(product, genders)) {
        return false;
      }
      if (selectedBrands.length > 0 && !this.matchesBrand(product, selectedBrands)) {
        return false;
      }
      if (shapes.length > 0 && !this.matchesShape(product, shapes)) {
        return false;
      }
      return true;
    });

    setTimeout(() => this.refreshSlides());
  }

  toggleFilterOption(event: MouseEvent) {
    const option = event.target as HTMLOptionElement;
    if (!option || option.tagName !== 'OPTION') return;

    const select = option.parentElement as HTMLSelectElement | null;
    if (
      select?.id === 'genderSelect' &&
      this.isGenderLockedFromUrl
    ) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    option.selected = !option.selected;
    this.applyFilters();
  }

  isUrlGenderSelected(value: string): boolean {
    return this.urlGenderValues.includes(String(value).toUpperCase());
  }

  private prepopulateFiltersFromRoute() {
    const routeGender =
      this.route.snapshot.paramMap.get('gender') ||
      this.route.snapshot.params.gender ||
      this.gender;

    if (routeGender) {
      this.urlGenderValues = String(routeGender)
        .split(',')
        .map((value) => value.trim().toUpperCase())
        .filter(Boolean);

      // Select first so the option paints as chosen, then lock.
      this.isGenderLockedFromUrl = false;
      this.setSelectedValues('genderSelect', this.urlGenderValues);
      this.isGenderLockedFromUrl = true;
    } else {
      this.urlGenderValues = [];
      this.isGenderLockedFromUrl = false;
    }

    const routeBrand =
      this.route.snapshot.paramMap.get('brand') ||
      this.route.snapshot.params.brand ||
      this.brand;

    if (routeBrand) {
      this.setSelectedValues('brandSelect', [String(routeBrand)]);
    }
  }

  private setSelectedValues(selectId: string, values: string[]) {
    const select = document.getElementById(selectId) as HTMLSelectElement | null;
    if (!select || !values?.length) return;

    const normalized = values.map((value) => value.toLowerCase());
    Array.from(select.options).forEach((option) => {
      option.selected = normalized.some(
        (value) =>
          option.value.toLowerCase() === value ||
          option.value.toLowerCase().includes(value) ||
          value.includes(option.value.toLowerCase()),
      );
    });
  }

  private getSelectedValues(selectId: string): string[] {
    const select = document.getElementById(selectId) as HTMLSelectElement | null;
    if (!select) return [];
    return Array.from(select.selectedOptions).map((option) => option.value);
  }

  private matchesGender(product, genders: string[]): boolean {
    if (!product?.specs) return false;
    return product.specs.some(
      (spec) =>
        spec.name?.toLowerCase() === 'gender' &&
        genders.some((gender) => String(spec.value || '').includes(gender)),
    );
  }

  private matchesBrand(product, selectedBrands: string[]): boolean {
    const brand = String(product?.brand || '').toLowerCase();
    if (!brand) return false;
    return selectedBrands.some((selected) => brand.includes(selected.toLowerCase()));
  }

  private matchesShape(product, shapes: string[]): boolean {
    if (!product?.specs) return false;
    return product.specs.some((spec) => {
      if (spec.name?.toLowerCase() !== 'shape') return false;
      const value = String(spec.value || '').toLowerCase();
      return shapes.some((shape) => value === shape.toLowerCase());
    });
  }

  private refreshSlides() {
    for (var i = 0; i < this.products.length; i++) {
      this.showSlides(1, this.products[i].id);
    }
  }

  plusSlides(n, prodId) {
    this.showSlides(this.slideIndex += n, prodId);
  }

  currentSlide(n, prodId) {
    this.showSlides(this.slideIndex = n, prodId);
  }

  showSlides(n, prodId) {
    var imgBox = document.getElementById("imgBox_" + prodId);

    if(imgBox != null) {      
      var i;
      var slides = imgBox.getElementsByClassName("mySlides");
      var dots = imgBox.getElementsByClassName("dot");
      
      //console.log(prodId + '|slides: ' + slides);

      if (n > slides.length) 
        this.slideIndex = 1;
      
      if (n < 1) 
        this.slideIndex = slides.length;
      
      //console.log('slides.length: ' + slides.length);
      //console.log('slides: ' + slides);

      if(slides != null) {
        //console.log('slides not null...');

        for (i = 0; i < slides.length; i++) 
          slides[i].style.display = "none";  
        
        for (i = 0; i < dots.length; i++) 
          dots[i].className = dots[i].className.replace(" active", "");

        slides[this.slideIndex-1].style.display = "block";  
        
        var prev = imgBox.getElementsByClassName("prev");
        var next = imgBox.getElementsByClassName("next");

        if(slides.length < 2) {
          dots[this.slideIndex-1].style.visibility = 'hidden';              

          prev[0].style.visibility = 'hidden';
          next[0].style.visibility = 'hidden';
        }

        dots[this.slideIndex-1].className += " active";
      }  
    }
  }

  mouseOver(prodId) {
    var prev = document.getElementById("prev_" + prodId);
    var next = document.getElementById("next_" + prodId);
    //console.log("prev: " + prev.style.visibility);

    if (prev != null && prev.style.visibility == 'visible') {
      prev.classList.add("prevnexthover");
      next.classList.add("prevnexthover");    
    }
  }

  mouseLeave(prodId) {
    var prev = document.getElementById("prev_" + prodId);
    var next = document.getElementById("next_" + prodId);
    
    if (prev != null && prev.style.visibility == 'visible') {
      prev.classList.remove("prevnexthover");
      next.classList.remove("prevnexthover");
    }    
  }

  ApplyFilter(_filter) {
    this.applyFilters();
  }

  fetchData() {
    /****************
     * SEARCH
     ***************/
    this.keyword = this.route.snapshot.params.keyword;
    //console.log('keyword route 1: ' + this.keyword);
  
    this.route.paramMap.subscribe(params => {
      this.router.navigated = false;
      this.keyword = params.get('keyword');
      //console.log('keyword route 2: ' + this.keyword);
    });

    if(this.keyword != null && this.keyword.length > 0) {
      //console.log('before len: ' + this.products.length + '|' + products.length);

      //Prepare keyword by making it all lower case
      this.keyword = this.keyword.toLowerCase();

      this.products = products.filter(ele => {
        //Search in name, detail and description
        return ele.name.toLowerCase().includes(this.keyword) || 
              ele.detail.toLowerCase().includes(this.keyword) || 
              ele.description.toLowerCase().includes(this.keyword);
      });
      //console.log('after len: ' + this.products.length + '|' + products.length);
    }

    /****************
     * BRAND
     ***************/
    this.brand = this.route.snapshot.params.brand;
    //console.log('brand route 1: ' + this.brand);
  
    this.route.paramMap.subscribe(params => {
      this.router.navigated = false;
      this.brand = params.get('brand');
      //console.log('brand route 2: ' + this.brand);
    });

    if(this.brand != null && this.brand.length > 0) {
      //console.log('before len: ' + this.products.length + '|' + products.length);

      //Prepare brand by making it all lower case
      this.brand = this.brand.toLowerCase();

      this.products = products.filter(ele => {
        //Search by brand
        return ele.brand.toLowerCase().includes(this.brand);
      });
      //console.log('after len: ' + this.products.length + '|' + products.length);

      //Filter brands object
      this.brands = brands.filter(ele => {
        //Filter brands
        return ele.name.toLowerCase().includes(this.brand);
      });
      //console.log('brand filtered length: ' + this.brands.length + '|' + brands.length + '|' + this.brands[0].name);

      //Remove brands filter when brand specefic products are shown
      var brandsFilterBox = document.getElementById("brandsFilterBox");

      if(brandsFilterBox != null && this.brands.length <= 1) {
        brandsFilterBox.remove();
      }
    }

    /****************
     * PROMO
     ***************/
    this.promo = this.route.snapshot.params.promo;
    //console.log('promo route 1: ' + this.promo);
  
    this.route.paramMap.subscribe(params => {
      this.router.navigated = false;
      this.promo = params.get('promo');
      //console.log('promo route 2: ' + this.promo);
    });

    if( this.promo != null) {
      //console.log('before len: ' + this.products.length + '|' + products.length);
      this.products = products.filter(ele => {
        if(ele.promo != null)
          ele.type += " C";
        
        //return ele.type.includes(this.prodType)
      });
      //console.log('after len: ' + this.products.length + '|' + products.length);      
    }

    /****************
     * MENU ITEMS
     ***************/
    //console.log('this.router.url: ' + this.router.url);
    var currentPath = this.router.url;
    if( currentPath != null) {
      //console.log('before len: ' + this.menuItems.length + '|' + menuItems.length);
      this.menuItems = menuItems.filter(ele => {
        return ele.link == currentPath;        
      });
      //console.log('after len: ' + this.menuItems.length + '|' + menuItems.length);
    }
    
    /****************
     * PROD TYPE
     ***************/
    this.prodType = this.route.snapshot.params.type;
    //console.log('prodType route 1: ' + this.prodType);   

    this.route.paramMap.subscribe(params => {
      this.router.navigated = false;
      this.prodType = params.get('type');
      //console.log('prodType route 2: ' + this.prodType);
    });
    
    if(this.promo != null && (this.prodType == undefined || this.prodType == null)) {
      this.prodType = 'C';
      //console.log('prodType: ' + this.prodType);
    }

    if(this.prodType != null) {
      this.subTitle = '';
      //console.log('prodType: ' + this.prodType);
      switch(this.prodType){
        case 'A':
          this.subTitle += 'Accessories';
          this.isTitleLinkEnabled = true;
          break;
        case 'C':
          this.subTitle += 'Clearance';
          this.isTitleLinkEnabled = true;
          break;
        case 'P':
          this.subTitle += 'Eyeglasses';
          this.isTitleLinkEnabled = true;
          break;
        case 'S':
          this.subTitle += 'Sunglasses';
          this.isTitleLinkEnabled = true;
          break;        
        default: 
          this.subTitle = '';
          this.isTitleLinkEnabled = false;
          break;
      }
      //console.log('this.subTitle: ' + this.subTitle);      
    
      //console.log('prods - before len: ' + this.products.length + '|' + products.length);
      this.products = this.products.filter(ele => {
        if(ele.promo != null)
          ele.type += " C";
        
        return ele.type.includes(this.prodType)
      });
      //console.log('prods - after len: ' + this.products.length + '|' + products.length);
    }    

    /****************
     * GENDER
     ***************/
    this.gender = this.route.snapshot.params.gender;
    //console.log('gender route 1: ' + this.gender);
  
    this.route.paramMap.subscribe(params => {
      this.router.navigated = false;
      this.gender = params.get('gender');
      //console.log('gender route 2: ' + this.gender);
    });
    
    if(this.gender != null) {
      //console.log('gender prods - before len: ' + this.products.length + '|' + products.length);
      //console.log('this.gender: ' + this.gender);
      this.products = this.products.filter(ele => { 
        
        if(ele.specs != undefined){
          return ele.specs.some( spec => {
            //console.log(spec.name  + ' | ' + spec.value);
            
            return spec.name.toLowerCase() == 'gender' && spec.value.includes(this.gender);         
          });
        }
        /*
        if(ele.specs != undefined){
          return ele.specs.filter( spec => {
            if(spec.name.toLowerCase() == 'gender' && spec.value != '') {
              console.log('spec.value: ' + spec.value);
              if(spec.value.includes(this.gender)) {
                console.log('=> Gender found: ' + this.gender);
                return true;
              }
            }
          });
        }
        */
      });
      //console.log('gender prods - after len: ' + this.products.length + '|' + products.length);
    }


    if(this.promo != null) {   
      //console.log('promo - before len: ' + this.products.length + '|' + products.length);
      
      if(this.promo == 'all')
        this.products = products.filter(ele => ele.promo != undefined);
      else
        this.products = products.filter(ele => ele.price <= parseInt(this.promo));

      //Sort by largest percent off sale
      this.products.sort((a, b) => {
        return b.promo - a.promo;
      });

      //console.log('promo - after len: ' + this.products.length + '|' + products.length);      
    }
  }

  toggleSearchFiltersBox() {
    var searchFiltersBox = document.getElementById("searchFiltersBox");
    
    if(searchFiltersBox != null) {
      if(searchFiltersBox.classList.contains('expandFilters')) {
        searchFiltersBox.classList.remove("expandFilters");

        var filterIcon = document.getElementById("filterIcon");

        if(filterIcon != null)
          filterIcon.classList.remove("filterIconFlip");
      }
      else {
        searchFiltersBox.classList.add("expandFilters");

        var filterIcon = document.getElementById("filterIcon");

        if(filterIcon != null)
          filterIcon.classList.add("filterIconFlip");
      }
    }
  }
}