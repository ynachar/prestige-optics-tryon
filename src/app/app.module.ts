import { inject, NgModule, provideAppInitializer } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  TranslatePipe,
  TranslateService,
  provideTranslateLoader,
  provideTranslateService,
} from '@ngx-translate/core';
import {
  TranslateHttpLoader,
  provideTranslateHttpLoader,
} from '@ngx-translate/http-loader';
import { CountdownComponent } from 'ngx-countdown';
import { firstValueFrom } from 'rxjs';

import { AppComponent } from './app.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductAlertsComponent } from './product-alerts/product-alerts.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { CartComponent } from './cart/cart.component';
import { ModalBoxComponent } from './modal-box/modal-box.component';
import { BottomBarComponent } from './bottom-bar/bottom-bar.component';
import { MenuComponent } from './menu/menu.component';
import { HomeComponent } from './home/home.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { RequestShowingComponent } from './request-showing/request-showing.component';
import { TryOnDemoComponent } from './try-on-demo/try-on-demo.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

import { CartService } from './cart.service';
import { EmailService } from './email.service';
import { CrudService } from './crud.service';
import {
  DEFAULT_LANG,
  resolveStoredLang,
  SUPPORTED_LANGS,
} from './language';

import { LazyImgDirective } from './lazyimg.directive';

import { ProductList2Component } from './product-list2/product-list2.component';
import { ContactLensesComponent } from './contact-lenses/contact-lenses.component';

function initLanguage() {
  const translate = inject(TranslateService);
  const lang = resolveStoredLang();
  translate.addLangs([...SUPPORTED_LANGS]);
  translate.setFallbackLang(DEFAULT_LANG);
  return firstValueFrom(translate.use(lang));
}

const appRoutes: Routes = [
  { path: 'product-list2', component: ProductList2Component },

  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'product-list', component: ProductListComponent },
  {
    path: 'product-list/brand/:brand',
    component: ProductListComponent,
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'product-list/:type',
    component: ProductListComponent,
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'product-list/promo/:promo',
    component: ProductListComponent,
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'product-list/keyword/:keyword',
    component: ProductListComponent,
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'product-list/gender/:gender',
    component: ProductListComponent,
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'product-list/:type/gender/:gender',
    component: ProductListComponent,
    runGuardsAndResolvers: 'always',
  },
  { path: 'products/:productId', component: ProductDetailsComponent },
  { path: 'cart', component: CartComponent },
  { path: 'contact-us', component: ContactUsComponent },
  { path: 'request-showing', component: RequestShowingComponent },
  { path: 'try-on-demo', component: TryOnDemoComponent },
  { path: 'contact-lenses', component: ContactLensesComponent },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    CountdownComponent,
    TranslatePipe,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes, {
      onSameUrlNavigation: 'ignore',
      enableTracing: false,
    }),
  ],
  declarations: [
    AppComponent,
    TopBarComponent,
    ProductListComponent,
    ProductAlertsComponent,
    ProductDetailsComponent,
    CartComponent,
    ModalBoxComponent,
    BottomBarComponent,
    MenuComponent,
    HomeComponent,
    ContactUsComponent,
    RequestShowingComponent,
    PageNotFoundComponent,
    ProductList2Component,
    TryOnDemoComponent,
    ContactLensesComponent,
    LazyImgDirective,
  ],
  providers: [
    CartService,
    EmailService,
    CrudService,
    provideHttpClient(withInterceptorsFromDi()),
    provideTranslateHttpLoader({
      prefix: './assets/i18n/',
      suffix: '.json',
    }),
    provideTranslateService({
      loader: provideTranslateLoader(TranslateHttpLoader),
      fallbackLang: DEFAULT_LANG,
      lang: DEFAULT_LANG,
    }),
    provideAppInitializer(initLanguage),
  ],
})
export class AppModule {}
