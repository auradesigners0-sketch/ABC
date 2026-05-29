<?php
/**
 * ABC GLOBAL Church — Testimony Mail Handler
 * 
 * Sends a beautifully formatted HTML email with the testimony details.
 * Uploaded files are saved to the uploads/ directory and clickable download
 * links are included in the email.
 * 
 * Place this file in the same directory as testimonies.html on your cPanel server.
 * CHANGE the email below to your real email address.
 */

// ====== CONFIGURE YOUR EMAIL HERE ======
$YOUR_EMAIL = 'abcglobalchurch@gmail.com';
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

// ====== HANDLE FILE UPLOADS ======
$uploadedFiles = [];  // Array of ['name' => ..., 'path' => ..., 'url' => ..., 'type' => ..., 'size' => ...]
$uploadDir = __DIR__ . '/uploads/';

// Detect the site's base URL dynamically
$siteUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http')
         . '://' . $_SERVER['HTTP_HOST'];

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
                $fileSizeKB = round($_FILES['picture']['size'] / 1024, 1);
                $uploadedFiles[] = [
                    'name' => $safeName,
                    'path' => $destination,
                    'url'  => $siteUrl . '/uploads/' . $safeName,
                    'type' => 'picture',
                    'size' => $fileSizeKB
                ];
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
                $fileSizeKB = round($_FILES['audio']['size'] / 1024, 1);
                $uploadedFiles[] = [
                    'name' => $safeName,
                    'path' => $destination,
                    'url'  => $siteUrl . '/uploads/' . $safeName,
                    'type' => 'audio',
                    'size' => $fileSizeKB
                ];
            }
        }
    }
}

// ====== BUILD HTML EMAIL ======
$subject = "New Testimony from $name - ABC GLOBAL Church";

// Determine display values
$phoneDisplay    = $phone ?: 'Not provided';
$emailDisplay    = $email ?: 'Not provided';
$countryDisplay  = $country ?: 'Not provided';
$cityDisplay     = $city ?: 'Not provided';
$shareBadge      = ($sharePermission === 'yes')
    ? '<span style="display:inline-block;background:#dcfce7;color:#166534;font-size:11px;font-weight:700;padding:2px 10px;border-radius:20px;letter-spacing:0.5px;">YES - Can Share</span>'
    : '<span style="display:inline-block;background:#fee2e2;color:#991b1b;font-size:11px;font-weight:700;padding:2px 10px;border-radius:20px;letter-spacing:0.5px;">NO - Private</span>';
$submittedDate   = date('d M Y, H:i:s');
$ipAddress       = $_SERVER['REMOTE_ADDR'];

// Build attachments section HTML if files were uploaded
$attachmentsHTML = '';
if (count($uploadedFiles) > 0) {
    $attachmentsHTML .= '
    <tr>
    <td style="padding:0 32px 24px 32px;">
        <div style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:14px;">Attached Files</div>';

    foreach ($uploadedFiles as $i => $file) {
        $icon = ($file['type'] === 'picture') ? '&#128247;' : '&#127925;';
        $typeLabel = ($file['type'] === 'picture') ? 'Photo' : 'Audio';
        $bgColor = ($file['type'] === 'picture') ? '#eff6ff' : '#fefce8';
        $borderColor = ($file['type'] === 'picture') ? '#bfdbfe' : '#fde68a';

        $attachmentsHTML .= '
        <div style="background:' . $bgColor . ';border:1px solid ' . $borderColor . ';border-radius:10px;padding:14px 18px;margin-bottom:10px;display:flex;align-items:center;gap:14px;">
            <div style="width:36px;height:36px;background:#ffffff;border-radius:8px;text-align:center;line-height:36px;font-size:18px;flex-shrink:0;">' . $icon . '</div>
            <div style="flex:1;min-width:0;">
                <div style="font-size:13px;font-weight:600;color:#111827;word-break:break-all;">' . $file['name'] . '</div>
                <div style="font-size:11px;color:#6b7280;margin-top:2px;">' . $typeLabel . ' &bull; ' . $file['size'] . ' KB</div>
            </div>
            <a href="' . $file['url'] . '" target="_blank" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;font-size:11px;font-weight:700;padding:8px 16px;border-radius:8px;white-space:nowrap;flex-shrink:0;">VIEW FILE</a>
        </div>';
    }

    $attachmentsHTML .= '
    </td>
    </tr>';
}

// HTML email body
$htmlBody = <<<HTML
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">

<!-- Outer wrapper -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:30px 10px;">
<tr><td align="center">

<!-- Email container -->
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

<!-- Gold top banner for testimonies -->
<tr>
<td style="background:linear-gradient(135deg,#b45309 0%,#92400e 100%);padding:28px 32px 24px 32px;text-align:center;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
    <td style="text-align:center;">
        <div style="font-size:28px;margin-bottom:4px;">&#10024;</div>
        <div style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:1px;line-height:1.3;">TESTIMONY</div>
        <div style="color:rgba(255,255,255,0.75);font-size:12px;font-weight:500;margin-top:6px;letter-spacing:0.5px;">ABC GLOBAL CHURCH</div>
    </td>
    </tr>
    </table>
</td>
</tr>

<!-- Submitter name banner -->
<tr>
<td style="background:#f9fafb;padding:16px 32px;border-bottom:1px solid #e5e7eb;text-align:center;">
    <div style="font-size:15px;color:#374151;font-weight:600;">
        From: <span style="color:#b45309;font-weight:800;font-size:17px;">{$name}</span>
    </div>
</td>
</tr>

<!-- Details section -->
<tr>
<td style="padding:24px 32px 8px 32px;">
    <div style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:14px;">Submission Details</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#374151;">

    <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;width:36px;">
            <div style="width:28px;height:28px;background:#fef2f2;border-radius:8px;text-align:center;line-height:28px;font-size:14px;">&#128196;</div>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;vertical-align:top;width:120px;font-weight:600;color:#6b7280;font-size:12px;">Category</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;vertical-align:top;font-weight:600;color:#111827;">{$category}</td>
    </tr>

    <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;">
            <div style="width:28px;height:28px;background:#eff6ff;border-radius:8px;text-align:center;line-height:28px;font-size:14px;">&#128222;</div>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;vertical-align:top;font-weight:600;color:#6b7280;font-size:12px;">Phone</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;vertical-align:top;">{$phoneDisplay}</td>
    </tr>

    <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;">
            <div style="width:28px;height:28px;background:#eff6ff;border-radius:8px;text-align:center;line-height:28px;font-size:14px;">&#9993;</div>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;vertical-align:top;font-weight:600;color:#6b7280;font-size:12px;">Email</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;vertical-align:top;"><a href="mailto:{$emailDisplay}" style="color:#2563eb;text-decoration:none;">{$emailDisplay}</a></td>
    </tr>

    <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;">
            <div style="width:28px;height:28px;background:#f0fdf4;border-radius:8px;text-align:center;line-height:28px;font-size:14px;">&#127758;</div>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;vertical-align:top;font-weight:600;color:#6b7280;font-size:12px;">Country</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;vertical-align:top;">{$countryDisplay}</td>
    </tr>

    <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;">
            <div style="width:28px;height:28px;background:#f0fdf4;border-radius:8px;text-align:center;line-height:28px;font-size:14px;">&#128205;</div>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;vertical-align:top;font-weight:600;color:#6b7280;font-size:12px;">City / Area</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;vertical-align:top;">{$cityDisplay}</td>
    </tr>

    <tr>
        <td style="padding:10px 0;vertical-align:top;">
            <div style="width:28px;height:28px;background:#fefce8;border-radius:8px;text-align:center;line-height:28px;font-size:14px;">&#128227;</div>
        </td>
        <td style="padding:10px 12px;vertical-align:top;font-weight:600;color:#6b7280;font-size:12px;">Share Permission</td>
        <td style="padding:10px 12px;vertical-align:top;">{$shareBadge}</td>
    </tr>

    </table>
</td>
</tr>

{$attachmentsHTML}

<!-- Testimony content -->
<tr>
<td style="padding:8px 32px 24px 32px;">
    <div style="background:#fffbeb;border-radius:12px;border:1px solid #fde68a;padding:20px 24px;">
        <div style="font-size:11px;font-weight:700;color:#b45309;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px;">Testimony</div>
        <div style="font-size:14px;color:#374151;line-height:1.7;white-space:pre-wrap;">{$testimony}</div>
    </div>
</td>
</tr>

<!-- Scripture quote -->
<tr>
<td style="padding:0 32px 20px 32px;text-align:center;">
    <div style="font-style:italic;color:#9ca3af;font-size:12px;line-height:1.5;padding:12px 0;border-top:1px solid #f3f4f6;">
        &ldquo;They triumphed over him by the blood of the Lamb and by the word of their testimony.&rdquo; &mdash; Revelation 12:11
    </div>
</td>
</tr>

<!-- Footer -->
<tr>
<td style="background:#111827;padding:20px 32px;text-align:center;">
    <div style="color:#ffffff;font-size:13px;font-weight:700;letter-spacing:1px;margin-bottom:6px;">ABC GLOBAL CHURCH</div>
    <div style="color:rgba(255,255,255,0.5);font-size:11px;line-height:1.6;">
        Submitted: {$submittedDate}<br>
        IP: {$ipAddress}
    </div>
</td>
</tr>

</table>
<!-- /Email container -->

</td></tr>
</table>
<!-- /Outer wrapper -->

</body>
</html>
HTML;

// Plain-text fallback
$textBody  = "ABC GLOBAL CHURCH - TESTIMONY\n";
$textBody .= "==============================\n\n";
$textBody .= "Name:            $name\n";
$textBody .= "Category:        $category\n";
$textBody .= "Phone:           $phoneDisplay\n";
$textBody .= "Email:           $emailDisplay\n";
$textBody .= "Country:         $countryDisplay\n";
$textBody .= "City/Area:       $cityDisplay\n";
$textBody .= "Share Permission: " . ($sharePermission === 'yes' ? 'Yes' : 'No') . "\n";

if (count($uploadedFiles) > 0) {
    $textBody .= "\nATTACHED FILES:\n";
    foreach ($uploadedFiles as $i => $file) {
        $typeLabel = ($file['type'] === 'picture') ? 'Photo' : 'Audio';
        $textBody .= "  " . ($i + 1) . ". " . $file['name'] . " (" . $typeLabel . ", " . $file['size'] . " KB)\n";
        $textBody .= "     Download: " . $file['url'] . "\n";
    }
}

$textBody .= "\nTESTIMONY:\n";
$textBody .= wordwrap($testimony, 60) . "\n\n";
$textBody .= "Submitted: $submittedDate\n";
$textBody .= "IP: $ipAddress\n";

// ====== SEND EMAIL ======
// IMPORTANT: The From email MUST be a real email account that exists on your cPanel server.
$fromEmail = 'abcglobal@abcglobal.or.tz';

// Build the MIME multipart boundary for HTML + plain text
$boundary = md5(time());

$headers  = "From: ABC GLOBAL Church <$fromEmail>\r\n";
$headers .= "Reply-To: " . ($email ?: $YOUR_EMAIL) . "\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/alternative; boundary=\"$boundary\"\r\n";

// MIME multipart body (plain text + HTML)
$mimeBody  = "--$boundary\r\n";
$mimeBody .= "Content-Type: text/plain; charset=UTF-8\r\n";
$mimeBody .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
$mimeBody .= $textBody . "\r\n\r\n";

$mimeBody .= "--$boundary\r\n";
$mimeBody .= "Content-Type: text/html; charset=UTF-8\r\n";
$mimeBody .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
$mimeBody .= $htmlBody . "\r\n\r\n";

$mimeBody .= "--$boundary--";

// Send email with -f envelope sender (required by most cPanel servers)
$mailSent = mail($YOUR_EMAIL, $subject, $mimeBody, $headers, '-f' . $fromEmail);

if ($mailSent) {
    echo json_encode([
        'success' => true, 
        'message' => 'Your testimony has been submitted successfully.',
        'attachments' => count($uploadedFiles)
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
