import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-ogrenci-detay-sayfasi',
  templateUrl: './ogrenci-detay-sayfasi.component.html',
  styleUrls: ['./ogrenci-detay-sayfasi.component.scss']
})
export class OgrenciDetaySayfasiComponent implements OnInit {
  ogrenciId!: number;
  ogrenci: any = null;
  editForm!: FormGroup;
  isLoading = false;
  selectedFile: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.ogrenciId = +params['id'];
      this.loadOgrenci();
    });

    this.initForm();
  }

  initForm(): void {
    this.editForm = this.formBuilder.group({
      adi_soyadi: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      cep_telefonu: [''],
      okulu: [''],
      sinifi: [''],
      grubu: [''],
      ders_gunu: [''],
      ders_saati: [''],
      ucret: [''],
      veli_adi: [''],
      veli_cep: [''],
      aktif: [true]
    });
  }

  loadOgrenci(): void {
    this.isLoading = true;
    const token = localStorage.getItem('token');

    this.http.get<any>(`./server/api/ogrenci_profil.php?id=${this.ogrenciId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.ogrenci = response.data;
          this.patchFormValues();
        } else {
          this.toastr.error('Öğrenci bilgileri yüklenemedi');
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.toastr.error('Öğrenci bilgileri yüklenirken bir hata oluştu');
        console.error('Yükleme hatası:', error);
        this.isLoading = false;
      }
    });
  }

  patchFormValues(): void {
    if (this.ogrenci) {
      this.editForm.patchValue({
        adi_soyadi: this.ogrenci.adi_soyadi,
        email: this.ogrenci.email,
        cep_telefonu: this.ogrenci.cep_telefonu,
        okulu: this.ogrenci.okulu,
        sinifi: this.ogrenci.sinifi,
        grubu: this.ogrenci.grubu,
        ders_gunu: this.ogrenci.ders_gunu,
        ders_saati: this.ogrenci.ders_saati,
        ucret: this.ogrenci.ucret,
        veli_adi: this.ogrenci.veli_adi,
        veli_cep: this.ogrenci.veli_cep,
        aktif: this.ogrenci.aktif
      });
    }
  }

  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  onSubmit(): void {
    if (this.editForm.invalid) {
      this.toastr.warning('Lütfen formu doğru şekilde doldurun');
      return;
    }

    this.spinner.show();
    const token = localStorage.getItem('token');
    const formData = new FormData();

    // Form verilerini ekle
    Object.keys(this.editForm.value).forEach(key => {
      formData.append(key, this.editForm.value[key]);
    });

    // ID ve avatar ekle
    formData.append('id', this.ogrenciId.toString());
    if (this.selectedFile) {
      formData.append('avatar', this.selectedFile);
    }

    this.http.post<any>('./server/api/ogrenci_guncelle.php', formData, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        this.spinner.hide();
        if (response.success) {
          this.toastr.success('Öğrenci bilgileri başarıyla güncellendi');
        } else {
          this.toastr.error(`Güncelleme hatası: ${response.error}`);
        }
      },
      error: (error) => {
        this.spinner.hide();
        this.toastr.error('Güncelleme sırasında bir hata oluştu');
        console.error('Güncelleme hatası:', error);
      }
    });
  }
}