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
  created_at?: string;
  // Öğrenci alanları
  okulu?: string;
  sinifi?: string;
  grubu?: string;
  ders_gunu?: string;
  ders_saati?: string;
  ucret?: string;
  // Öğretmen alanları
  brans?: string;
}

@Component({
  selector: 'app-ogrenci-listesi-sayfasi',
  standalone: false,
  templateUrl: './ogrenci-listesi-sayfasi.component.html',
  styleUrl: './ogrenci-listesi-sayfasi.component.scss',
})
export import { User } from '../../../../models/user.model';

class OgrenciListesiSayfasiComponent implements OnInit {
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

  // Öğrenci silme işlemi
  deleteStudent(id: number): void {
    if(confirm('Bu öğrenciyi silmek istediğinize emin misiniz?')) {
      const token = localStorage.getItem('token');
      if (!token) {
        this.router.navigate(['/giris']);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // İki farklı silme yöntemi deneme (URL parametresi ve body ile)
      this.http.delete(`./server/api/ogrenci_sil.php/${id}`, {
        headers: headers
      }).subscribe({
        next: (response: any) => {
          if (response.success) {
            // Listeyi güncelle
            this.students = this.students.filter(student => student.id !== id);
            this.toastr.success('Öğrenci başarıyla silindi.');
          } else {
            this.toastr.error(`Hata: ${response.error}`);
          }
        },
        error: (error) => {
          console.error('Öğrenci silinirken hata oluştu:', error);

          // Alternatif silme yöntemi deneme
          this.http.delete(`./server/api/ogrenci_sil.php`, {
            headers: headers,
            body: { id: id }
          }).subscribe({
            next: (response: any) => {
              if (response.success) {
                // Listeyi güncelle
                this.students = this.students.filter(student => student.id !== id);
                this.toastr.success('Öğrenci başarıyla silindi.');
              } else {
                this.toastr.error(`Hata: ${response.error}`);
              }
            },
            error: (err) => {
              console.error('İkinci silme denemesi de başarısız:', err);
              this.toastr.error('Öğrenci silinirken bir hata oluştu. Lütfen tekrar deneyin.');
            }
          });
        }
      });
    }
  }

  // Öğretmen silme işlemi
  deleteTeacher(id: number): void {
    if (confirm('Bu öğretmeni silmek istediğinize emin misiniz?')) {
      // LocalStorage veya sessionStorage'dan token'ı al
      let token = '';
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        token = user.token || '';
      }

      this.http
        .delete(`./server/api/ogrenci_sil.php/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .subscribe({
          next: (response: any) => {
            if (response.success) {
              // Silinen öğretmeni listeden kaldır
              this.teachers = this.teachers.filter(teacher => teacher.id !== id);
              alert('Öğretmen başarıyla silindi.');
            } else {
              alert(`Hata: ${response.message}`);
            }
          },
          error: (error) => {
            console.error('Öğretmen silinirken hata oluştu:', error);
            alert('Öğretmen silinirken bir hata oluştu. Lütfen tekrar deneyin.');
          }
        });
    }
  }

  // Kullanıcı onaylama işlemi
  approveUser(id: number): void {
    // LocalStorage veya sessionStorage'dan token'ı al
    let token = '';
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      token = user.token || '';
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    // Kullanıcıyı onaylama isteği
    this.http
      .put('./server/api/kullanici_guncelle.php', 
        { id: id, aktif: true },
        { headers: headers }
      )
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            // Onaylanan kullanıcıyı listeden çıkar
            const user = this.newUsers.find(u => u.id === id);
            if (user) {
              this.newUsers = this.newUsers.filter(u => u.id !== id);

              // Kullanıcıyı ilgili listeye ekle
              if (user.rutbe === 'ogrenci') {
                user.aktif = true;
                this.students.push(user);
              } else if (user.rutbe === 'ogretmen') {
                user.aktif = true;
                this.teachers.push(user);
              }
            }
            alert('Kullanıcı başarıyla onaylandı.');
          } else {
            alert(`Hata: ${response.message}`);
          }
        },
        error: (error) => {
          console.error('Kullanıcı onaylanırken hata oluştu:', error);
          alert('Kullanıcı onaylanırken bir hata oluştu. Lütfen tekrar deneyin.');
        }
      });
  }

  // Kullanıcı reddetme işlemi
  rejectUser(id: number): void {
    if (confirm('Bu kullanıcıyı reddetmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      // LocalStorage veya sessionStorage'dan token'ı al
      let token = '';
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        token = user.token || '';
      }

      this.http
        .delete(`./server/api/ogrenci_sil.php/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .subscribe({
          next: (response: any) => {
            if (response.success) {
              // Reddedilen kullanıcıyı listeden kaldır
              this.newUsers = this.newUsers.filter(user => user.id !== id);
              alert('Kullanıcı başarıyla reddedildi.');
            } else {
              alert(`Hata: ${response.message}`);
            }
          },
          error: (error) => {
            console.error('Kullanıcı reddedilirken hata oluştu:', error);
            alert('Kullanıcı reddedilirken bir hata oluştu. Lütfen tekrar deneyin.');
          }
        });
    }
  }

  loadUsers(): void {
    this.isLoading = true;
    // LocalStorage veya sessionStorage'dan token'ı al
    let token = '';
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      token = user.token || '';
    }

    // Yeni oluşturulan API'ye istek gönder - tüm öğrencileri getirir
    this.http
      .get<any>('./server/api/ogrenciler_listesi.php', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (response) => {
          if (response.success) {
            // API yanıtından gelen veriyi al
            const users = Array.isArray(response.data) ? response.data : [];

            // Kullanıcıları rütbelerine göre filtrele
            this.students = users.filter(
              (user: User) => user.rutbe === 'ogrenci' && user.aktif
            );

            this.teachers = users.filter(
              (user: User) => user.rutbe === 'ogretmen' && user.aktif
            );

            this.newUsers = users.filter((user: User) => !user.aktif);

            console.log('Yüklenen öğrenciler:', this.students);
          } else {
            console.error('API yanıtı başarısız:', response.error);
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('API hatası:', error);
          this.isLoading = false;
        },
      });
  }

  deleteStudent(id: number): void {
    if (!confirm('Bu öğrenciyi silmek istediğinize emin misiniz?')) {
      return;
    }

    // LocalStorage veya sessionStorage'dan token'ı al
    let token = '';
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      token = user.token || '';
    }

    this.http
      .post<any>('./server/api/ogrenci_sil.php', { id }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .subscribe({
        next: (response) => {
          if (response.success) {
            alert('Öğrenci başarıyla silindi!');
            // Listeyi yenile
            this.loadUsers();
          } else {
            alert('Silme işlemi başarısız: ' + response.error);
          }
        },
        error: (error) => {
          console.error('API hatası:', error);
          alert('Silme işlemi sırasında bir hata oluştu: ' + (error.message || 'Bilinmeyen bir hata'));
        },
      });
  }

  deleteTeacher(id: number): void {
    if (!confirm('Bu öğretmeni silmek istediğinize emin misiniz?')) {
      return;
    }

    // LocalStorage veya sessionStorage'dan token'ı al
    let token = '';
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      token = user.token || '';
    }

    this.http
      .post<any>('./server/api/ogrenci_sil.php', { id }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .subscribe({
        next: (response) => {
          if (response.success) {
            alert('Öğretmen başarıyla silindi!');
            // Listeyi yenile
            this.loadUsers();
          } else {
            alert('Silme işlemi başarısız: ' + response.error);
          }
        },
        error: (error) => {
          console.error('API hatası:', error);
          alert('Silme işlemi sırasında bir hata oluştu: ' + (error.message || 'Bilinmeyen bir hata'));
        },
      });
  }

    // Yeni kullanıcıyı onaylama fonksiyonu
    approveUser(userId: number) {
      if (!confirm('Bu kullanıcıyı onaylamak istediğinizden emin misiniz?')) {
        return;
      }

      // LocalStorage veya sessionStorage'dan token'ı al
      let token = '';
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        token = user.token || '';
      }

      // Kullanıcı verilerini hazırla
      const userData = {
        id: userId,
        rutbe: 'ogrenci', // Onaylandığında öğrenci olarak ayarla
        aktif: 1 // Aktif hesap olarak ayarla
      };

      this.http
        .post<any>('./server/api/kullanici_guncelle.php', userData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        .subscribe({
          next: (response) => {
            if (response.success) {
              alert('Kullanıcı başarıyla onaylandı!');
              this.loadUsers(); // Kullanıcı listesini yeniden yükle
            } else {
              alert('Kullanıcı onaylanamadı: ' + response.error);
            }
          },
          error: (error) => {
            console.error('Onaylama hatası:', error);
            alert('Onaylama işlemi sırasında bir hata oluştu: ' + (error.message || 'Bilinmeyen bir hata'));
          },
        });
    }

    // Yeni kullanıcıyı reddetme fonksiyonu
    rejectUser(userId: number) {
      if (!confirm('Bu kullanıcıyı reddetmek istediğinizden emin misiniz? Bu işlem kullanıcıyı silecektir.')) {
        return;
      }

      // LocalStorage veya sessionStorage'dan token'ı al
      let token = '';
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        token = user.token || '';
      }

      this.http
        .post<any>('./server/api/ogrenci_sil.php', { id: userId }, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        .subscribe({
          next: (response) => {
            if (response.success) {
              alert('Kullanıcı başarıyla reddedildi ve silindi!');
              this.loadUsers(); // Kullanıcı listesini yeniden yükle
            } else {
              alert('Kullanıcı reddedilemedi: ' + response.error);
            }
          },
          error: (error) => {
            console.error('Reddetme hatası:', error);
            alert('Reddetme işlemi sırasında bir hata oluştu: ' + (error.message || 'Bilinmeyen bir hata'));
          },
        });
    }
}