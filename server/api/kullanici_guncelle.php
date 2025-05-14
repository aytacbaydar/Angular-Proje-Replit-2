
<?php
// Kullanıcı güncelleme API'si
require_once '../config.php';

// CORS başlıkları
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// OPTIONS isteğini yönet (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// POST isteği: Kullanıcıyı güncelle
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Kullanıcıyı doğrula
        $user = authorize();
        
        // Sadece yöneticiler kullanıcı güncelleyebilir
        if ($user['rutbe'] !== 'admin') {
            errorResponse('Bu işlemi gerçekleştirmek için yetkiniz yok', 403);
        }
        
        // JSON verilerini al
        $input = file_get_contents("php://input");
        $data = json_decode($input, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            errorResponse('Geçersiz JSON verisi');
        }
        
        if (!isset($data['id']) || !is_numeric($data['id'])) {
            errorResponse('Geçersiz kullanıcı ID');
        }
        
        $userId = $data['id'];
        $rutbe = isset($data['rutbe']) ? $data['rutbe'] : null;
        $aktif = isset($data['aktif']) ? $data['aktif'] : null;
        
        $conn = getConnection();
        $conn->beginTransaction();
        
        // Veritabanında kullanıcıyı güncelle
        $sql = "UPDATE ogrenciler SET ";
        $params = [];
        
        if ($rutbe !== null) {
            $sql .= "rutbe = :rutbe, ";
            $params[':rutbe'] = $rutbe;
        }
        
        if ($aktif !== null) {
            $sql .= "aktif = :aktif, ";
            $params[':aktif'] = $aktif;
        }
        
        // Sonda kalan virgülü kaldır
        $sql = rtrim($sql, ", ");
        
        $sql .= " WHERE id = :id";
        $params[':id'] = $userId;
        
        $stmt = $conn->prepare($sql);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        if (!$stmt->execute()) {
            throw new PDOException("Kullanıcı güncellenemedi");
        }
        
        $conn->commit();
        
        // Başarılı yanıt
        successResponse(['id' => $userId], 'Kullanıcı başarıyla güncellendi');
        
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
} else {
    errorResponse('Bu endpoint sadece POST metodunu destekler', 405);
}
