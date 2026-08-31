import { Component, OnInit } from '@angular/core';
import { Injectable } from '@angular/core';
import { CartService } from '../cart.service';

@Injectable({
  providedIn: 'root'
})

@Component({
  standalone: false,
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  items;
  cartTotal;
  cartSaleAmount;
  cartTotalSale;
  itemsCnt;

  constructor(
    private cartService: CartService
  ) { }

  ngOnInit() {
    this.items = this.getItems();
    this.cartTotal = this.getCartTotal();
    this.cartSaleAmount = this.getCartSaleAmount();
    this.cartTotalSale = this.getCartSaleTotal();
    this.itemsCnt = this.getItemsCount(); 
  }
  
  mouseOver(product, imgNum){
    var prodImg = document.getElementById("prodImg_" + product.id);
    //console.log('prodImg: ' + prodImg);
    if(prodImg != null)
      prodImg.src = product.img[imgNum];
  }

  mouseLeave(product){
    var prodImg = document.getElementById("prodImg_" + product.id);
    //console.log('prodImg: ' + prodImg);
    if(prodImg != null)
      prodImg.src = product.img[0];
  }

  getItems() {
    return this.cartService.getItems();
  }

  getCartTotal() {
    let total = 0;
    this.items.forEach(ele => {
      total += parseFloat(ele.price)*parseInt(ele.qty);      
    });

    return total;
  }

  getCartSaleAmount() {
    let total = 0;
    this.items.forEach(ele => {      
      let promoVal = parseInt(ele.promo)/100;
      //console.log('promoVal: ' + promoVal);
      if(ele.promo != undefined)
        total += parseFloat(ele.price) * promoVal * parseInt(ele.qty);      
      //console.log(total);
    });
    return total;
  }

  getCartSaleTotal() {
    let total = 0;
    this.items.forEach(ele => {      
      let promoVal = (100.0 - parseInt(ele.promo))/100.0;
      //console.log('promoVal: ' + promoVal);
      if(ele.promo != undefined)
        total += parseFloat(ele.price) * promoVal * parseInt(ele.qty);
      else
        total += parseFloat(ele.price) * parseInt(ele.qty);
      //console.log(total);
    });
    return total;
  }

  getItemsCount() {
    let total = 0;
    this.items.forEach(ele => {
      total += parseInt(ele.qty);
      //console.log(ele.id + '|' + ele.qty);
    });

    return total;
  }

  backToList() {    
    window.history.back();
  }

  clearCart() {
    this.items = this.cartService.clearCart();
    return this.items;
  }
  
  //Fixed on 12/15/2020
  //set itemsCnt
  removeFromCart(itemId) {
    this.items = this.cartService.removeFromCart(itemId);
    this.itemsCnt = this.getItemsCount(); 
  }
}