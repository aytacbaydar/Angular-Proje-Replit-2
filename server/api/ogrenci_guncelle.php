<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// OPTIONS isteğine hemen yanıt ver
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config.php';

// Veritabanı bağlantısı
$conn = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8", $db_user, $db_pass);
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// POST isteği kontrolü
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);

    if (!isset($input['ogrenci_id']) || empty($input['ogrenci_id'])) {
        echo json_encode(['success' => false, 'message' => 'Öğrenci ID gerekli!']);
        exit;
    }

    $ogrenci_id = $input['ogrenci_id'];

    try {
        // Temel bilgileri güncelle
        if (isset($input['temel_bilgiler'])) {
            $temel = $input['temel_bilgiler'];
            $params = [];
            $sql = "UPDATE ogrenciler SET ";

            if (isset($temel['ad'])) {
                $sql .= "ad = ?, ";
                $params[] = $temel['ad'];
            }

            if (isset($temel['soyad'])) {
                $sql .= "soyad = ?, ";
                $params[] = $temel['soyad'];
            }

            if (isset($temel['email'])) {
                $sql .= "email = ?, ";
                $params[] = $temel['email'];
            }

            // Diğer alanları da ekleyin

            // Son virgülü kaldır
            $sql = rtrim($sql, ", ");

            // WHERE koşulu ekle
            $sql .= " WHERE id = ?";
            $params[] = $ogrenci_id;

            if (count($params) > 1) {
                $stmt = $conn->prepare($sql);
                $stmt->execute($params);
            }
        }

        // Güncellenmiş öğrenci bilgilerini al
        $stmt = $conn->prepare("SELECT * FROM ogrenciler WHERE id = ?");
        $stmt->execute([$ogrenci_id]);
        $ogrenci = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true, 
            'message' => 'Öğrenci bilgileri güncellendi',
            'data' => $ogrenci
        ]);

    } catch (PDOException $e) {
        echo json_encode([
            'success' => false, 
            'message' => 'Güncelleme sırasında hata oluştu: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Geçersiz istek metodu']);
}