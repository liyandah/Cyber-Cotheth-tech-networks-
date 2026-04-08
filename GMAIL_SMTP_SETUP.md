# 📧 Gmail SMTP Setup Guide for CCTN Website

## 🎯 Goal
Configure your contact form to send emails directly to `liyandahhella12@gmail.com` using Gmail's SMTP server.

## 📋 Step-by-Step Setup

### Step 1: Enable 2-Factor Authentication on Gmail
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Sign in with `liyandahhella12@gmail.com`
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the setup process to enable 2FA

### Step 2: Generate App Password
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click **App passwords**
3. Select **Mail** as the app
4. Select **Other (Custom name)** as the device
5. Type "CCTN Website Contact Form"
6. Click **Generate**
7. **Copy the 16-character password** (you'll need this!)

### Step 3: Update Email Script
Replace the password in `send_email_smtp.php`:

```php
$mail->Password = 'your-app-password'; // Replace with your 16-character app password
```

### Step 4: Install PHPMailer (if needed)
If your server doesn't have PHPMailer, add this to the top of `send_email_smtp.php`:

```php
// Download PHPMailer from: https://github.com/PHPMailer/PHPMailer
require_once 'path/to/PHPMailer/src/Exception.php';
require_once 'path/to/PHPMailer/src/PHPMailer.php';
require_once 'path/to/PHPMailer/src/SMTP.php';
```

### Step 5: Test the Setup
1. Run `email_diagnostics.php` to check server capabilities
2. Test the contact form
3. Check `liyandahhella12@gmail.com` for emails

## 🔧 Gmail SMTP Settings

```
SMTP Server: smtp.gmail.com
Port: 587 (TLS) or 465 (SSL)
Authentication: Required
Username: liyandahhella12@gmail.com
Password: [Your 16-character App Password]
Encryption: TLS/SSL
```

## 🚨 Important Security Notes

1. **Never use your regular Gmail password** - only use App Passwords
2. **Keep the App Password secure** - don't share it
3. **The App Password is different** from your Gmail login password

## 🔍 Troubleshooting

### "Authentication failed"
- ✅ Make sure 2FA is enabled
- ✅ Use App Password, not regular password
- ✅ Check username is correct

### "Connection refused"
- ✅ Check if port 587 is open
- ✅ Try port 465 instead
- ✅ Contact hosting provider about SMTP access

### "Email not received"
- ✅ Check spam folder
- ✅ Verify recipient email is correct
- ✅ Check Gmail's "All Mail" folder

## 📞 Alternative Solutions

### Option 1: Contact Hosting Provider
Ask them to:
- Enable PHP mail function
- Configure SMTP server
- Provide SMTP credentials

### Option 2: Use Third-Party Service
- **SendGrid** (free tier: 100 emails/day)
- **Mailgun** (free tier: 5,000 emails/month)
- **SMTP2GO** (free tier: 1,000 emails/month)

### Option 3: Keep Manual Method
The current fallback system works perfectly - users can copy and send emails manually.

## ✅ Expected Result

After setup, when someone submits the contact form:
1. ✅ Form validates successfully
2. ✅ Email sends automatically via Gmail SMTP
3. ✅ You receive email at `liyandahhella12@gmail.com`
4. ✅ No manual intervention needed

## 🎉 Success!

Once configured, your contact form will send emails automatically to `liyandahhella12@gmail.com` using Gmail's reliable SMTP service!
