
<?php
// Kullanıcı güncelleme API'si
require_once '../config.php';

// OPTIONS isteğini işle (CORS için)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// PUT isteği: Kullanıcı bilgilerini güncelle
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    try {
        // Kullanıcıyı doğrula
        $user = authorize();
        
        // Sadece yöneticiler kullanıcı bilgilerini güncelleyebilir
        if ($user['rutbe'] !== 'admin') {
            errorResponse('Bu işlemi gerçekleştirmek için yetkiniz yok', 403);
        }
        
        // Gelen JSON verisini al
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['id'])) {
            errorResponse('Kullanıcı ID gerekli', 400);
        }
        
        $userId = $data['id'];
        
        $conn = getConnection();
        
        // Güncellenecek alanları belirle
        $updateFields = [];
        $params = [':id' => $userId];
        
        // Aktiflik durumu
        if (isset($data['aktif'])) {
            $updateFields[] = "aktif = :aktif";
            $params[':aktif'] = $data['aktif'] ? 1 : 0;
        }
        
        // Kullanıcı adı soyad güncelleme
        if (isset($data['adi_soyadi'])) {
            $updateFields[] = "adi_soyadi = :adi_soyadi";
            $params[':adi_soyadi'] = $data['adi_soyadi'];
        }
        
        // Email güncelleme
        if (isset($data['email'])) {
            $updateFields[] = "email = :email";
            $params[':email'] = $data['email'];
        }
        
        // Telefon güncelleme
        if (isset($data['cep_telefonu'])) {
            $updateFields[] = "cep_telefonu = :cep_telefonu";
            $params[':cep_telefonu'] = $data['cep_telefonu'];
        }
        
        // Rütbe güncelleme
        if (isset($data['rutbe'])) {
            $updateFields[] = "rutbe = :rutbe";
            $params[':rutbe'] = $data['rutbe'];
        }
        
        // Şifre güncelleme
        if (isset($data['sifre']) && !empty($data['sifre'])) {
            $updateFields[] = "sifre = :sifre";
            $params[':sifre'] = password_hash($data['sifre'], PASSWORD_DEFAULT);
        }
        
        // Güncelleme yapılacak alan varsa SQL sorgusunu oluştur ve çalıştır
        if (!empty($updateFields)) {
            $sql = "UPDATE ogrenciler SET " . implode(', ', $updateFields) . " WHERE id = :id";
            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
            
            successResponse(null, 'Kullanıcı bilgileri başarıyla güncellendi');
        } else {
            errorResponse('Güncellenecek veri bulunamadı', 400);
        }
        
    } catch (PDOException $e) {
        errorResponse('Veritabanı hatası: ' . $e->getMessage(), 500);
    } catch (Exception $e) {
        errorResponse('Beklenmeyen bir hata oluştu: ' . $e->getMessage(), 500);
    }
}
// Diğer HTTP metodlarını reddet
else {
    errorResponse('Bu endpoint sadece PUT metodunu desteklemektedir', 405);
}
