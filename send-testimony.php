<?php
/**
 * ABC GLOBAL Church — Testimony Mail Handler
 * 
 * Place this file in the same directory as testimonies.html on your cPanel server.
 * CHANGE the email below to your real email address.
 */

// ====== CONFIGURE YOUR EMAIL HERE ======
$YOUR_EMAIL = 'auradesigners0@gmail.com';
// ========================================

header('Content-Type: application/json');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get and sanitize input
$name            = sanitize($_POST['name'] ?? '');
$category        = sanitize($_POST['category'] ?? '');
$phone           = sanitize($_POST['phone'] ?? '');
$email           = sanitize($_POST['email'] ?? '');
$country         = sanitize($_POST['country'] ?? '');
$city            = sanitize($_POST['city'] ?? '');
$testimony       = sanitize($_POST['testimony'] ?? '');
$sharePermission = sanitize($_POST['sharePermission'] ?? 'no');

// Validate required fields
if (empty($name) || empty($category) || empty($testimony)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please fill out all required fields.']);
    exit;
}

// Anti-spam: check honeypot field
if (!empty($_POST['website'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Spam detected.']);
    exit;
}

// Rate limiting: max 3 submissions per IP per 15 minutes
session_start();
$now = time();
if (!isset($_SESSION['testimony_submissions'])) {
    $_SESSION['testimony_submissions'] = [];
}
$_SESSION['testimony_submissions'] = array_filter($_SESSION['testimony_submissions'], function($t) use ($now) {
    return ($now - $t) < 900;
});
if (count($_SESSION['testimony_submissions']) >= 3) {
    http_response_code(429);
    echo json_encode(['success' => false, 'message' => 'Too many submissions. Please try again later.']);
    exit;
}
$_SESSION['testimony_submissions'][] = $now;

// Handle file uploads
$attachments = [];
$uploadDir = __DIR__ . '/uploads/';

if (!empty($_FILES['picture']['name']) && $_FILES['picture']['error'] === UPLOAD_ERR_OK) {
    $fileInfo = pathinfo($_FILES['picture']['name']);
    $ext = strtolower($fileInfo['extension']);
    
    // Only allow image files
    $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (in_array($ext, $allowed)) {
        // Max 5MB
        if ($_FILES['picture']['size'] <= 5 * 1024 * 1024) {
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
            $safeName = 'testimony_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
            $destination = $uploadDir . $safeName;
            if (move_uploaded_file($_FILES['picture']['tmp_name'], $destination)) {
                $attachments[] = $destination;
            }
        }
    }
}

if (!empty($_FILES['audio']['name']) && $_FILES['audio']['error'] === UPLOAD_ERR_OK) {
    $fileInfo = pathinfo($_FILES['audio']['name']);
    $ext = strtolower($fileInfo['extension']);
    
    // Only allow audio files
    $allowed = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'wma', 'flac'];
    if (in_array($ext, $allowed)) {
        // Max 10MB
        if ($_FILES['audio']['size'] <= 10 * 1024 * 1024) {
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
            $safeName = 'testimony_audio_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
            $destination = $uploadDir . $safeName;
            if (move_uploaded_file($_FILES['audio']['tmp_name'], $destination)) {
                $attachments[] = $destination;
            }
        }
    }
}

// Build email content
$subject = "✨ New Testimony from $name - ABC GLOBAL Church";

$emailBody  = "═══════════════════════════════════════\n";
$emailBody .= "   ABC GLOBAL CHURCH — TESTIMONY\n";
$emailBody .= "═══════════════════════════════════════\n\n";

$emailBody .= "📋 Name:              $name\n";
$emailBody .= "📂 Category:          $category\n";
$emailBody .= "📞 Phone:             " . ($phone ?: 'Not provided') . "\n";
$emailBody .= "📧 Email:             " . ($email ?: 'Not provided') . "\n";
$emailBody .= "🌍 Country:           " . ($country ?: 'Not provided') . "\n";
$emailBody .= "📍 City/Area:         " . ($city ?: 'Not provided') . "\n";
$emailBody .= "📢 Share Permission:  " . ($sharePermission === 'yes' ? 'Yes ✅' : 'No') . "\n";

if (count($attachments) > 0) {
    $emailBody .= "📎 Attachments:       " . count($attachments) . " file(s) saved on server\n";
    foreach ($attachments as $i => $att) {
        $emailBody .= "   " . ($i + 1) . ". " . basename($att) . "\n";
    }
}

$emailBody .= "\n───────────────────────────────────────\n";
$emailBody .= "   TESTIMONY\n";
$emailBody .= "───────────────────────────────────────\n";
$emailBody .= wordwrap($testimony, 60) . "\n";
$emailBody .= "───────────────────────────────────────\n\n";

$emailBody .= "Submitted: " . date('d M Y, H:i:s') . "\n";
$emailBody .= "IP Address: " . $_SERVER['REMOTE_ADDR'] . "\n";

// Email headers
$headers  = "From: ABC GLOBAL Church <abcglobal@abcglobal.or.tz>\r\n";
$headers .= "Reply-To: " . ($email ?: $YOUR_EMAIL) . "\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// Send email
$mailSent = mail($YOUR_EMAIL, $subject, $emailBody, $headers);

if ($mailSent) {
    echo json_encode([
        'success' => true, 
        'message' => 'Your testimony has been submitted successfully.',
        'attachments' => count($attachments)
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to send. Please try again later.']);
}

// Sanitize function
function sanitize($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}
?>
