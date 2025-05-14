
<?php
// Öğrenci silme API'si
require_once '../config.php';

// DELETE isteği: Öğrenciyi sil
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    try {
        // Admin yetkisini kontrol et
        $admin = authorizeAdmin();
        
        // URL'den ID parametresini al
        $requestUri = $_SERVER['REQUEST_URI'];
        $parts = explode('/', $requestUri);
        $studentId = intval(end($parts));
        
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
        
        $conn->commit();
        
        successResponse(null, 'Öğrenci başarıyla silindi');
        
    } catch (PDOException $e) {
        if (isset($conn) && $conn->inTransaction()) {
            $conn->rollBack();
        }
        errorResponse('Veritabanı hatası: ' . $e->getMessage(), 500);
    } catch (Exception $e) {
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
?>
