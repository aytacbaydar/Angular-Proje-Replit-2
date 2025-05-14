
<?php
// Öğrenci silme API'si
require_once '../config.php';

// OPTIONS isteğini işle (CORS için)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// DELETE isteği: Öğrenciyi sil
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    try {
        // Admin yetkisini kontrol et
        $admin = authorizeAdmin();
        
        // URL'den ID parametresini al
        $requestUri = $_SERVER['REQUEST_URI'];
        preg_match('/\/ogrenci_sil\.php\/(\d+)/', $requestUri, $matches);
        
        if (isset($matches[1])) {
            $studentId = intval($matches[1]);
        } else {
            // JSON verilerinden ID'yi al
            $data = json_decode(file_get_contents('php://input'), true);
            $studentId = isset($data['id']) ? intval($data['id']) : 0;
        }
        
        if (!$studentId) {
            errorResponse('Geçerli bir öğrenci ID\'si belirtilmelidir');
        }
        
        // Admin kendisini silemez
        if ($studentId === $admin['id']) {
            errorResponse('Kendi hesabınızı silemezsiniz', 403);
        }
        
        $conn = getConnection();
        
        // Önce öğrenciyi kontrol et
        $stmt = $conn->prepare("SELECT id FROM ogrenciler WHERE id = :id");
        $stmt->bindParam(':id', $studentId);
        $stmt->execute();
        
        if ($stmt->rowCount() === 0) {
            errorResponse('Öğrenci bulunamadı', 404);
        }
        
        // İşlemi transaction içinde yap
        $conn->beginTransaction();
        
        // Önce öğrenci detaylarını sil (foreign key constraint nedeniyle)
        $stmt = $conn->prepare("DELETE FROM ogrenci_bilgileri WHERE ogrenci_id = :id");
        $stmt->bindParam(':id', $studentId);
        $stmt->execute();
        
        // Sonra öğrenciyi sil
        $stmt = $conn->prepare("DELETE FROM ogrenciler WHERE id = :id");
        $stmt->bindParam(':id', $studentId);
        $stmt->execute();
        
        // Transaction'ı tamamla
        $conn->commit();
        
        successResponse(null, 'Öğrenci başarıyla silindi');
        
    } catch (PDOException $e) {
        // Hata durumunda transaction'ı geri al
        if (isset($conn) && $conn->inTransaction()) {
            $conn->rollBack();
        }
        errorResponse('Veritabanı hatası: ' . $e->getMessage(), 500);
    } catch (Exception $e) {
        // Hata durumunda transaction'ı geri al
        if (isset($conn) && $conn->inTransaction()) {
            $conn->rollBack();
        }
        errorResponse('Beklenmeyen bir hata oluştu: ' . $e->getMessage(), 500);
    }
} 
// Diğer HTTP metodlarını reddet
else {
    errorResponse('Bu endpoint sadece DELETE metodunu desteklemektedir', 405);
}
