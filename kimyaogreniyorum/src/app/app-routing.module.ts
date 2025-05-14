import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { YoneticiIndexSayfasiComponent } from './components/yonetici-sayfasi/yonetici-index-sayfasi/yonetici-index-sayfasi.component';
import { OgrenciListesiSayfasiComponent } from './components/yonetici-sayfasi/ogrenci-isleri-sayfasi/ogrenci-listesi-sayfasi/ogrenci-listesi-sayfasi.component';
import { OgrenciDetaySayfasiComponent } from './components/yonetici-sayfasi/ogrenci-isleri-sayfasi/ogrenci-detay-sayfasi/ogrenci-detay-sayfasi.component';
import { OgrenciGirisSayfasiComponent } from './components/index-sayfasi/giris-kayit-islemeleri/ogrenci-giris-sayfasi/ogrenci-giris-sayfasi.component';
import { OgrenciKayitSayfasiComponent } from './components/index-sayfasi/giris-kayit-islemeleri/ogrenci-kayit-sayfasi/ogrenci-kayit-sayfasi.component';
import { OgrenciOnaySayfasiComponent } from './components/index-sayfasi/giris-kayit-islemeleri/ogrenci-onay-sayfasi/ogrenci-onay-sayfasi.component';

const routes: Routes = [
  { path: '', redirectTo: '/giris-sayfasi', pathMatch: 'full' },
  { path: 'giris-sayfasi', component: OgrenciGirisSayfasiComponent },
  { path: 'kayit-sayfasi', component: OgrenciKayitSayfasiComponent },
  { path: 'onay-sayfasi', component: OgrenciOnaySayfasiComponent },

  //yönetici sayfaları
  {
    path: 'yonetici-sayfasi',
    component: YoneticiIndexSayfasiComponent,
    children: [
      {
        path: 'ogrenci-liste-sayfasi',
        component: OgrenciListesiSayfasiComponent,
      },
      {
        path: 'ogrenci-detay-sayfasi/:id',
        component: OgrenciDetaySayfasiComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
