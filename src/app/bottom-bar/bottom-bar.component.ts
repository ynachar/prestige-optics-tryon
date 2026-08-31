import { Component, OnInit } from '@angular/core';
import { contactInfo } from '../contact-info';
import { TranslateService } from '@ngx-translate/core';
import { menuItems } from "../menu-items";

@Component({
  selector: 'app-bottom-bar',
  templateUrl: './bottom-bar.component.html',
  styleUrls: ['./bottom-bar.component.css']
})
export class BottomBarComponent implements OnInit {
  currentYear;
  contactInfo = contactInfo;
  menuItems = menuItems;

  constructor() { }

  ngOnInit() {
    this.currentYear = new Date().getFullYear();
  }

  scrolToTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }
}

window.onscroll = function() {
  var btnScrollTop = document.getElementById('btnScrollTop');
  
  if(document.body.scrollTop > 400 || document.documentElement.scrollTop > 400) {
    //console.log('scrollTop: ' + document.body.scrollTop + '|' + document.documentElement.scrollTop);

    btnScrollTop.classList.remove('scrollTopHidden');
    btnScrollTop.classList.add('scrollTopVisible');
  }
  else {
    btnScrollTop.classList.remove('scrollTopVisible');
    btnScrollTop.classList.add('scrollTopHidden');
  }
}