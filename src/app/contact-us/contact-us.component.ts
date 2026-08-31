import { Component, OnInit } from '@angular/core';

import { Injectable } from '@angular/core';
import { contactInfo } from '../contact-info';

@Injectable({
  providedIn: 'root'
})

@Component({
  standalone: false,
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css']
})
export class ContactUsComponent implements OnInit {
  contactInfo = contactInfo;

  constructor() { }

  ngOnInit() {        
    contactInfo.forEach((loc) => {
      //console.log('a: ' + loc.location);
      loc.location.forEach((locDet) => {
        ;//console.log('a: ' + locDet.contactType + '|' + locDet.contactValue);
      });      
    });
  }

  OpenInfowindowForMarker(index) {
    var markers = document.querySelectorAll('div[title]');

    //markers[index].style.zIndex = "10000000";

    console.log(markers[index].style.zIndex);
  }

}