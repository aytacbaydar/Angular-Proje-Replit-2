
<?php
// Öğrenci silme API'si
require_once '../config.php';

// DELETE isteği: Öğrenciyi sil
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    try {
        // Kullanıcıyı doğrula
        $user = authorize();
        
        // Sadece yöneticiler öğrenci silebilir
        if ($user['rutbe'] !== 'admin') {
            errorResponse('Bu işlemi gerçekleştirmek için yetkiniz yok', 403);
        }
        
        // URL'den öğrenci ID'sini al
        $uri = $_SERVER['REQUEST_URI'];
        $id = null;
        
        // URL'den ID'yi çıkar - örnek: /ogrenci_sil.php/123
        if (preg_match('/\/(\d+)$/', $uri, $matches)) {
            $id = $matches[1];
        }
        
        if (!$id) {
            errorResponse('Öğrenci ID bulunamadı', 400);
        }
        
        $conn = getConnection();
        
        // İşlem başlangıcı - atomik işlem için
        $conn->beginTransaction();
        
        // Önce öğrenci bilgilerini sil
        $stmt = $conn->prepare("DELETE FROM ogrenci_bilgileri WHERE ogrenci_id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        // Sonra öğrenciyi sil
        $stmt = $conn->prepare("DELETE FROM ogrenciler WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        // İşlemi tamamla
        $conn->commit();
        
        successResponse(null, 'Öğrenci başarıyla silindi');
        
    } catch (PDOException $e) {
        // Hata durumunda işlemi geri al
        if (isset($conn)) {
            $conn->rollBack();
        }
        errorResponse('Veritabanı hatası: ' . $e->getMessage(), 500);
    } catch (Exception $e) {
        errorResponse('Beklenmeyen bir hata oluştu: ' . $e->getMessage(), 500);
    }
}
// Diğer HTTP metodlarını reddet
else {
    errorResponse('Bu endpoint sadece DELETE metodunu desteklemektedir', 405);
}
