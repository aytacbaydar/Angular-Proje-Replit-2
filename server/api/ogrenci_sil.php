
<?php
// Öğrenci silme API'si
require_once '../config.php';

// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// OPTIONS isteklerini işle (CORS pre-flight için)
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
        $parts = explode('/', $requestUri);
        $studentId = intval(end($parts));
        
        // ID yoksa veya geçersizse hata döndür
        if (!$studentId) {
            errorResponse('Geçerli bir öğrenci ID\'si belirtilmelidir');
        }
        
        // Admin kendisini silemez
        if ($studentId === $admin['id']) {
            errorResponse('Kendi hesabınızı silemezsiniz', 403);
        }
        
        $conn = getConnection();
        
        // Önce öğrenciyi kontrol et
        $stmt = $conn->prepare("SELECT id, rutbe FROM ogrenciler WHERE id = :id");
        $stmt->bindParam(':id', $studentId);
        $stmt->execute();
        
        if ($stmt->rowCount() === 0) {
            errorResponse('Kullanıcı bulunamadı', 404);
        }
        
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // İşlemi transaction içinde yap
        $conn->beginTransaction();
        
        // Kullanıcının türüne göre tabloları seç
        if ($user['rutbe'] === 'ogrenci') {
            // Önce öğrenci detaylarını sil (foreign key constraint nedeniyle)
            $stmt = $conn->prepare("DELETE FROM ogrenci_bilgileri WHERE ogrenci_id = :id");
            $stmt->bindParam(':id', $studentId);
            $stmt->execute();
        } else if ($user['rutbe'] === 'ogretmen') {
            // Eğer öğretmen bilgileri için bir tablo varsa, önce onu temizle
            $stmt = $conn->prepare("DELETE FROM ogretmen_bilgileri WHERE ogretmen_id = :id");
            $stmt->bindParam(':id', $studentId);
            $stmt->execute();
        }
        
        // Sonra kullanıcıyı sil
        $stmt = $conn->prepare("DELETE FROM ogrenciler WHERE id = :id");
        $stmt->bindParam(':id', $studentId);
        $stmt->execute();
        
        $conn->commit();
        
        successResponse(null, 'Kullanıcı başarıyla silindi');
        
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
