
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config.php';

// Veritabanı bağlantısı
$conn = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8", $db_user, $db_pass);
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Öğrenci ID kontrolü
        if (isset($_GET['id']) && !empty($_GET['id'])) {
            $ogrenci_id = $_GET['id'];
            
            // Temel bilgileri al
            $sql = "SELECT * FROM ogrenciler WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->execute([$ogrenci_id]);
            $ogrenci = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$ogrenci) {
                echo json_encode(['success' => false, 'message' => 'Öğrenci bulunamadı']);
                exit;
            }
            
            // Detay bilgilerini al
            $detay_sql = "SELECT * FROM ogrenci_detay WHERE ogrenci_id = ?";
            $detay_stmt = $conn->prepare($detay_sql);
            $detay_stmt->execute([$ogrenci_id]);
            $detay = $detay_stmt->fetch(PDO::FETCH_ASSOC);
            
            // Öğrencinin detay bilgilerini ekle
            $ogrenci['detay'] = $detay ?: null;
            
            // Avatar URL'sini düzenle
            if ($ogrenci['avatar']) {
                $ogrenci['avatar_url'] = '/server/uploads/avatars/' . $ogrenci['avatar'];
            }
            
            // Cevap döndür
            echo json_encode(['success' => true, 'data' => $ogrenci]);
        } else {
            // Tüm öğrencileri listele
            $sql = "SELECT id, ad, soyad, email, telefon, sinif, avatar, 
                    ogrenci_no, aktif, kayit_tarihi, son_giris_tarihi 
                    FROM ogrenciler ORDER BY id DESC";
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $ogrenciler = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Avatar URL'lerini düzenle
            foreach ($ogrenciler as &$ogrenci) {
                if ($ogrenci['avatar']) {
                    $ogrenci['avatar_url'] = '/server/uploads/avatars/' . $ogrenci['avatar'];
                }
            }
            
            echo json_encode(['success' => true, 'data' => $ogrenciler]);
        }
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Veritabanı hatası: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Geçersiz istek metodu']);
}
