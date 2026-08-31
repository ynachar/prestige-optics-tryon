import { enableProdMode } from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';
// Required for JIT (StackBlitz).
import '@angular/compiler';
import { environment } from './environments/environment';
import { AppModule } from './app/app.module';

if (environment.production) {
  enableProdMode();
}

platformBrowser()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
