import { PlatformLocation } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../cart.service';
import { Utils } from '../utils';
import { contactInfo } from '../contact-info';

export type ThemeMode = 'light' | 'dark' | 'system';

@Component({
  standalone: false,
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css'],
})
export class TopBarComponent implements OnInit, AfterViewInit, OnDestroy {
  items = [];
  itemsCnt;
  themeMode: ThemeMode = 'system';
  themeMenuOpen = false;
  contactInfoFiltered = JSON.parse(JSON.stringify(contactInfo));

  private mediaQuery?: MediaQueryList;
  private mediaListener?: (event: MediaQueryListEvent) => void;

  readonly themeOptions: { mode: ThemeMode; label: string; icon: string }[] = [
    { mode: 'light', label: 'Light', icon: 'light_mode' },
    { mode: 'dark', label: 'Dark', icon: 'dark_mode' },
    { mode: 'system', label: 'System', icon: 'brightness_auto' },
  ];

  constructor(
    private cartService: CartService,
    private router: Router,
    private utils: Utils,
    private host: ElementRef<HTMLElement>,
    location: PlatformLocation,
  ) {
    location.onPopState(() => {});
  }

  ngOnInit() {
    this.contactInfoFiltered[0].location = this.contactInfoFiltered[0].location.filter(
      (ele) => ele.contactType != 'Address' && ele.contactType != 'Fax Number',
    );
  }

  ngAfterViewInit(): void {
    this.themeMode = this.resolveStoredMode();
    this.applyThemeMode(this.themeMode);
    this.watchSystemPreference();
  }

  ngOnDestroy(): void {
    this.unwatchSystemPreference();
  }

  ngDoCheck() {
    this.itemsCnt = this.cartService.getItemsCount();
  }

  get themeIcon(): string {
    if (this.themeMode === 'system') {
      return this.prefersDark() ? 'dark_mode' : 'light_mode';
    }
    return this.themeMode === 'dark' ? 'dark_mode' : 'light_mode';
  }

  goToUrl(url) {
    this.router.navigateByUrl(url);

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('ngRunSlick'));
    });
  }

  toggleThemeMenu(event?: Event) {
    event?.stopPropagation();
    this.themeMenuOpen = !this.themeMenuOpen;
  }

  selectThemeMode(mode: ThemeMode, event?: Event) {
    event?.stopPropagation();
    this.themeMode = mode;
    this.themeMenuOpen = false;
    // Keep preference for a year
    this.utils.setToStorageWithExpiry('themeMode', mode, 365 * 24 * 60 * 60 * 1000);
    this.applyThemeMode(mode);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.themeMenuOpen) return;
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.themeMenuOpen = false;
    }
  }

  private resolveStoredMode(): ThemeMode {
    const storedMode = this.utils.getFromStorageWithExpiry('themeMode');
    if (storedMode === 'light' || storedMode === 'dark' || storedMode === 'system') {
      return storedMode;
    }

    // Migrate legacy swatch values
    const legacy = this.utils.getFromStorageWithExpiry('theme');
    if (legacy === 'darkGrayTheme') return 'dark';
    if (legacy === 'blueTheme') return 'light';

    return 'system';
  }

  private applyThemeMode(mode: ThemeMode) {
    const resolved =
      mode === 'system' ? (this.prefersDark() ? 'dark' : 'light') : mode;
    document.body.className = resolved === 'dark' ? 'darkGrayTheme' : 'blueTheme';
  }

  private prefersDark(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private watchSystemPreference() {
    this.unwatchSystemPreference();
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaListener = () => {
      if (this.themeMode === 'system') {
        this.applyThemeMode('system');
      }
    };
    this.mediaQuery.addEventListener('change', this.mediaListener);
  }

  private unwatchSystemPreference() {
    if (this.mediaQuery && this.mediaListener) {
      this.mediaQuery.removeEventListener('change', this.mediaListener);
    }
    this.mediaQuery = undefined;
    this.mediaListener = undefined;
  }
}
