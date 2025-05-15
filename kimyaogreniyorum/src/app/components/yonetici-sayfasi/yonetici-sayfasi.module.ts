import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from '../../app-routing.module';
import { YoneticiIndexSayfasiComponent } from './yonetici-index-sayfasi/yonetici-index-sayfasi.component';
import { OgrenciDetaySayfasiComponent } from './ogrenci-isleri-sayfasi/ogrenci-detay-sayfasi/ogrenci-detay-sayfasi.component';
import { OgrenciListesiSayfasiComponent } from './ogrenci-isleri-sayfasi/ogrenci-listesi-sayfasi/ogrenci-listesi-sayfasi.component';
import { OgrenciAnalizSayfasiComponent } from './ogrenci-isleri-sayfasi/ogrenci-analiz-sayfasi/ogrenci-analiz-sayfasi.component';



@NgModule({
  declarations: [
    OgrenciListesiSayfasiComponent,
    OgrenciDetaySayfasiComponent,
    YoneticiIndexSayfasiComponent,
    OgrenciAnalizSayfasiComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
  ],
  exports: [
    OgrenciListesiSayfasiComponent,
    OgrenciDetaySayfasiComponent,
    YoneticiIndexSayfasiComponent,
  ]
})
export class YoneticiSayfasiModule {}
