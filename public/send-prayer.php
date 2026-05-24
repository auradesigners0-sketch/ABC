<?php
/**
 * ABC GLOBAL Church — Prayer Request Mail Handler
 * 
 * Sends a beautifully formatted HTML email with the prayer request details.
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

// ====== BUILD HTML EMAIL ======
$subject = "New Prayer Request from $name - ABC GLOBAL Church";

// Determine display values
$phoneDisplay    = $phone ?: 'Not provided';
$emailDisplay    = $email ?: 'Not provided';
$countryDisplay  = $country ?: 'Not provided';
$cityDisplay     = $city ?: 'Not provided';
$callBadge       = ($openToCall === 'yes')
    ? '<span style="display:inline-block;background:#dcfce7;color:#166534;font-size:11px;font-weight:700;padding:2px 10px;border-radius:20px;letter-spacing:0.5px;">YES</span>'
    : '<span style="display:inline-block;background:#fee2e2;color:#991b1b;font-size:11px;font-weight:700;padding:2px 10px;border-radius:20px;letter-spacing:0.5px;">NO</span>';
$submittedDate   = date('d M Y, H:i:s');
$ipAddress       = $_SERVER['REMOTE_ADDR'];

// HTML email body (inline CSS for maximum email client compatibility)
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

<!-- Red top banner -->
<tr>
<td style="background:linear-gradient(135deg,#C41E3A 0%,#8B0000 100%);padding:28px 32px 24px 32px;text-align:center;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
    <td style="text-align:center;">
        <div style="font-size:28px;margin-bottom:4px;">&#128591;</div>
        <div style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:1px;line-height:1.3;">PRAYER REQUEST</div>
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
        From: <span style="color:#C41E3A;font-weight:800;font-size:17px;">{$name}</span>
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
            <div style="width:28px;height:28px;background:#fefce8;border-radius:8px;text-align:center;line-height:28px;font-size:14px;">&#128222;</div>
        </td>
        <td style="padding:10px 12px;vertical-align:top;font-weight:600;color:#6b7280;font-size:12px;">Open to Call</td>
        <td style="padding:10px 12px;vertical-align:top;">{$callBadge}</td>
    </tr>

    </table>
</td>
</tr>

<!-- Prayer Request content -->
<tr>
<td style="padding:8px 32px 24px 32px;">
    <div style="background:#f9fafb;border-radius:12px;border:1px solid #e5e7eb;padding:20px 24px;">
        <div style="font-size:11px;font-weight:700;color:#C41E3A;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px;">Prayer Request</div>
        <div style="font-size:14px;color:#374151;line-height:1.7;white-space:pre-wrap;">{$request}</div>
    </div>
</td>
</tr>

<!-- Scripture quote -->
<tr>
<td style="padding:0 32px 20px 32px;text-align:center;">
    <div style="font-style:italic;color:#9ca3af;font-size:12px;line-height:1.5;padding:12px 0;border-top:1px solid #f3f4f6;">
        &ldquo;For where two or three gather in my name, there am I with them.&rdquo; &mdash; Matthew 18:20
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

// Also create a plain-text fallback for email clients that don't support HTML
$textBody  = "ABC GLOBAL CHURCH - PRAYER REQUEST\n";
$textBody .= "==================================\n\n";
$textBody .= "Name:            $name\n";
$textBody .= "Category:        $category\n";
$textBody .= "Phone:           $phoneDisplay\n";
$textBody .= "Email:           $emailDisplay\n";
$textBody .= "Country:         $countryDisplay\n";
$textBody .= "City/Area:       $cityDisplay\n";
$textBody .= "Open to Call:    " . ($openToCall === 'yes' ? 'Yes' : 'No') . "\n\n";
$textBody .= "PRAYER REQUEST:\n";
$textBody .= wordwrap($request, 60) . "\n\n";
$textBody .= "Submitted: $submittedDate\n";
$textBody .= "IP: $ipAddress\n";

// ====== SEND EMAIL ======
// IMPORTANT: The From email MUST be a real email account that exists on your cPanel server.
// If abcglobal@abcglobal.or.tz does not exist as a mailbox in cPanel, create it first,
// or change this to an email that does exist on your server (e.g. noreply@abcglobal.or.tz).
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
