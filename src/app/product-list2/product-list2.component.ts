import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { CrudService } from '../crud.service';
import { Product } from '../product';
import { Utils } from '../utils';

//import { products } from '../products';

@Component({
  standalone: false,
  selector: 'app-product-list',
  templateUrl: './product-list2.component.html',
  styleUrls: ['./product-list2.component.css']
})
export class ProductList2Component implements OnInit, AfterViewInit {
  //products: Product[] = [];
  products;
  //products;
  subTitle: string = '';
  prodType: string;
  promo: string;
  keyword: string;
  isTitleLinkEnabled: boolean;
  slideIndex = 1;

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private crudService: CrudService,
    private utils: Utils,
  ){
    // override the route reuse strategy
    //console.log('this.router.url: ' + this.router.url);
    this.router.routeReuseStrategy.shouldReuseRoute = function(){
      return false;
    }    
  }

  ngOnInit() {
    //console.log('ngOnInit() start');       
    //this.products = products;
    /***********
     * CRUD SERVICE CALL
     **********/
    
    if(this.utils.getFromStorageWithExpiry('products') == null) {
      //this.crudService.getAll().subscribe((data: Product[])=>{
      this.crudService.getAll().subscribe((data)=>{
        //console.log('crudService: ' + data);
        this.products = data;

        const prods = {
          value: data,
          expiry: Date.now() + 10000,
          //24hrs - 86400000 ms
        }
        console.log('products saved to localstorage...');
        this.utils.setToStorageWithExpiry('products', prods, 60000);        
      });
    }
    else{
      //load from local storage
      console.log('products loaded from localstorage...');
      this.products = this.utils.getFromStorageWithExpiry('products').value;
    }    

    this.fetchData();
  }

  ngAfterViewInit(): void {
    for(var i=0 ; i<this.products.length; i++) {
      this.showSlides(this.slideIndex, this.products[i].id);
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

  mouseOver(prodId){
    var prev = document.getElementById("prev_" + prodId);
    var next = document.getElementById("next_" + prodId);
    //console.log("prev: " + prev.style.visibility);

    if (prev != null && prev.style.visibility == 'visible') {
      prev.classList.add("prevnexthover");
      next.classList.add("prevnexthover");    
    }
  }

  mouseLeave(prodId){
    var prev = document.getElementById("prev_" + prodId);
    var next = document.getElementById("next_" + prodId);
    
    if (prev != null && prev.style.visibility == 'visible') {
      prev.classList.remove("prevnexthover");
      next.classList.remove("prevnexthover");
    }    
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

      this.products = this.products.filter(ele => {
        //Search in name, etail and description
        return ele.name.toLowerCase().includes(this.keyword) || 
              ele.detail.toLowerCase().includes(this.keyword) || 
              ele.description.toLowerCase().includes(this.keyword);
      });
      //console.log('after len: ' + this.products.length + '|' + products.length);
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
      this.products = this.products.filter(ele => {
        if(ele.promo != null)
          ele.type += " C";
        
        //return ele.type.includes(this.prodType)
      });
      //console.log('after len: ' + this.products.length + '|' + products.length);      
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
    
      //console.log('before len: ' + this.products.length + '|' + products.length);
      this.products = this.products.filter(ele => {
        if(ele.promo != null)
          ele.type += " C";
        
        return ele.type.includes(this.prodType)
      });
      //console.log('after len: ' + this.products.length + '|' + products.length);      
    }    

    if(this.promo != null) {   
      //console.log('before len: ' + this.products.length + '|' + products.length);
      
      if(this.promo == 'all')
        this.products = this.products.filter(ele => ele.promo != undefined);
      else
        this.products = this.products.filter(ele => ele.promo == this.promo);

      //Sort by largest percent off sale
      this.products.sort((a:any, b:any) => {
        return b.promo - a.promo;
      });

      //console.log('after len: ' + this.products.length + '|' + products.length);      
    }
  }
  
}