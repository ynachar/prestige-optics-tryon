import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { contactInfo } from '../contact-info';
import { menuItems } from '../menu-items';

@Component({
  standalone: false,
  selector: 'app-bottom-bar',
  templateUrl: './bottom-bar.component.html',
  styleUrls: ['./bottom-bar.component.css'],
})
export class BottomBarComponent implements OnInit {
  currentYear;
  contactInfo = contactInfo;
  menuItems = menuItems;

  constructor(private router: Router) {}

  ngOnInit() {
    this.currentYear = new Date().getFullYear();
  }

  goToUrl(url: string | string[]) {
    const path = Array.isArray(url) ? url[0] : url;
    this.router.navigateByUrl(path);
  }

  scrolToTop(event?: Event) {
    event?.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

window.addEventListener(
  'scroll',
  function () {
    var btnScrollTop = document.getElementById('btnScrollTop');
    if (!btnScrollTop) return;

    var scrolled =
      document.body.scrollTop > 320 || document.documentElement.scrollTop > 320;

    btnScrollTop.classList.toggle('scrollTopHidden', !scrolled);
    btnScrollTop.classList.toggle('scrollTopVisible', scrolled);
  },
  { passive: true },
);
