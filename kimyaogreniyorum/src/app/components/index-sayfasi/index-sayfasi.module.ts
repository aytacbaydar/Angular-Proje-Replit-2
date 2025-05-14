import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from '../../app-routing.module';
import { OgrenciKayitSayfasiComponent } from './giris-kayit-islemeleri/ogrenci-kayit-sayfasi/ogrenci-kayit-sayfasi.component';
import { OgrenciGirisSayfasiComponent } from './giris-kayit-islemeleri/ogrenci-giris-sayfasi/ogrenci-giris-sayfasi.component';



@NgModule({
  declarations: [OgrenciKayitSayfasiComponent, OgrenciGirisSayfasiComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
  ],
})
export class IndexSayfasiModule {}
