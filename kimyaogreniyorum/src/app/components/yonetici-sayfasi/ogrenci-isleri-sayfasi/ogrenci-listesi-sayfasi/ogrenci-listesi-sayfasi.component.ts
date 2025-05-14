import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


interface User {
  id: number;
  adi_soyadi: string;
  email: string;
  cep_telefonu?: string;
  avatar?: string;
  rutbe: string;
  aktif: boolean;
  bilgiler?: {
    okulu?: string;
    sinifi?: string;
    brans?: string;
    kayit_tarihi?: string;
    grubu?: string;
    ders_gunu?: string;
    ders_saati?: string;
    ucret?: string;
  };
}

@Component({
  selector: 'app-ogrenci-listesi-sayfasi',
  standalone: false,
  templateUrl: './ogrenci-listesi-sayfasi.component.html',
  styleUrl: './ogrenci-listesi-sayfasi.component.scss',
})
export class OgrenciListesiSayfasiComponent implements OnInit {
  students: User[] = [];
  teachers: User[] = [];
  newUsers: User[] = [];
  isLoading = true;
  activeTab: 'students' | 'teachers' | 'new' = 'students';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  setActiveTab(tab: 'students' | 'teachers' | 'new'): void {
    this.activeTab = tab;
  }

  loadUsers(): void {
    this.isLoading = true;
    // LocalStorage veya sessionStorage'dan token'ı al
    let token = '';
    const userStr =
      localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      token = user.token || '';
    }

    this.isLoading = true;
    // Node.js API'sine istek gönder
    this.http
      .get<any>('./server/api/ogrenci_bilgileri.php', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (response) => {
          if (response.success) {
            // API tüm kullanıcıları döndürüyor varsayalım
            const users = Array.isArray(response.data) ? response.data : [response.data];
            
            // Kullanıcıları rütbelerine göre filtrele
            this.students = users.filter(
              (user: User) => user.rutbe === 'ogrenci'
            );
            this.teachers = users.filter(
              (user: User) => user.rutbe === 'ogretmen'
            );
            this.newUsers = users.filter(
              (user: User) => user.rutbe === 'yeni'
            );
            
            console.log('Yüklenen öğrenciler:', this.students);
          } else {
            console.error('API yanıtı başarısız:', response);
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('API hatası:', error);
          // Hata durumunda sadece loading durumunu güncelle
          this.isLoading = false;
          alert('Öğrenci verisi yüklenirken bir hata oluştu: ' + (error.message || 'Bilinmeyen bir hata'));
        },
      });
  }

  editStudent(id: number): void {
    this.router.navigate(['/yonetici-sayfasi/ogrenci-detay-sayfasi', id]);
  }

  deleteStudent(id: number): void {
    if (confirm('Bu öğrenciyi silmek istediğinizden emin misiniz?')) {
      // LocalStorage veya sessionStorage'dan token'ı al
      let token = '';
      const userStr =
        localStorage.getItem('user') || sessionStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        token = user.token || '';
      }

      this.isLoading = true;
      // Node.js API'sine istek gönder
      this.http
        .delete<any>(`./server/api/ogrenci_sil.php/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .subscribe({
          next: (response) => {
            if (response.success) {
              alert('Öğrenci başarıyla silindi.');
              // Listeyi yeniden yükle
              this.loadUsers();
            } else {
              alert('Hata: ' + (response.error || 'Bilinmeyen bir hata oluştu.'));
              this.isLoading = false;
            }
          },
          error: (error) => {
            alert('Bağlantı hatası: ' + (error.message || 'Bilinmeyen bir hata oluştu.'));
            this.isLoading = false;
          },
        });
    }
  }
}