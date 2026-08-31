import { Component, OnInit } from '@angular/core';
import { products } from '../products';

@Component({
  selector: 'app-try-on-demo',
  templateUrl: './try-on-demo.component.html',
  styleUrls: ['./try-on-demo.component.css']
})
export class TryOnDemoComponent implements OnInit {
  products = products;

  constructor() { }

  ngOnInit() {
    
  }

  ngAfterViewInit(): void {
    window.dispatchEvent(new CustomEvent('ngRunSlick'));
  }

}