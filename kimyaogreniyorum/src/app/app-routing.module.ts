import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OgrenciGirisSayfasiComponent } from './components/index-sayfasi/giris-kayit-islemeleri/ogrenci-giris-sayfasi/ogrenci-giris-sayfasi.component';

const routes: Routes = [
  {path:'', component:OgrenciGirisSayfasiComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
