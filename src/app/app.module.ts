import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CountdownModule } from 'ngx-countdown';

//Components
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

//Servcices
import { CartService } from './cart.service';
import { EmailService } from './email.service';
import { CrudService } from './crud.service';

import { LazyImgDirective } from './lazyimg.directive';

import { ProductList2Component } from './product-list2/product-list2.component';
import { ContactLensesComponent } from './contact-lenses/contact-lenses.component';

const appRoutes: Routes = [
  { path: 'product-list2', component: ProductList2Component },
  
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'product-list', component: ProductListComponent },  
  { 
    path: 'product-list/brand/:brand', 
    component: ProductListComponent, 
    runGuardsAndResolvers: 'always', //paramsChange
  },
  { 
    path: 'product-list/:type', 
    component: ProductListComponent, 
    runGuardsAndResolvers: 'always', //paramsChange
  },
  { 
    path: 'product-list/promo/:promo', 
    component: ProductListComponent, 
    runGuardsAndResolvers: 'always', //paramsChange
  },
  { 
    path: 'product-list/keyword/:keyword', 
    component: ProductListComponent, 
    runGuardsAndResolvers: 'always', //paramsChange
  },
  { 
    path: 'product-list/gender/:gender', 
    component: ProductListComponent, 
    runGuardsAndResolvers: 'always', //paramsChange
  },
  { 
    path: 'product-list/:type/gender/:gender', 
    component: ProductListComponent, 
    runGuardsAndResolvers: 'always', //paramsChange
  },
  { path: 'products/:productId', component: ProductDetailsComponent},
  { path: 'cart', component: CartComponent },
  { path: 'contact-us', component: ContactUsComponent },
  { path: 'request-showing', component: RequestShowingComponent },  
  { path: 'try-on-demo', component: TryOnDemoComponent },
  { path: 'contact-lenses', component: ContactLensesComponent },  
  { path: '**', component: PageNotFoundComponent }
];

export function TranslationLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  bootstrap: [ AppComponent ],
  imports: [
    BrowserModule,
    CountdownModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes, {
        onSameUrlNavigation: 'ignore',
        enableTracing: false, //debugging         
      }
    ),
    TranslateModule.forRoot( {
      loader: {
        provide: TranslateLoader, 
        useFactory: TranslationLoaderFactory, 
        deps: [HttpClient]
      }
    })
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
    LazyImgDirective
  ],  
  providers: [CartService, EmailService, CrudService]

})
export class AppModule { }
