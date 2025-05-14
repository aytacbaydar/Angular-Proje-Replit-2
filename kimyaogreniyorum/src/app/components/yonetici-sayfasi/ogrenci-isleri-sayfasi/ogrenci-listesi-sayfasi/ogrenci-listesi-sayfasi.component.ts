import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

// User modelini oluştur
interface User {
  id: number;
  adi_soyadi: string;
  email: string;
  cep_telefonu: string;
  rutbe: string;
  aktif: boolean;
  avatar: string;
  created_at: string;
  okulu?: string;
  sinifi?: string;
  grubu?: string;
  ders_gunu?: string;
  ders_saati?: string;
  ucret?: string;
  veli_adi?: string;
  veli_cep?: string;
}

@Component({
  selector: 'app-ogrenci-listesi-sayfasi',
  templateUrl: './ogrenci-listesi-sayfasi.component.html',
  styleUrls: ['./ogrenci-listesi-sayfasi.component.scss']
})
export class OgrenciListesiSayfasiComponent implements OnInit {
  students: User[] = [];
  teachers: User[] = [];
  filteredStudents: User[] = [];
  filteredTeachers: User[] = [];
  pendingUsers: User[] = [];
  showPendingUsers = false;
  searchText = '';
  isLoading = false;
  currentUser: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/giris']);
      return;
    }

    this.isLoading = true;
    // Tüm öğrencileri getiren API'ye istek gönder
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

            this.pendingUsers = users.filter(
              (user: User) => !user.aktif
            );

            this.filteredStudents = [...this.students];
            this.filteredTeachers = [...this.teachers];

            this.isLoading = false;
          } else {
            console.error('Veri yüklenirken hata oluştu:', response.error);
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('API hatası:', error);
          this.isLoading = false;
        },
      });
  }

  deleteStudent(id: number): void {
    Swal.fire({
      title: 'Emin misiniz?',
      text: "Bu öğrenciyi silmek istediğinizden emin misiniz?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Evet, sil!',
      cancelButtonText: 'İptal'
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        const token = localStorage.getItem('token');

        this.http.delete<any>(`./server/api/ogrenci_sil.php?id=${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).subscribe({
          next: (response) => {
            this.spinner.hide();
            if (response.success) {
              // Öğrenciyi listeden kaldır
              this.students = this.students.filter(student => student.id !== id);
              this.filteredStudents = this.filteredStudents.filter(student => student.id !== id);
              this.toastr.success('Öğrenci başarıyla silindi.');
            } else {
              this.toastr.error(`Hata: ${response.error}`);
            }
          },
          error: (error) => {
            this.spinner.hide();
            this.toastr.error('Öğrenci silinirken bir hata oluştu.');
            console.error('Silme hatası:', error);
          }
        });
      }
    });
  }

  deleteTeacher(id: number): void {
    Swal.fire({
      title: 'Emin misiniz?',
      text: "Bu öğretmeni silmek istediğinizden emin misiniz?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Evet, sil!',
      cancelButtonText: 'İptal'
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        const token = localStorage.getItem('token');

        this.http.delete<any>(`./server/api/ogrenci_sil.php?id=${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).subscribe({
          next: (response) => {
            this.spinner.hide();
            if (response.success) {
              // Öğretmeni listeden kaldır
              this.teachers = this.teachers.filter(teacher => teacher.id !== id);
              this.filteredTeachers = this.filteredTeachers.filter(teacher => teacher.id !== id);
              this.toastr.success('Öğretmen başarıyla silindi.');
            } else {
              this.toastr.error(`Hata: ${response.error}`);
            }
          },
          error: (error) => {
            this.spinner.hide();
            this.toastr.error('Öğretmen silinirken bir hata oluştu.');
            console.error('Silme hatası:', error);
          }
        });
      }
    });
  }

  approveUser(userId: number): void {
    this.spinner.show();
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    this.http.post<any>('./server/api/kullanici_guncelle.php', {
      id: userId,
      aktif: true
    }, { headers }).subscribe({
      next: (response) => {
        this.spinner.hide();
        if (response.success) {
          // Kullanıcıyı bekleyen kullanıcılar listesinden çıkar
          const user = this.pendingUsers.find(u => u.id === userId);
          this.pendingUsers = this.pendingUsers.filter(u => u.id !== userId);

          // Kullanıcıyı uygun listeye ekle
          if (user) {
            user.aktif = true;
            if (user.rutbe === 'ogrenci') {
              this.students.push(user);
              this.filteredStudents = [...this.students];
            } else if (user.rutbe === 'ogretmen') {
              this.teachers.push(user);
              this.filteredTeachers = [...this.teachers];
            }
          }

          this.toastr.success('Kullanıcı başarıyla onaylandı.');
        } else {
          this.toastr.error(`Hata: ${response.error}`);
        }
      },
      error: (error) => {
        this.spinner.hide();
        this.toastr.error('Onaylama işlemi sırasında bir hata oluştu.');
        console.error('Onaylama hatası:', error);
      }
    });
  }

  rejectUser(userId: number): void {
    Swal.fire({
      title: 'Emin misiniz?',
      text: "Bu kullanıcıyı reddetmek istediğinizden emin misiniz?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Evet, reddet!',
      cancelButtonText: 'İptal'
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        const token = localStorage.getItem('token');

        this.http.delete<any>(`./server/api/ogrenci_sil.php?id=${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).subscribe({
          next: (response) => {
            this.spinner.hide();
            if (response.success) {
              // Kullanıcıyı listeden kaldır
              this.pendingUsers = this.pendingUsers.filter(user => user.id !== userId);
              this.toastr.success('Kullanıcı başarıyla reddedildi.');
            } else {
              this.toastr.error(`Hata: ${response.error}`);
            }
          },
          error: (error) => {
            this.spinner.hide();
            this.toastr.error('Kullanıcı reddedilirken bir hata oluştu.');
            console.error('Reddetme hatası:', error);
          }
        });
      }
    });
  }

  filterStudents(): void {
    if (!this.searchText) {
      this.filteredStudents = [...this.students];
      return;
    }

    const search = this.searchText.toLowerCase();
    this.filteredStudents = this.students.filter(student => 
      student.adi_soyadi.toLowerCase().includes(search) ||
      student.email.toLowerCase().includes(search) ||
      (student.okulu && student.okulu.toLowerCase().includes(search)) ||
      (student.sinifi && student.sinifi.toLowerCase().includes(search))
    );
  }

  filterTeachers(): void {
    if (!this.searchText) {
      this.filteredTeachers = [...this.teachers];
      return;
    }

    const search = this.searchText.toLowerCase();
    this.filteredTeachers = this.teachers.filter(teacher => 
      teacher.adi_soyadi.toLowerCase().includes(search) ||
      teacher.email.toLowerCase().includes(search)
    );
  }

  togglePendingUsersView(): void {
    this.showPendingUsers = !this.showPendingUsers;
  }

  editStudent(id: number): void {
    this.router.navigate(['/yonetici/ogrenci-detay', id]);
  }
}