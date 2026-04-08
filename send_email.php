<?php
// Enable error reporting for debugging
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
$from_email = 'noreply@cybercothtechnetwotks.co.zw';
$from_name = 'CCTN Website Contact Form';

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

// Email headers
$headers = array(
    'From' => "$from_name <$from_email>",
    'Reply-To' => $email,
    'X-Mailer' => 'PHP/' . phpversion(),
    'Content-Type' => 'text/plain; charset=UTF-8'
);

// Convert headers array to string
$headers_string = '';
foreach ($headers as $key => $value) {
    $headers_string .= "$key: $value\r\n";
}

// Send email
$mail_sent = mail($to, $subject, $email_body, $headers_string);

if ($mail_sent) {
    // Log successful submission
    $log_entry = date('Y-m-d H:i:s') . " - Email sent successfully to $to from $email ($name)\n";
    file_put_contents('contact_log.txt', $log_entry, FILE_APPEND | LOCK_EX);
    
    echo json_encode([
        'success' => true, 
        'message' => 'Email sent successfully to liyandahhella12@gmail.com!'
    ]);
} else {
    // Log error
    $log_entry = date('Y-m-d H:i:s') . " - Failed to send email to $to from $email ($name)\n";
    file_put_contents('contact_log.txt', $log_entry, FILE_APPEND | LOCK_EX);
    
    echo json_encode([
        'success' => false, 
        'message' => 'Failed to send email. Please try again or contact us directly.'
    ]);
}
?>
