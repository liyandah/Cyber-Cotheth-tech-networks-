<?php
// Comprehensive Email Diagnostics Tool
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<!DOCTYPE html><html><head><title>Email Diagnostics - CCTN Website</title>";
echo "<style>body{font-family:Arial,sans-serif;max-width:1000px;margin:0 auto;padding:20px;background:#f5f5f5;}";
echo ".card{background:white;padding:20px;margin:10px 0;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1);}";
echo ".success{color:#28a745;font-weight:bold;}";
echo ".error{color:#dc3545;font-weight:bold;}";
echo ".warning{color:#ffc107;font-weight:bold;}";
echo ".info{color:#17a2b8;font-weight:bold;}";
echo "pre{background:#f8f9fa;padding:15px;border-radius:5px;overflow-x:auto;}";
echo "table{border-collapse:collapse;width:100%;}";
echo "th,td{border:1px solid #ddd;padding:8px;text-align:left;}";
echo "th{background-color:#f2f2f2;}</style></head><body>";

echo "<h1>🔍 Email Diagnostics for CCTN Website</h1>";

// 1. PHP Mail Function Check
echo "<div class='card'>";
echo "<h2>1. PHP Mail Function Status</h2>";

if (function_exists('mail')) {
    echo "<p class='success'>✅ PHP mail() function is available</p>";
    
    // Test mail function
    $test_result = mail('test@example.com', 'Test', 'Test message', 'From: test@example.com');
    if ($test_result) {
        echo "<p class='success'>✅ mail() function executed successfully</p>";
    } else {
        echo "<p class='error'>❌ mail() function failed to execute</p>";
    }
} else {
    echo "<p class='error'>❌ PHP mail() function is NOT available</p>";
    echo "<p class='info'>💡 Contact your hosting provider to enable PHP mail function</p>";
}

echo "</div>";

// 2. Server Information
echo "<div class='card'>";
echo "<h2>2. Server Information</h2>";
echo "<table>";
echo "<tr><th>Setting</th><th>Value</th></tr>";
echo "<tr><td>PHP Version</td><td>" . phpversion() . "</td></tr>";
echo "<tr><td>Server Software</td><td>" . ($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown') . "</td></tr>";
echo "<tr><td>Operating System</td><td>" . php_uname() . "</td></tr>";
echo "<tr><td>Server Name</td><td>" . ($_SERVER['SERVER_NAME'] ?? 'Unknown') . "</td></tr>";
echo "<tr><td>Document Root</td><td>" . ($_SERVER['DOCUMENT_ROOT'] ?? 'Unknown') . "</td></tr>";
echo "</table>";
echo "</div>";

// 3. PHP Configuration
echo "<div class='card'>";
echo "<h2>3. PHP Email Configuration</h2>";
echo "<table>";
echo "<tr><th>Setting</th><th>Value</th><th>Status</th></tr>";

$mail_settings = [
    'sendmail_path' => ini_get('sendmail_path'),
    'SMTP' => ini_get('SMTP'),
    'smtp_port' => ini_get('smtp_port'),
    'sendmail_from' => ini_get('sendmail_from'),
    'mail.add_x_header' => ini_get('mail.add_x_header'),
    'mail.log' => ini_get('mail.log')
];

foreach ($mail_settings as $setting => $value) {
    $status = $value ? '✅ Set' : '❌ Not Set';
    echo "<tr><td>$setting</td><td>" . ($value ?: 'Not configured') . "</td><td>$status</td></tr>";
}
echo "</table>";
echo "</div>";

// 4. Test Email Sending
echo "<div class='card'>";
echo "<h2>4. Test Email Sending</h2>";

$test_email = 'liyandahhella12@gmail.com';
$test_subject = 'CCTN Website Test Email';
$test_message = "This is a test email from your CCTN website.\n\n";
$test_message .= "Time: " . date('Y-m-d H:i:s') . "\n";
$test_message .= "Server: " . ($_SERVER['SERVER_NAME'] ?? 'Unknown') . "\n";
$test_message .= "PHP Version: " . phpversion() . "\n\n";
$test_message .= "If you receive this email, your server can send emails successfully!";

$test_headers = "From: noreply@cybercothtechnetwotks.co.zw\r\n";
$test_headers .= "Reply-To: noreply@cybercothtechnetwotks.co.zw\r\n";
$test_headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

echo "<p><strong>Attempting to send test email to:</strong> $test_email</p>";

$email_result = mail($test_email, $test_subject, $test_message, $test_headers);

if ($email_result) {
    echo "<p class='success'>✅ Test email sent successfully!</p>";
    echo "<p class='info'>📧 Check your inbox at $test_email</p>";
    echo "<p class='info'>📁 Also check your spam/junk folder</p>";
} else {
    echo "<p class='error'>❌ Test email failed to send</p>";
    echo "<p class='warning'>This indicates a server configuration issue</p>";
}

echo "</div>";

// 5. SMTP Configuration Options
echo "<div class='card'>";
echo "<h2>5. SMTP Configuration Solutions</h2>";

echo "<h3>Option A: Gmail SMTP (Recommended)</h3>";
echo "<p>Use Gmail's SMTP server to send emails:</p>";
echo "<pre>";
echo "SMTP Server: smtp.gmail.com\n";
echo "Port: 587 (TLS) or 465 (SSL)\n";
echo "Authentication: Required\n";
echo "Username: your-gmail@gmail.com\n";
echo "Password: App Password (not regular password)\n";
echo "Encryption: TLS/SSL";
echo "</pre>";

echo "<h3>Option B: Your Hosting Provider's SMTP</h3>";
echo "<p>Contact your hosting provider for SMTP settings:</p>";
echo "<ul>";
echo "<li>SMTP server address</li>";
echo "<li>Port number (usually 587 or 25)</li>";
echo "<li>Authentication credentials</li>";
echo "<li>Encryption requirements</li>";
echo "</ul>";

echo "<h3>Option C: Third-Party Email Service</h3>";
echo "<p>Use services like:</p>";
echo "<ul>";
echo "<li>SendGrid</li>";
echo "<li>Mailgun</li>";
echo "<li>Amazon SES</li>";
echo "<li>SMTP2GO</li>";
echo "</ul>";

echo "</div>";

// 6. Next Steps
echo "<div class='card'>";
echo "<h2>6. Recommended Next Steps</h2>";

if (!$email_result) {
    echo "<ol>";
    echo "<li><strong>Contact your hosting provider</strong> and ask them to:";
    echo "<ul>";
    echo "<li>Enable PHP mail function</li>";
    echo "<li>Configure SMTP settings</li>";
    echo "<li>Provide SMTP server details</li>";
    echo "</ul></li>";
    echo "<li><strong>Set up Gmail SMTP</strong> (see solution below)</li>";
    echo "<li><strong>Test again</strong> after configuration</li>";
    echo "</ol>";
} else {
    echo "<p class='success'>🎉 Your server can send emails! The contact form should work automatically.</p>";
}

echo "</div>";

echo "</body></html>";
?>
