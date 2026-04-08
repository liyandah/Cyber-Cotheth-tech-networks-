<?php
// Test email sending functionality
echo "<h2>Email Test for CCTN Website</h2>";

// Test data
$test_data = [
    'name' => 'Test User',
    'email' => 'test@example.com',
    'phone' => '0774914287',
    'service' => 'web-development',
    'message' => 'This is a test message from the CCTN website contact form.'
];

echo "<h3>Testing email sending...</h3>";

// Simulate the email sending process
$to = 'liyandahhella12@gmail.com';
$subject = 'Test Email - CCTN Website';
$message = "Test email from CCTN website contact form.\n\n";
$message .= "Name: " . $test_data['name'] . "\n";
$message .= "Email: " . $test_data['email'] . "\n";
$message .= "Phone: " . $test_data['phone'] . "\n";
$message .= "Service: " . $test_data['service'] . "\n";
$message .= "Message: " . $test_data['message'] . "\n";
$message .= "Time: " . date('Y-m-d H:i:s') . "\n";

$headers = "From: noreply@cybercothtechnetwotks.co.zw\r\n";
$headers .= "Reply-To: " . $test_data['email'] . "\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

echo "<p><strong>Email Details:</strong></p>";
echo "<ul>";
echo "<li><strong>To:</strong> $to</li>";
echo "<li><strong>Subject:</strong> $subject</li>";
echo "<li><strong>From:</strong> noreply@cybercothtechnetwotks.co.zw</li>";
echo "</ul>";

echo "<p><strong>Message Content:</strong></p>";
echo "<pre style='background: #f5f5f5; padding: 10px; border-radius: 5px;'>" . htmlspecialchars($message) . "</pre>";

// Check if mail function is available
if (function_exists('mail')) {
    echo "<p><strong>Mail Function:</strong> Available ✅</p>";
    
    // Try to send the email
    $result = mail($to, $subject, $message, $headers);
    
    if ($result) {
        echo "<p style='color: green;'><strong>✅ Email sent successfully!</strong></p>";
        echo "<p>Check your inbox at <strong>liyandahhella12@gmail.com</strong></p>";
    } else {
        echo "<p style='color: red;'><strong>❌ Failed to send email</strong></p>";
        echo "<p>This might be due to server configuration. Check with your hosting provider.</p>";
    }
} else {
    echo "<p style='color: red;'><strong>❌ Mail function not available</strong></p>";
    echo "<p>PHP mail function is not enabled on this server.</p>";
}

echo "<h3>Server Information:</h3>";
echo "<ul>";
echo "<li><strong>PHP Version:</strong> " . phpversion() . "</li>";
echo "<strong>Server:</strong> " . ($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown') . "</li>";
echo "<li><strong>Operating System:</strong> " . php_uname() . "</li>";
echo "</ul>";

echo "<h3>Next Steps:</h3>";
echo "<ol>";
echo "<li>If email was sent successfully, check your inbox at <strong>liyandahhella12@gmail.com</strong></li>";
echo "<li>If email failed, contact your hosting provider to enable PHP mail function</li>";
echo "<li>Alternatively, you can use the manual email method (copy & paste) as a backup</li>";
echo "</ol>";
?>
