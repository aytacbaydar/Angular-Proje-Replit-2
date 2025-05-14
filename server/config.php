<?php
// Veritabanı bağlantı bilgileri
$db_host = 'localhost';
$db_name = 'kimyaogreniyorum';
$db_user = 'root';
$db_pass = '';

// Hata raporlama
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Oturum başlat
session_start();

// Zaman dilimi ayarı
date_default_timezone_set('Europe/Istanbul');

// Karakter seti
header('Content-Type: text/html; charset=utf-8');

// CORS Başlıkları
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE, PUT, PATCH");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// OPTIONS isteği işlemi
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Veritabanı Bağlantısı
try {
    $host = $db_host;
    $dbname = $db_name;
    $username = $db_user;
    $password = $db_pass;

    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Veritabanı bağlantı hatası: ' . $e->getMessage()
    ]);
    exit;
}

// Yardımcı Fonksiyonlar
function cleanInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Oturum yetkilendirme
function authorize() {
    if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Yetkilendirme gerekli']);
        exit();
    }

    $auth = $_SERVER['HTTP_AUTHORIZATION'];
    $token = str_replace('Bearer ', '', $auth);
    
    if (empty($token)) {
        http_response_code(401);
        echo json_encode(['error' => 'Geçersiz token']);
        exit();
    }

    // Token doğrulama
    try {
        global $conn;
        $stmt = $conn->prepare("SELECT id, adi_soyadi, email, rutbe FROM ogrenciler WHERE MD5(CONCAT(id, email, sifre)) = :token AND aktif = TRUE");
        $stmt->bindParam(':token', $token);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Geçersiz token veya hesap aktif değil']);
            exit();
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Veritabanı hatası: ' . $e->getMessage()]);
        exit();
    }
}

// Admin yetkisini kontrol
function authorizeAdmin() {
    $user = authorize();
    if ($user['rutbe'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Bu işlem için yönetici yetkileri gerekiyor']);
        exit();
    }
    return $user;
}

// JSON verilerini al
function getJsonData() {
    $data = json_decode(file_get_contents("php://input"), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['error' => 'Geçersiz JSON verisi']);
        exit();
    }
    return $data;
}

// Hata yanıtı
function errorResponse($message, $statusCode = 400) {
    http_response_code($statusCode);
    echo json_encode(['error' => $message]);
    exit();
}

// Başarı yanıtı
function successResponse($data = null, $message = null) {
    $response = ['success' => true];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    if ($message !== null) {
        $response['message'] = $message;
    }
    
    echo json_encode($response);
    exit();
}