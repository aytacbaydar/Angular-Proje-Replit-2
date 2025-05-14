
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
    
    // 1. TEMEL BİLGİLERİ GÜNCELLE
    if (isset($input['temel_bilgiler']) && !empty($input['temel_bilgiler'])) {
        $temel = $input['temel_bilgiler'];
        $params = [];
        $sql = "UPDATE ogrenciler SET ";
        
        if (isset($temel['ad']) && !empty($temel['ad'])) {
            $sql .= "ad = ?, ";
            $params[] = $temel['ad'];
        }
        
        if (isset($temel['soyad']) && !empty($temel['soyad'])) {
            $sql .= "soyad = ?, ";
            $params[] = $temel['soyad'];
        }
        
        if (isset($temel['email']) && !empty($temel['email'])) {
            $sql .= "email = ?, ";
            $params[] = $temel['email'];
        }
        
        if (isset($temel['telefon']) && !empty($temel['telefon'])) {
            $sql .= "telefon = ?, ";
            $params[] = $temel['telefon'];
        }
        
        if (isset($temel['sinif']) && !empty($temel['sinif'])) {
            $sql .= "sinif = ?, ";
            $params[] = $temel['sinif'];
        }
        
        if (isset($temel['sifre']) && !empty($temel['sifre'])) {
            $hash = password_hash($temel['sifre'], PASSWORD_DEFAULT);
            $sql .= "sifre = ?, ";
            $params[] = $hash;
        }
        
        // Son virgülü kaldır
        $sql = rtrim($sql, ", ");
        
        // WHERE koşulu ekle
        $sql .= " WHERE id = ?";
        $params[] = $ogrenci_id;
        
        if (count($params) > 1) { // En az bir alan güncelleniyorsa
            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
        }
    }
   
    // 2. DETAY BİLGİLERİ GÜNCELLE
    if (isset($input['detay_bilgiler']) && !empty($input['detay_bilgiler'])) {
        $detay = $input['detay_bilgiler'];
        
        // Önce detay kaydı var mı kontrol et
        $check = $conn->prepare("SELECT id FROM ogrenci_detay WHERE ogrenci_id = ?");
        $check->execute([$ogrenci_id]);
        
        if ($check->rowCount() > 0) {
            // Güncelle
            $sql = "UPDATE ogrenci_detay SET ";
            $params = [];
            
            if (isset($detay['dogum_tarihi'])) {
                $sql .= "dogum_tarihi = ?, ";
                $params[] = $detay['dogum_tarihi'];
            }
            
            if (isset($detay['cinsiyet'])) {
                $sql .= "cinsiyet = ?, ";
                $params[] = $detay['cinsiyet'];
            }
            
            if (isset($detay['adres'])) {
                $sql .= "adres = ?, ";
                $params[] = $detay['adres'];
            }
            
            if (isset($detay['il'])) {
                $sql .= "il = ?, ";
                $params[] = $detay['il'];
            }
            
            if (isset($detay['ilce'])) {
                $sql .= "ilce = ?, ";
                $params[] = $detay['ilce'];
            }
            
            if (isset($detay['veli_ad_soyad'])) {
                $sql .= "veli_ad_soyad = ?, ";
                $params[] = $detay['veli_ad_soyad'];
            }
            
            if (isset($detay['veli_telefon'])) {
                $sql .= "veli_telefon = ?, ";
                $params[] = $detay['veli_telefon'];
            }
            
            // Son virgülü kaldır
            $sql = rtrim($sql, ", ");
            
            // WHERE koşulu ekle
            $sql .= " WHERE ogrenci_id = ?";
            $params[] = $ogrenci_id;
            
            if (count($params) > 1) { // En az bir alan güncelleniyorsa
                $stmt = $conn->prepare($sql);
                $stmt->execute($params);
            }
        } else {
            // Yeni kayıt oluştur
            $fields = ["ogrenci_id"];
            $values = [$ogrenci_id];
            $placeholders = ["?"];
            
            if (isset($detay['dogum_tarihi'])) {
                $fields[] = "dogum_tarihi";
                $values[] = $detay['dogum_tarihi'];
                $placeholders[] = "?";
            }
            
            if (isset($detay['cinsiyet'])) {
                $fields[] = "cinsiyet";
                $values[] = $detay['cinsiyet'];
                $placeholders[] = "?";
            }
            
            if (isset($detay['adres'])) {
                $fields[] = "adres";
                $values[] = $detay['adres'];
                $placeholders[] = "?";
            }
            
            if (isset($detay['il'])) {
                $fields[] = "il";
                $values[] = $detay['il'];
                $placeholders[] = "?";
            }
            
            if (isset($detay['ilce'])) {
                $fields[] = "ilce";
                $values[] = $detay['ilce'];
                $placeholders[] = "?";
            }
            
            if (isset($detay['veli_ad_soyad'])) {
                $fields[] = "veli_ad_soyad";
                $values[] = $detay['veli_ad_soyad'];
                $placeholders[] = "?";
            }
            
            if (isset($detay['veli_telefon'])) {
                $fields[] = "veli_telefon";
                $values[] = $detay['veli_telefon'];
                $placeholders[] = "?";
            }
            
            $sql = "INSERT INTO ogrenci_detay (" . implode(", ", $fields) . ") VALUES (" . implode(", ", $placeholders) . ")";
            $stmt = $conn->prepare($sql);
            $stmt->execute($values);
        }
    }
    
    // 3. PROFİL FOTOĞRAFI GÜNCELLE
    if (isset($input['avatar']) && !empty($input['avatar'])) {
        $avatar = $input['avatar'];
        
        // Base64 kodunu çıkar
        list($type, $data) = explode(';', $avatar);
        list(, $data) = explode(',', $data);
        $data = base64_decode($data);
        
        // Hedef klasörü kontrol et ve oluştur
        $uploadDir = "../uploads/avatars/";
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        // Dosya adı oluştur
        $fileName = "avatar_" . $ogrenci_id . "_" . time() . ".png";
        $filePath = $uploadDir . $fileName;
        
        // Dosyayı kaydet
        file_put_contents($filePath, $data);
        
        // Veritabanını güncelle
        $sql = "UPDATE ogrenciler SET avatar = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$fileName, $ogrenci_id]);
    }
    
    // Başarılı yanıt döndür
    echo json_encode(['success' => true, 'message' => 'Profil başarıyla güncellendi']);
} else {
    // Hatalı istek metodu
    echo json_encode(['success' => false, 'message' => 'Geçersiz istek metodu']);
}
