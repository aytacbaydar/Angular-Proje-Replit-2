
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { YoneticiIndexSayfasiComponent } from './yonetici-index-sayfasi/yonetici-index-sayfasi.component';
import { OgrenciListesiSayfasiComponent } from './ogrenci-isleri-sayfasi/ogrenci-listesi-sayfasi/ogrenci-listesi-sayfasi.component';
import { OgrenciDetaySayfasiComponent } from './ogrenci-isleri-sayfasi/ogrenci-detay-sayfasi/ogrenci-detay-sayfasi.component';

@NgModule({
  declarations: [
    YoneticiIndexSayfasiComponent,
    OgrenciListesiSayfasiComponent,
    OgrenciDetaySayfasiComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule
  ],
  exports: [
    YoneticiIndexSayfasiComponent,
    OgrenciListesiSayfasiComponent,
    OgrenciDetaySayfasiComponent
  ]
})
export class YoneticiSayfasiModule {}
