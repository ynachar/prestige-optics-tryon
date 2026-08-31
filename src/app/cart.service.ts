import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  items = [];

  constructor() { 
  }
  
  //Fixed on 12/15/2020
  //Added index to lookup item and qty lower case instead of uppercase
  addToCart(product) {
    let newItem = true;
    let itemIndex = this.items.findIndex(item => item.id === product.id);
    ///console.log('itemIndex out: ' + itemIndex); 
    if(itemIndex != undefined && itemIndex >= 0) {
      //console.log('itemIndex: ' + itemIndex);  
      //console.log('Qty before: ' + this.items[itemIndex].qty);

      this.items[itemIndex].qty++;      
      newItem = false;

      //console.log('Qty increased: ' + this.items[itemIndex].qty);
    }
    
    if(newItem){
      this.items.push(product);
      //console.log('New item in cart...');
    }

    //console.log('items obj after: ' + JSON.stringify(this.items));  

    //console.log('cnt: ' + this.items[this.items.indexOf(product)].qty);
    //Save cart items to localStorage
    localStorage.setItem('cartItems', JSON.stringify(this.items));
  }
  
  //Fixed on 12/15/2020
  //Added local storage save after splice and added index to lookup item
  removeFromCart(itemId) {
    //console.log('removeFromCart - itemId: ' + itemId);
    //console.log('Items before: ' + JSON.stringify(this.items));  
    let itemIndex = this.items.findIndex(item => item.id === itemId);
    this.items.splice(itemIndex, 1);
    localStorage.setItem('cartItems', JSON.stringify(this.items));
    //console.log('=> Items after: ' + JSON.stringify(this.items));  
    return this.items;
  }
  
  getItems() {
    return this.items;
  }
  
  getItemsCount() {
    if(this.items != null)
      return this.items.length;
    else
      return 0;
  }

  clearCart() {
    //clear items
    this.items = [];

    //clear items saved in session
    localStorage.removeItem('cartItems');

    return this.items;
  }
}