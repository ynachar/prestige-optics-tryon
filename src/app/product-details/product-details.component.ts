import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { products } from '../products';
import { CartService } from '../cart.service';
import { ModalBoxComponent } from '../modal-box/modal-box.component';
import { fitGlassesOverlay, hideGlassesOverlay } from '../try-on-fit';

declare var tracking: any;
declare var jQuery: any;

@Component({
  standalone: false,
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailsComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  product;
  slideIndex = 1;
  timeoutHandler;
  previewCleared = false;
  usingDefaultPhoto = true;
  isFullscreen = false;
  private fullscreenKeyHandler = null;
  // Leading slash required — relative "assets/..." breaks under /products/:id.
  defaultThumbSrc = '/assets/images/unknown-person.jpg';
  thumbSrc = this.defaultThumbSrc;

  /** Keep uploaded photo across refresh for 15 days (cookie + localStorage). */
  private readonly photoTtlMs = 15 * 24 * 60 * 60 * 1000;
  private readonly photoDataKey = 'prevImageData';
  private readonly photoSavedAtKey = 'prevImageSavedAt';
  private readonly tryOnEnabledKey = 'tryOnEnabled';
  private readonly photoCookieName = 'tryOnPhotoExpires';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private modalBox: ModalBoxComponent,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      var prodId = +params.get('productId');
      this.product = products.find((ele) => ele.id == prodId);
    });
  }

  ngAfterViewInit(): void {
    this.showSlides(this.slideIndex);

    var imgBox = document.getElementById('imgBox');
    if (imgBox != null && document.body.clientWidth > 688) {
      imgBox.onclick = (ev) => {
        this.openImageViewer();
      };
    }

    // Restore uploaded photo across refresh; only Clear Preview or 15-day expiry removes it.
    if (this.preloadMyImage()) {
      this.enableTryOnBtn();
    } else {
      this.disableTryOnBtn();
      this.hidePreview();
    }
  }

  ngOnDestroy() {
    this.unbindFullscreenKeys();
    if (this.isFullscreen) {
      document.body.style.overflow = '';
    }
  }

  isDefaultPhoto() {
    return this.usingDefaultPhoto;
  }

  hidePreview() {
    var productPreview = document.getElementById('productPreview');
    hideGlassesOverlay(productPreview);
  }

  onPhotoLoad() {
    if (this.previewCleared || this.usingDefaultPhoto) {
      this.hidePreview();
      return;
    }
    localStorage.setItem(this.tryOnEnabledKey, 'true');
    this.tryProduct();
  }

  plusSlides(n) {
    this.showSlides((this.slideIndex += n));
  }

  currentSlide(n) {
    this.showSlides((this.slideIndex = n));
  }

  showSlides(n) {
    var imgBox = document.getElementById('imgBox');
    if (imgBox == null) {
      return;
    }

    var i;
    var slides = imgBox.getElementsByClassName('mySlides');
    var dots = imgBox.getElementsByClassName('dot');

    if (n > slides.length) {
      this.slideIndex = 1;
    }
    if (n < 1) {
      this.slideIndex = slides.length;
    }

    for (i = 0; i < slides.length; i++) {
      (slides[i] as HTMLElement).style.display = 'none';
    }
    for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(' active', '');
    }

    if (slides.length > 0) {
      (slides[this.slideIndex - 1] as HTMLElement).style.display = 'block';
      if (slides.length < 2) {
        (dots[this.slideIndex - 1] as HTMLElement).style.visibility = 'hidden';
        var prev = imgBox.getElementsByClassName('prev');
        var next = imgBox.getElementsByClassName('next');
        if (prev[0]) {
          (prev[0] as HTMLElement).style.visibility = 'hidden';
        }
        if (next[0]) {
          (next[0] as HTMLElement).style.visibility = 'hidden';
        }
      }
      if (dots[this.slideIndex - 1]) {
        dots[this.slideIndex - 1].className += ' active';
      }
    }
  }

  clearStoredPhoto() {
    localStorage.removeItem(this.tryOnEnabledKey);
    localStorage.removeItem(this.photoDataKey);
    localStorage.removeItem(this.photoSavedAtKey);
    this.clearPhotoCookie();
  }

  private setPhotoCookie(expiresAt: number) {
    var maxAgeSec = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
    document.cookie =
      this.photoCookieName +
      '=' +
      encodeURIComponent(String(expiresAt)) +
      '; path=/; max-age=' +
      maxAgeSec +
      '; SameSite=Lax';
  }

  private clearPhotoCookie() {
    document.cookie =
      this.photoCookieName + '=; path=/; max-age=0; SameSite=Lax';
  }

  private readPhotoCookieExpires(): number {
    var parts = (document.cookie || '').split(';');
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i].replace(/^\s+|\s+$/g, '');
      if (part.indexOf(this.photoCookieName + '=') === 0) {
        var raw = decodeURIComponent(
          part.substring(this.photoCookieName.length + 1)
        );
        var n = parseInt(raw, 10);
        return isNaN(n) ? 0 : n;
      }
    }
    return 0;
  }

  /** Returns true if a non-expired uploaded photo was restored. */
  preloadMyImage(): boolean {
    var base64String = localStorage.getItem(this.photoDataKey);
    if (!base64String) {
      this.clearPhotoCookie();
      return false;
    }

    var now = Date.now();
    var cookieExpires = this.readPhotoCookieExpires();
    var savedAtRaw = localStorage.getItem(this.photoSavedAtKey);
    var savedAt = savedAtRaw ? parseInt(savedAtRaw, 10) : NaN;

    var expiresAt = cookieExpires;
    if (!expiresAt) {
      if (savedAt && !isNaN(savedAt)) {
        expiresAt = savedAt + this.photoTtlMs;
      } else {
        // Legacy upload without expiry — keep it and start a fresh 15-day window.
        expiresAt = now + this.photoTtlMs;
        localStorage.setItem(this.photoSavedAtKey, String(now));
        this.setPhotoCookie(expiresAt);
      }
    }

    if (expiresAt <= now) {
      this.clearStoredPhoto();
      return false;
    }

    if (!cookieExpires) {
      this.setPhotoCookie(expiresAt);
    }

    this.previewCleared = false;
    this.usingDefaultPhoto = false;
    this.thumbSrc = 'data:image/jpeg;base64,' + base64String;
    this.cdr.markForCheck();
    return true;
  }

  private saveUploadedPhoto(dataUrl: string): boolean {
    var now = Date.now();
    var expiresAt = now + this.photoTtlMs;
    // Store payload only (no data: prefix) to save a little space.
    var payload = dataUrl.indexOf(',') >= 0 ? dataUrl.split(',')[1] : dataUrl;
    try {
      localStorage.setItem(this.photoDataKey, payload);
      localStorage.setItem(this.photoSavedAtKey, String(now));
      localStorage.setItem(this.tryOnEnabledKey, 'true');
      this.setPhotoCookie(expiresAt);
      return true;
    } catch (err) {
      // Quota exceeded — clear old photo keys and retry once.
      try {
        localStorage.removeItem(this.photoDataKey);
        localStorage.setItem(this.photoDataKey, payload);
        localStorage.setItem(this.photoSavedAtKey, String(now));
        localStorage.setItem(this.tryOnEnabledKey, 'true');
        this.setPhotoCookie(expiresAt);
        return true;
      } catch (err2) {
        console.warn('Could not persist try-on photo (storage quota).', err2);
        return false;
      }
    }
  }

  /**
   * Shrink large camera/phone photos so they fit localStorage (~5MB quota).
   * Try-on only needs ~1200px on the long edge.
   */
  private compressImageForStorage(
    file: File,
    maxEdge: number,
    quality: number
  ): Promise<string> {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = function () {
        reject(new Error('image read failed'));
      };
      reader.onload = function () {
        var img = new Image();
        img.onload = function () {
          var w = img.naturalWidth || img.width;
          var h = img.naturalHeight || img.height;
          var scale = Math.min(1, maxEdge / Math.max(w, h));
          var outW = Math.max(1, Math.round(w * scale));
          var outH = Math.max(1, Math.round(h * scale));
          var canvas = document.createElement('canvas');
          canvas.width = outW;
          canvas.height = outH;
          var ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('canvas unsupported'));
            return;
          }
          ctx.drawImage(img, 0, 0, outW, outH);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = function () {
          reject(new Error('image decode failed'));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  /** Compress, then shrink further until localStorage accepts the photo. */
  private persistCompressedPhoto(file: File): Promise<string> {
    var self = this;
    var attempts = [
      { maxEdge: 1200, quality: 0.72 },
      { maxEdge: 900, quality: 0.55 },
      { maxEdge: 700, quality: 0.45 },
      { maxEdge: 520, quality: 0.35 },
    ];

    function tryAt(i: number): Promise<string> {
      if (i >= attempts.length) {
        return Promise.reject(new Error('photo too large for storage'));
      }
      var opts = attempts[i];
      return self
        .compressImageForStorage(file, opts.maxEdge, opts.quality)
        .then(function (dataUrl) {
          if (self.saveUploadedPhoto(dataUrl)) {
            return dataUrl;
          }
          return tryAt(i + 1);
        });
    }

    return tryAt(0);
  }

  addToCart(product) {
    this.product.qty = 1;
    this.cartService.addToCart(product);
    var transText = '';
    this.translate
      .get('has been added to the cart!')
      .subscribe((transValue) => {
        transText = transValue;
      });
    var msg = "'" + product.name + "' " + transText;
    this.modalBox.open(msg, true, false);
  }

  showMyImage(fileInput) {
    var files = fileInput;
    if (files == null) {
      return;
    }

    var file = files[0];
    if (!file || !file.type.match(/image.*/)) {
      return;
    }

    var img = document.getElementById('thumbnail') as any;
    if (img) {
      img.file = file;
    }

    this.previewCleared = false;
    this.usingDefaultPhoto = false;
    this.enableTryOnBtn();

    var self = this;
    this.persistCompressedPhoto(file).then(
      function (dataUrl) {
        self.thumbSrc = dataUrl;
        self.cdr.detectChanges();
      },
      function () {
        // Still show the photo for this session even if it cannot be persisted.
        var reader = new FileReader();
        reader.onload = function (e: any) {
          self.thumbSrc = e.target.result;
          self.cdr.detectChanges();
        };
        reader.readAsDataURL(file);
      }
    );
  }

  enableTryOnBtn() {
    var tryProductBtn = document.getElementById('tryProductBtn');
    if (tryProductBtn != null) {
      tryProductBtn.classList.remove('disabledBtn');
    }
  }

  disableTryOnBtn() {
    var tryProductBtn = document.getElementById('tryProductBtn');
    if (tryProductBtn != null) {
      tryProductBtn.classList.add('disabledBtn');
    }
  }

  clearImage() {
    this.previewCleared = true;
    this.usingDefaultPhoto = true;
    this.clearStoredPhoto();
    this.hidePreview();
    this.disableTryOnBtn();
    this.thumbSrc = this.defaultThumbSrc;
    this.cdr.detectChanges();

    var input = document.getElementById('imgInput') as HTMLInputElement;
    if (input != null) {
      input.value = '';
    }
  }

  tryProductBtn() {
    if (this.usingDefaultPhoto) {
      this.hidePreview();
      return;
    }
    this.previewCleared = false;
    localStorage.setItem(this.tryOnEnabledKey, 'true');
    this.tryProduct();
  }

  tryProduct() {
    if (this.usingDefaultPhoto) {
      this.hidePreview();
      return;
    }
    placePrevImgOn();
  }

  previewUp() {
    this.timeoutHandler = setInterval(() => {
      var productPreview = document.querySelector(
        '.productPreview'
      ) as HTMLElement;
      if (!productPreview) {
        return;
      }
      var val =
        parseInt((productPreview.style.top || '0').replace('%', ''), 10) || 0;
      productPreview.style.top = val - 3 + 'px';
    }, 100);
  }

  previewDown() {
    this.timeoutHandler = setInterval(() => {
      var productPreview = document.querySelector(
        '.productPreview'
      ) as HTMLElement;
      if (!productPreview) {
        return;
      }
      var val =
        parseInt((productPreview.style.top || '0').replace('%', ''), 10) || 0;
      productPreview.style.top = val + 3 + 'px';
    }, 100);
  }

  previewRight() {
    this.timeoutHandler = setInterval(() => {
      var productPreview = document.querySelector(
        '.productPreview'
      ) as HTMLElement;
      if (!productPreview) {
        return;
      }
      var val =
        parseInt((productPreview.style.left || '0').replace('%', ''), 10) || 0;
      productPreview.style.left = val + 3 + 'px';
    }, 100);
  }

  previewLeft() {
    this.timeoutHandler = setInterval(() => {
      var productPreview = document.querySelector(
        '.productPreview'
      ) as HTMLElement;
      if (!productPreview) {
        return;
      }
      var val =
        parseInt((productPreview.style.left || '0').replace('%', ''), 10) || 0;
      productPreview.style.left = val - 3 + 'px';
    }, 100);
  }

  mouseup() {
    if (this.timeoutHandler) {
      clearInterval(this.timeoutHandler);
      this.timeoutHandler = null;
    }
  }

  enterFullscreen() {
    if (this.isFullscreen) {
      return;
    }
    this.isFullscreen = true;
    document.body.style.overflow = 'hidden';
    this.bindFullscreenKeys();
    this.cdr.detectChanges();
    this.refitAfterLayout();
  }

  exitFullscreen() {
    if (!this.isFullscreen) {
      return;
    }
    this.isFullscreen = false;
    document.body.style.overflow = '';
    this.unbindFullscreenKeys();
    this.cdr.detectChanges();
    this.refitAfterLayout();
  }

  private bindFullscreenKeys() {
    var self = this;
    this.unbindFullscreenKeys();
    this.fullscreenKeyHandler = function (ev: KeyboardEvent) {
      if (ev.key === 'Escape' || ev.keyCode === 27) {
        self.exitFullscreen();
      }
    };
    window.addEventListener('keydown', this.fullscreenKeyHandler);
  }

  private unbindFullscreenKeys() {
    if (this.fullscreenKeyHandler) {
      window.removeEventListener('keydown', this.fullscreenKeyHandler);
      this.fullscreenKeyHandler = null;
    }
  }

  private refitAfterLayout() {
    var self = this;
    var overlay = document.getElementById('productPreview');
    if (overlay) {
      hideGlassesOverlay(overlay);
    }
    // Class/layout needs a beat to apply before measuring the photo for eye fit.
    setTimeout(function () {
      requestAnimationFrame(function () {
        if (!self.usingDefaultPhoto && !self.previewCleared) {
          self.tryProduct();
        }
      });
    }, 100);
  }

  backToList() {
    window.history.back();
  }

  closeImageViewer() {
    var imgBox = document.getElementById('imgBox');
    if (imgBox != null) {
      imgBox.classList.remove('imgBoxModal');
    }
    document.body.style.overflowY = 'unset';

    var closeBtn = document.getElementById('closeBtn');
    if (closeBtn != null) {
      closeBtn.classList.remove('closeBtnModal');
    }
    this.modalBox.close();
  }

  openImageViewer() {
    var modalContainer = document.getElementById('modalContainer');
    if (modalContainer == null) {
      return;
    }

    this.modalBox.open('', false, false);

    var modalBoxWrapper = document.getElementById('modalBoxWrapper');
    if (modalBoxWrapper != null) {
      modalBoxWrapper.style.opacity = '0.97';
    }

    document.body.style.overflowY = 'hidden';

    var imgBox = document.getElementById('imgBox');
    if (imgBox != null) {
      imgBox.classList.add('imgBoxModal');
    }

    var closeBtn = document.getElementById('closeBtn');
    if (closeBtn != null) {
      closeBtn.classList.add('closeBtnModal');
      closeBtn.onclick = (ev) => {
        this.closeImageViewer();
      };
    }
  }
}

function placePrevImgOn() {
  var img = document.getElementById('thumbnail') as HTMLImageElement;
  var productPreview = document.getElementById('productPreview');
  if (!img || !productPreview) {
    return;
  }
  fitGlassesOverlay(img, productPreview);
}
