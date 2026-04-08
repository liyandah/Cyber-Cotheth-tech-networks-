<?php
// Enhanced email sending with Gmail SMTP support
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set content type
header('Content-Type: application/json');

// Enable CORS for local development
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validate required fields
$required_fields = ['name', 'email', 'message', 'service'];
foreach ($required_fields as $field) {
    if (!isset($data[$field]) || empty(trim($data[$field]))) {
        echo json_encode(['success' => false, 'message' => ucfirst($field) . ' is required']);
        exit();
    }
}

// Sanitize input data
$name = htmlspecialchars(trim($data['name']), ENT_QUOTES, 'UTF-8');
$email = filter_var(trim($data['email']), FILTER_SANITIZE_EMAIL);
$phone = isset($data['phone']) ? htmlspecialchars(trim($data['phone']), ENT_QUOTES, 'UTF-8') : 'Not provided';
$service = htmlspecialchars(trim($data['service']), ENT_QUOTES, 'UTF-8');
$message = htmlspecialchars(trim($data['message']), ENT_QUOTES, 'UTF-8');

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit();
}

// Email configuration
$to = 'liyandahhella12@gmail.com';
$subject = 'New Contact Form Submission - CCTN Website';

// Create email content
$email_body = "
New contact form submission received:

Name: $name
Email: $email
Phone: $phone
Service: $service
Message: $message

Submitted: " . date('Y-m-d H:i:s') . "
IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'Unknown') . "
User Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown') . "

---
This message was sent from the CCTN Cloud Development Suite contact form.
Website: https://cybercothtechnetwotks.co.zw
";

// Try multiple email methods
$email_sent = false;
$error_message = '';

// Method 1: Try basic PHP mail() function
if (function_exists('mail')) {
    $headers = array(
        'From' => "CCTN Website <noreply@cybercothtechnetwotks.co.zw>",
        'Reply-To' => $email,
        'X-Mailer' => 'PHP/' . phpversion(),
        'Content-Type' => 'text/plain; charset=UTF-8'
    );
    
    $headers_string = '';
    foreach ($headers as $key => $value) {
        $headers_string .= "$key: $value\r\n";
    }
    
    $email_sent = mail($to, $subject, $email_body, $headers_string);
    
    if (!$email_sent) {
        $error_message = 'PHP mail() function failed';
    }
}

// Method 2: Try Gmail SMTP (if PHPMailer is available)
if (!$email_sent && class_exists('PHPMailer\PHPMailer\PHPMailer')) {
    try {
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        
        // Server settings
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'liyandahhella12@gmail.com'; // Your Gmail address
        $mail->Password = 'your-app-password'; // Gmail App Password (not regular password)
        $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;
        
        // Recipients
        $mail->setFrom('noreply@cybercothtechnetwotks.co.zw', 'CCTN Website');
        $mail->addAddress($to);
        $mail->addReplyTo($email, $name);
        
        // Content
        $mail->isHTML(false);
        $mail->Subject = $subject;
        $mail->Body = $email_body;
        
        $mail->send();
        $email_sent = true;
    } catch (Exception $e) {
        $error_message = 'Gmail SMTP failed: ' . $e->getMessage();
    }
}

// Method 3: Try cURL with Gmail API (alternative method)
if (!$email_sent) {
    // This would require Gmail API setup - placeholder for now
    $error_message = 'All email methods failed';
}

// Log the attempt
$log_entry = date('Y-m-d H:i:s') . " - ";
if ($email_sent) {
    $log_entry .= "SUCCESS: Email sent to $to from $email ($name)\n";
} else {
    $log_entry .= "FAILED: $error_message - from $email ($name)\n";
}
file_put_contents('contact_log.txt', $log_entry, FILE_APPEND | LOCK_EX);

// Return response
if ($email_sent) {
    echo json_encode([
        'success' => true, 
        'message' => 'Email sent successfully to liyandahhella12@gmail.com!'
    ]);
} else {
    echo json_encode([
        'success' => false, 
        'message' => 'Email sending failed: ' . $error_message . '. Please use the manual method below.'
    ]);
}
?>
