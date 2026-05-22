<?php
/**
 * ABC GLOBAL Church — Prayer Request Mail Handler
 * 
 * Place this file in the same directory as prayer.html on your cPanel server.
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
$name        = sanitize($_POST['name'] ?? '');
$category    = sanitize($_POST['category'] ?? '');
$phone       = sanitize($_POST['phone'] ?? '');
$email       = sanitize($_POST['email'] ?? '');
$country     = sanitize($_POST['country'] ?? '');
$city        = sanitize($_POST['city'] ?? '');
$request     = sanitize($_POST['request'] ?? '');
$openToCall  = sanitize($_POST['openToCall'] ?? 'no');

// Validate required fields
if (empty($name) || empty($category) || empty($request)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please fill out all required fields.']);
    exit;
}

// Anti-spam: check honeypot field (hidden field that bots fill)
if (!empty($_POST['website'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Spam detected.']);
    exit;
}

// Rate limiting: max 3 submissions per IP per 15 minutes
session_start();
$now = time();
if (!isset($_SESSION['prayer_submissions'])) {
    $_SESSION['prayer_submissions'] = [];
}
// Remove entries older than 15 minutes
$_SESSION['prayer_submissions'] = array_filter($_SESSION['prayer_submissions'], function($t) use ($now) {
    return ($now - $t) < 900;
});
if (count($_SESSION['prayer_submissions']) >= 3) {
    http_response_code(429);
    echo json_encode(['success' => false, 'message' => 'Too many submissions. Please try again later.']);
    exit;
}
$_SESSION['prayer_submissions'][] = $now;

// Build email content
$subject = "🙏 New Prayer Request from $name - ABC GLOBAL Church";

$emailBody  = "═══════════════════════════════════════\n";
$emailBody .= "   ABC GLOBAL CHURCH — PRAYER REQUEST\n";
$emailBody .= "═══════════════════════════════════════\n\n";

$emailBody .= "📋 Name:              $name\n";
$emailBody .= "📂 Category:          $category\n";
$emailBody .= "📞 Phone:             " . ($phone ?: 'Not provided') . "\n";
$emailBody .= "📧 Email:             " . ($email ?: 'Not provided') . "\n";
$emailBody .= "🌍 Country:           " . ($country ?: 'Not provided') . "\n";
$emailBody .= "📍 City/Area:         " . ($city ?: 'Not provided') . "\n";
$emailBody .= "📞 Open to Call:      " . ($openToCall === 'yes' ? 'Yes ✅' : 'No') . "\n";

$emailBody .= "\n───────────────────────────────────────\n";
$emailBody .= "   PRAYER REQUEST\n";
$emailBody .= "───────────────────────────────────────\n";
$emailBody .= wordwrap($request, 60) . "\n";
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
    echo json_encode(['success' => true, 'message' => 'Your prayer request has been sent.']);
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
