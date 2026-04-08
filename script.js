// CCTN Cloud Development Suite - JavaScript

// DOM Elements
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const contactForm = document.getElementById('contactForm');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeScrollEffects();
    initializeCharts();
    initializeContactForm();
    initializeAnimations();
    initializeLiveDashboard();
    initializeCarousel();
});

// Navigation functionality
function initializeNavigation() {
    // Mobile menu toggle
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        
        // Animate hamburger menu
        const bars = navToggle.querySelectorAll('.bar');
        bars.forEach((bar, index) => {
            if (navMenu.classList.contains('active')) {
                if (index === 0) bar.style.transform = 'rotate(-45deg) translate(-5px, 6px)';
                if (index === 1) bar.style.opacity = '0';
                if (index === 2) bar.style.transform = 'rotate(45deg) translate(-5px, -6px)';
            } else {
                bar.style.transform = 'none';
                bar.style.opacity = '1';
            }
        });
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            const bars = navToggle.querySelectorAll('.bar');
            bars.forEach(bar => {
                bar.style.transform = 'none';
                bar.style.opacity = '1';
            });
        });
    });

    // Active link highlighting
    window.addEventListener('scroll', updateActiveLink);
}

// Update active navigation link based on scroll position
function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// Smooth scrolling for navigation links
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const offsetTop = element.offsetTop - 70; // Account for fixed navbar
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Scroll effects and animations
function initializeScrollEffects() {
    // Add scroll event listener for navbar background
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = 'var(--cctn-white)';
            navbar.style.backdropFilter = 'none';
        }
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.service-card, .dashboard-card, .contact-item');
    animateElements.forEach(el => observer.observe(el));
}

// Global variables for live dashboard
let websiteChart;
let autoRefreshInterval;
let isAutoRefresh = false;
let activityCounter = 0;

// Initialize charts
function initializeCharts() {
    // Website statistics chart
    const ctx = document.getElementById('websiteChart');
    if (ctx) {
        websiteChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Active Websites',
                    data: [12, 15, 18, 22, 25, 28],
                    backgroundColor: 'rgba(255, 165, 0, 0.8)',
                    borderColor: '#FFA500',
                    borderWidth: 1,
                    borderRadius: 5
                }, {
                    label: 'Expired Websites',
                    data: [2, 1, 3, 1, 2, 1],
                    backgroundColor: 'rgba(220, 53, 69, 0.8)',
                    borderColor: '#DC3545',
                    borderWidth: 1,
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// Live Dashboard functionality
function initializeLiveDashboard() {
    // Start real-time updates
    startRealTimeUpdates();
    
    // Initialize server monitoring
    initializeServerMonitoring();
    
    // Initialize website monitoring
    initializeWebsiteMonitoring();
}

// Real-time updates
function startRealTimeUpdates() {
    // Update server metrics every 3 seconds
    setInterval(updateServerMetrics, 3000);
    
    // Update website metrics every 5 seconds
    setInterval(updateWebsiteMetrics, 5000);
    
    // Add new activities every 10-30 seconds
    setInterval(addRandomActivity, Math.random() * 20000 + 10000);
}

// Update server metrics with realistic changes
function updateServerMetrics() {
    const servers = [
        { id: 1, name: 'Web Server 1', baseCpu: 45, baseRam: 62 },
        { id: 2, name: 'Database Server', baseCpu: 78, baseRam: 85 },
        { id: 3, name: 'Development Server', baseCpu: 0, baseRam: 0 }
    ];
    
    servers.forEach(server => {
        if (server.id === 3) return; // Skip offline server
        
        const cpuElement = document.getElementById(`cpu${server.id}`);
        const ramElement = document.getElementById(`ramValue${server.id}`);
        const cpuValueElement = document.getElementById(`cpuValue${server.id}`);
        const ramValueElement = document.getElementById(`ramValue${server.id}`);
        
        if (cpuElement && ramElement && cpuValueElement && ramValueElement) {
            // Add some random variation
            const cpuVariation = (Math.random() - 0.5) * 10;
            const ramVariation = (Math.random() - 0.5) * 8;
            
            const newCpu = Math.max(0, Math.min(100, server.baseCpu + cpuVariation));
            const newRam = Math.max(0, Math.min(100, server.baseRam + ramVariation));
            
            cpuElement.style.width = newCpu + '%';
            cpuValueElement.textContent = Math.round(newCpu) + '%';
            ramValueElement.textContent = Math.round(newRam) + '%';
            
            // Change color based on usage
            if (newCpu > 80) {
                cpuElement.style.background = 'linear-gradient(135deg, #dc3545 0%, #ff6b6b 100%)';
            } else if (newCpu > 60) {
                cpuElement.style.background = 'linear-gradient(135deg, #ffc107 0%, #ffd700 100%)';
            } else {
                cpuElement.style.background = 'var(--cctn-gradient)';
            }
        }
    });
}

// Update website metrics
function updateWebsiteMetrics() {
    const websites = [
        { id: 1, baseResponse: 245, baseVisitors: 1247 }, // cybercothtechnetwotks.co.zw
        { id: 2, baseResponse: 189, baseVisitors: 892 },  // cctn-dashboard.co.zw
        { id: 3, baseResponse: 312, baseVisitors: 2156 }  // cctn-apps.co.zw
    ];
    
    websites.forEach(website => {
        const responseElement = document.getElementById(`response${website.id}`);
        const visitorsElement = document.getElementById(`visitors${website.id}`);
        const cpuElement = document.getElementById(`websiteCpu${website.id}`);
        const memElement = document.getElementById(`websiteMem${website.id}`);
        
        if (responseElement && visitorsElement && cpuElement && memElement) {
            // Update response time
            const responseVariation = (Math.random() - 0.5) * 50;
            const newResponse = Math.max(100, website.baseResponse + responseVariation);
            responseElement.textContent = Math.round(newResponse) + 'ms';
            
            // Update visitors (gradually increasing)
            const visitorIncrease = Math.floor(Math.random() * 5);
            const currentVisitors = parseInt(visitorsElement.textContent.replace(',', ''));
            visitorsElement.textContent = (currentVisitors + visitorIncrease).toLocaleString();
            
            // Update resource usage
            const cpuVariation = (Math.random() - 0.5) * 15;
            const memVariation = (Math.random() - 0.5) * 10;
            
            const newCpu = Math.max(0, Math.min(100, 35 + cpuVariation));
            const newMem = Math.max(0, Math.min(100, 58 + memVariation));
            
            cpuElement.style.width = newCpu + '%';
            memElement.style.width = newMem + '%';
        }
    });
}

// Add random activities
function addRandomActivity() {
    const activities = [
        { text: 'New user registered on cybercothtechnetwotks.co.zw', type: 'success' },
        { text: 'Database backup completed successfully', type: 'info' },
        { text: 'SSL certificate renewed for cctn-dashboard.co.zw', type: 'success' },
        { text: 'High traffic detected on cctn-apps.co.zw', type: 'warning' },
        { text: 'Mobile app update deployed to production', type: 'success' },
        { text: 'Server maintenance scheduled for tonight', type: 'info' },
        { text: 'New website added to monitoring', type: 'success' },
        { text: 'Performance optimization completed', type: 'info' }
    ];
    
    const activity = activities[Math.floor(Math.random() * activities.length)];
    addActivityToFeed(activity.text, activity.type);
}

// Add activity to feed
function addActivityToFeed(text, type) {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item new-activity';
    
    const iconClass = type === 'success' ? 'fas fa-check' : 
                     type === 'warning' ? 'fas fa-exclamation' : 'fas fa-info';
    const iconBgClass = type === 'success' ? 'success' : 
                       type === 'warning' ? 'warning' : 'info';
    
    activityItem.innerHTML = `
        <div class="activity-icon ${iconBgClass}">
            <i class="${iconClass}"></i>
        </div>
        <div class="activity-content">
            <div class="activity-text">${text}</div>
            <div class="activity-time">Just now</div>
        </div>
    `;
    
    // Remove new-activity class after animation
    setTimeout(() => {
        activityItem.classList.remove('new-activity');
    }, 2000);
    
    // Insert at the top
    activityList.insertBefore(activityItem, activityList.firstChild);
    
    // Keep only 10 activities
    const activities = activityList.querySelectorAll('.activity-item');
    if (activities.length > 10) {
        activityList.removeChild(activities[activities.length - 1]);
    }
}

// Server control functions
function restartServer(serverId) {
    const statusElement = document.getElementById(`status${serverId}`);
    const cpuElement = document.getElementById(`cpu${serverId}`);
    
    if (statusElement && cpuElement) {
        // Show restarting state
        statusElement.textContent = '⟳';
        statusElement.className = 'server-status warning';
        cpuElement.style.width = '0%';
        
        // Simulate restart process
        setTimeout(() => {
            statusElement.textContent = '●';
            statusElement.className = 'server-status online';
            cpuElement.style.width = '45%';
            addActivityToFeed(`Server ${serverId} restarted successfully`, 'success');
        }, 3000);
    }
}

function startServer(serverId) {
    const statusElement = document.getElementById(`status${serverId}`);
    const cpuElement = document.getElementById(`cpu${serverId}`);
    
    if (statusElement && cpuElement) {
        statusElement.textContent = '⟳';
        statusElement.className = 'server-status warning';
        
        setTimeout(() => {
            statusElement.textContent = '●';
            statusElement.className = 'server-status online';
            cpuElement.style.width = '25%';
            addActivityToFeed(`Development Server started successfully`, 'success');
        }, 2000);
    }
}

// Website control functions
function toggleWebsite(websiteId) {
    const websiteCard = document.getElementById(`website${websiteId}`);
    const statusElement = websiteCard.querySelector('.website-status');
    
    if (statusElement.textContent === 'Online') {
        statusElement.textContent = 'Offline';
        statusElement.className = 'website-status offline';
        addActivityToFeed(`Website ${websiteId} taken offline`, 'warning');
    } else {
        statusElement.textContent = 'Online';
        statusElement.className = 'website-status online';
        addActivityToFeed(`Website ${websiteId} brought online`, 'success');
    }
}

function viewWebsite(websiteId) {
    const websites = ['cybercothtechnetwotks.co.zw', 'cctn-dashboard.co.zw', 'cctn-apps.co.zw'];
    const url = `https://${websites[websiteId - 1]}`;
    window.open(url, '_blank');
    addActivityToFeed(`Opened ${websites[websiteId - 1]} in new tab`, 'info');
}

// Chart update function
function updateChart(period) {
    if (!websiteChart) return;
    
    // Update active button
    document.querySelectorAll('.chart-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update chart data based on period
    let newData;
    let newLabels;
    
    switch(period) {
        case 'weekly':
            newLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            newData = [15, 18, 22, 25, 28, 20, 16];
            break;
        case 'daily':
            newLabels = ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'];
            newData = [12, 18, 25, 30, 22, 15];
            break;
        default: // monthly
            newLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
            newData = [12, 15, 18, 22, 25, 28];
    }
    
    websiteChart.data.labels = newLabels;
    websiteChart.data.datasets[0].data = newData;
    websiteChart.update();
}

// Activity feed functions
function clearActivities() {
    const activityList = document.getElementById('activityList');
    if (activityList) {
        activityList.innerHTML = '';
        addActivityToFeed('Activity feed cleared', 'info');
    }
}

function toggleAutoRefresh() {
    const refreshIcon = document.getElementById('refreshIcon');
    
    if (isAutoRefresh) {
        clearInterval(autoRefreshInterval);
        refreshIcon.style.animation = 'none';
        isAutoRefresh = false;
        addActivityToFeed('Auto refresh disabled', 'info');
    } else {
        autoRefreshInterval = setInterval(() => {
            updateServerMetrics();
            updateWebsiteMetrics();
        }, 2000);
        refreshIcon.style.animation = 'spin 2s linear infinite';
        isAutoRefresh = true;
        addActivityToFeed('Auto refresh enabled', 'success');
    }
}

// Initialize server monitoring
function initializeServerMonitoring() {
    // Add pulse animation for online servers
    setInterval(() => {
        document.querySelectorAll('.server-status.online').forEach(status => {
            status.style.animation = 'pulse 1s ease-in-out';
            setTimeout(() => {
                status.style.animation = 'none';
            }, 1000);
        });
    }, 5000);
}

// Initialize website monitoring
function initializeWebsiteMonitoring() {
    // Add subtle animations to website cards
    setInterval(() => {
        document.querySelectorAll('.website-card').forEach(card => {
            if (Math.random() > 0.7) {
                card.style.transform = 'translateY(-2px)';
                setTimeout(() => {
                    card.style.transform = 'translateY(0)';
                }, 200);
            }
        });
    }, 3000);
}

// Contact form functionality
function initializeContactForm() {
    if (contactForm) {
        // Generate CSRF token
        const csrfToken = generateCSRFToken();
        const csrfInput = document.getElementById('csrf_token');
        if (csrfInput) {
            csrfInput.value = csrfToken;
        }
        
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Form submitted - preventing default behavior');
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            // Check honeypot field for bot detection
            if (data.website && data.website.trim() !== '') {
                logSecurityEvent('bot_detected', { userAgent: navigator.userAgent });
                showNotification('Invalid submission detected.', 'error');
                return;
            }
            
            // Sanitize input
            const sanitizedData = sanitizeInput(data);
            
            // Debug: Log form data
            console.log('Form data being validated:', sanitizedData);
            
            // Enhanced validation
            if (validateForm(sanitizedData)) {
                // Rate limiting check
                if (!checkRateLimit()) {
                    showNotification('Too many requests. Please wait before submitting again.', 'error');
                    return;
                }
                
                // Show loading state
                const submitBtn = document.querySelector('#contactForm button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                submitBtn.disabled = true;
                
                // Try to send email via PHP script
                fetch('send_email.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(sanitizedData)
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        // Email sent successfully
                        showNotification(result.message, 'success');
                        
                        // Reset form
                        contactForm.reset();
                        
                        // Generate new CSRF token
                        const newCsrfToken = generateCSRFToken();
                        if (csrfInput) {
                            csrfInput.value = newCsrfToken;
                        }
                    } else {
                        // Email sending failed, fallback to manual method
                        showNotification('Email service unavailable. Please use the manual method below.', 'warning');
                        
                        const emailData = {
                            name: sanitizedData.name,
                            email: sanitizedData.email,
                            phone: sanitizedData.phone || 'Not provided',
                            service: sanitizedData.service,
                            message: sanitizedData.message,
                            timestamp: new Date().toLocaleString(),
                            ip: 'Client-side submission'
                        };
                        
                        // Create email content for manual sending
                        const emailContent = createEmailContent(emailData);
                        showEmailContent(emailData);
                    }
                })
                .catch(error => {
                    console.error('Email sending error:', error);
                    
                    // Fallback to manual method
                    showNotification('Email service unavailable. Please use the manual method below.', 'warning');
                    
                    const emailData = {
                        name: sanitizedData.name,
                        email: sanitizedData.email,
                        phone: sanitizedData.phone || 'Not provided',
                        service: sanitizedData.service,
                        message: sanitizedData.message,
                        timestamp: new Date().toLocaleString(),
                        ip: 'Client-side submission'
                    };
                    
                    // Create email content for manual sending
                    const emailContent = createEmailContent(emailData);
                    showEmailContent(emailData);
                })
                .finally(() => {
                    // Restore button state
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                });
                
                // Log security event
                logSecurityEvent('form_submission', sanitizedData.email);
            } else {
                showNotification('Please fill in all required fields with valid data.', 'error');
            }
        });
    }
}

// Enhanced form validation with security
function validateForm(data) {
    console.log('Validating form data:', data);
    const requiredFields = ['name', 'email', 'message', 'service'];
    
    // Check required fields with specific error messages
    for (const field of requiredFields) {
        console.log(`Checking field ${field}:`, data[field]);
        if (!data[field] || data[field].trim() === '') {
            const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
            console.log(`Field ${field} is empty or invalid`);
            showNotification(`${fieldName} is required`, 'error');
            return false;
        }
    }
    
    // Email validation with regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    console.log('Email validation:', data.email, emailRegex.test(data.email));
    if (!emailRegex.test(data.email)) {
        console.log('Email validation failed');
        showNotification('Please enter a valid email address', 'error');
        return false;
    }
    
    // Name validation
    if (data.name.length < 2) {
        showNotification('Name must be at least 2 characters long', 'error');
        return false;
    }
    
    // Message validation
    console.log('Message validation:', data.message, 'Length:', data.message.length);
    if (data.message.length < 3) {
        console.log('Message validation failed - too short');
        showNotification('Message must be at least 3 characters long', 'error');
        return false;
    }
    
    // Check for suspicious content
    const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /eval\s*\(/i,
        /expression\s*\(/i,
        /vbscript:/i,
        /data:text\/html/i
    ];
    
    for (const pattern of suspiciousPatterns) {
        if (pattern.test(data.name) || pattern.test(data.email) || pattern.test(data.message)) {
            showNotification('Invalid characters detected. Please check your input.', 'error');
            logSecurityEvent('suspicious_input', { name: data.name, email: data.email });
            return false;
        }
    }
    
    console.log('Form validation passed successfully');
    return true;
}

// Input sanitization
function sanitizeInput(data) {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
            // Remove potentially dangerous characters
            sanitized[key] = value
                .replace(/[<>]/g, '') // Remove < and >
                .replace(/javascript:/gi, '') // Remove javascript: protocol
                .replace(/on\w+=/gi, '') // Remove event handlers
                .replace(/vbscript:/gi, '') // Remove vbscript: protocol
                .replace(/data:text\/html/gi, '') // Remove data: HTML
                .trim();
        } else {
            sanitized[key] = value;
        }
    }
    
    return sanitized;
}

// Rate limiting
let submissionAttempts = [];
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_ATTEMPTS = 5;

function checkRateLimit() {
    const now = Date.now();
    
    // Remove old attempts
    submissionAttempts = submissionAttempts.filter(time => now - time < RATE_LIMIT_WINDOW);
    
    // Check if limit exceeded
    if (submissionAttempts.length >= MAX_ATTEMPTS) {
        return false;
    }
    
    // Add current attempt
    submissionAttempts.push(now);
    return true;
}

// Security logging
function logSecurityEvent(event, data) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        event: event,
        data: data,
        userAgent: navigator.userAgent,
        url: window.location.href,
        ip: 'client-side' // In production, get from server
    };
    
    // In production, send to secure logging service
    console.log('Security Event:', logEntry);
}

// XSS Protection
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    
    return text.replace(/[&<>"']/g, function(m) {
        return map[m];
    });
}

// CSRF Protection
function generateCSRFToken() {
    // Generate a simple client-side token (in production, get from server)
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    return btoa(timestamp + random).replace(/[^a-zA-Z0-9]/g, '');
}

function getCSRFToken() {
    return generateCSRFToken();
}

// Email content creation
function createEmailContent(data) {
    return `
Subject: New Contact Form Submission - CCTN Website

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}
Service: ${data.service}
Message: ${data.message}

Submitted: ${data.timestamp}
IP: ${data.ip}

---
This message was sent from the CCTN Cloud Development Suite contact form.
Website: https://cybercothtechnetwotks.co.zw

Please send this email to: liyandahhella12@gmail.com
    `.trim();
}

// Display email content for copying
function showEmailContent(data) {
    // Remove any existing email display
    const existingDisplay = document.querySelector('.email-display');
    if (existingDisplay) {
        existingDisplay.remove();
    }
    
    const emailContent = createEmailContent(data);
    
    const emailDisplay = document.createElement('div');
    emailDisplay.className = 'email-display';
    emailDisplay.innerHTML = `
        <div style="background: rgba(255, 112, 51, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid rgba(255, 112, 51, 0.3);">
            <h4 style="color: var(--cctn-orange); margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-envelope"></i> Email Content to Send to: liyandahhella12@gmail.com
            </h4>
            <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #ddd; margin-bottom: 15px;">
                <pre style="white-space: pre-wrap; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.4; margin: 0;">${emailContent}</pre>
            </div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button onclick="copyEmailContent()" style="background: var(--cctn-orange); color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 14px;">
                    <i class="fas fa-copy"></i> Copy Email Content
                </button>
                <a href="mailto:liyandahhella12@gmail.com?subject=New Contact Form Submission&body=${encodeURIComponent(emailContent)}" 
                   style="background: #25D366; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 14px;">
                    <i class="fas fa-paper-plane"></i> Open Email Client
                </a>
                <a href="https://wa.me/263774914287?text=${encodeURIComponent('Hi! I submitted a contact form on your website. Here are the details:\n\n' + emailContent)}" 
                   target="_blank" 
                   style="background: #25D366; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 14px;">
                    <i class="fab fa-whatsapp"></i> Send via WhatsApp
                </a>
            </div>
            <p style="margin-top: 15px; font-size: 12px; color: #666;">
                <i class="fas fa-info-circle"></i> Copy the email content above and send it to liyandahhella12@gmail.com
            </p>
        </div>
    `;
    
    // Add to contact form
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.appendChild(emailDisplay);
        
        // Scroll to the email display
        emailDisplay.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Copy email content to clipboard
function copyEmailContent() {
    const emailDisplay = document.querySelector('.email-display pre');
    if (emailDisplay) {
        const text = emailDisplay.textContent;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                showNotification('Email content copied to clipboard!', 'success');
            }).catch(() => {
                fallbackCopyTextToClipboard(text);
            });
        } else {
            fallbackCopyTextToClipboard(text);
        }
    }
}

// Fallback copy method for older browsers
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification('Email content copied to clipboard!', 'success');
    } catch (err) {
        showNotification('Please manually copy the email content above', 'info');
    }
    
    document.body.removeChild(textArea);
}

// Notification system
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
            <span class="notification-message">${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: var(--cctn-shadow-lg);
        z-index: 3000;
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Modal functionality
function showModal(type) {
    const modalContent = getModalContent(type);
    modalBody.innerHTML = modalContent;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function getModalContent(type) {
    const modals = {
        addWebsite: `
            <h2><i class="fas fa-globe"></i> Add New Website</h2>
            <form class="modal-form">
                <div class="form-group">
                    <label>Domain Name</label>
                    <input type="text" placeholder="example.com" required>
                </div>
                <div class="form-group">
                    <label>Client</label>
                    <select required>
                        <option value="">Select Client</option>
                        <option value="1">Tech Solutions Ltd</option>
                        <option value="2">Digital Agency</option>
                        <option value="3">E-commerce Store</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Hosting Plan</label>
                    <select required>
                        <option value="">Select Plan</option>
                        <option value="starter">Starter Plan - $15/month</option>
                        <option value="business">Business Plan - $25/month</option>
                        <option value="premium">Premium Plan - $45/month</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>SSL Certificate</label>
                    <input type="checkbox" checked> Enable SSL
                </div>
                <button type="submit" class="btn-primary">
                    <i class="fas fa-plus"></i> Add Website
                </button>
            </form>
        `,
        addApp: `
            <h2><i class="fas fa-mobile-alt"></i> New App Project</h2>
            <form class="modal-form">
                <div class="form-group">
                    <label>Project Name</label>
                    <input type="text" placeholder="My Mobile App" required>
                </div>
                <div class="form-group">
                    <label>Project Type</label>
                    <select required>
                        <option value="">Select Type</option>
                        <option value="web">Web Application</option>
                        <option value="android">Android App</option>
                        <option value="ios">iOS App</option>
                        <option value="hybrid">Hybrid App</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Client</label>
                    <select required>
                        <option value="">Select Client</option>
                        <option value="1">Tech Solutions Ltd</option>
                        <option value="2">Digital Agency</option>
                        <option value="3">E-commerce Store</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea placeholder="Project description..." rows="3"></textarea>
                </div>
                <button type="submit" class="btn-primary">
                    <i class="fas fa-plus"></i> Create Project
                </button>
            </form>
        `,
        seoReport: `
            <h2><i class="fas fa-search"></i> Generate SEO Report</h2>
            <form class="modal-form">
                <div class="form-group">
                    <label>Website</label>
                    <select required>
                        <option value="">Select Website</option>
                        <option value="1">techsolutions.co.zw</option>
                        <option value="2">digitalagency.com</option>
                        <option value="3">ecommerce.co.zw</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Report Period</label>
                    <select required>
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                        <option value="365">Last year</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Report Format</label>
                    <div style="display: flex; gap: 10px;">
                        <label><input type="radio" name="format" value="pdf" checked> PDF</label>
                        <label><input type="radio" name="format" value="excel"> Excel</label>
                    </div>
                </div>
                <button type="submit" class="btn-primary">
                    <i class="fas fa-download"></i> Generate Report
                </button>
            </form>
        `,
        addServer: `
            <h2><i class="fas fa-server"></i> Add New Server</h2>
            <form class="modal-form">
                <div class="form-group">
                    <label>Server Name</label>
                    <input type="text" placeholder="Web Server 2" required>
                </div>
                <div class="form-group">
                    <label>IP Address</label>
                    <input type="text" placeholder="192.168.1.103" required>
                </div>
                <div class="form-group">
                    <label>SSH Port</label>
                    <input type="number" placeholder="22" value="22">
                </div>
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" placeholder="ubuntu" required>
                </div>
                <div class="form-group">
                    <label>Operating System</label>
                    <select required>
                        <option value="">Select OS</option>
                        <option value="ubuntu">Ubuntu 22.04</option>
                        <option value="centos">CentOS 8</option>
                        <option value="debian">Debian 11</option>
                        <option value="windows">Windows Server 2022</option>
                    </select>
                </div>
                <button type="submit" class="btn-primary">
                    <i class="fas fa-plus"></i> Add Server
                </button>
            </form>
        `
    };
    
    return modals[type] || '<h2>Modal Content</h2><p>Content not found.</p>';
}

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    if (e.target === modal) {
        closeModal();
    }
});

// Initialize animations
function initializeAnimations() {
    // Add CSS for slide animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .modal-form {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .modal-form .form-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .modal-form label {
            font-weight: 500;
            color: var(--cctn-dark);
        }
        
        .modal-form input,
        .modal-form select,
        .modal-form textarea {
            padding: 10px;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            font-size: 1rem;
        }
        
        .modal-form input:focus,
        .modal-form select:focus,
        .modal-form textarea:focus {
            outline: none;
            border-color: var(--cctn-orange);
        }
        
        .modal-form button {
            margin-top: 10px;
        }
    `;
    document.head.appendChild(style);
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Performance optimization
const debouncedScrollHandler = debounce(updateActiveLink, 10);
window.addEventListener('scroll', debouncedScrollHandler);

// Add loading animation
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});


// Binary Animation
function initializeBinaryAnimation() {
    const binaryContainer = document.getElementById('binaryNumbers');
    if (!binaryContainer) {
        console.log('Binary container not found');
        return;
    }

    console.log('Initializing binary animation');

    // Create binary numbers that fall down
    function createBinaryNumber() {
        const binaryNumber = document.createElement('div');
        binaryNumber.className = 'binary-number';
        
        // Simple binary sequences
        const binarySequences = [
            '01001000', '01100101', '01101100', '01101100', '01101111',
            '01000001', '01001001', '00100000', '01010000', '01101100',
            '01100001', '01110100', '01100110', '01101111', '01110010',
            '01101101', '00100000', '01000011', '01000011', '01010100',
            '01001110', '00100000', '01000011', '01101100', '01101111',
            '01110101', '01100100', '00100000', '01000100', '01100101',
            '01110110', '01100101', '01101100', '01101111', '01110000',
            '01101101', '01100101', '01101110', '01110100', '00100000',
            '01010011', '01110101', '01101001', '01110100', '01100101',
            '00100000', '01000001', '01001001', '00100000', '01010000',
            '01101111', '01110111', '01100101', '01110010', '01100101',
            '01100100', '00100000', '01010000', '01101100', '01100001',
            '01110100', '01100110', '01101111', '01110010', '01101101',
            '00100000', '01000001', '01001001', '00100000', '01010000',
            '01101111', '01110111', '01100101', '01110010', '01100101',
            '01100100', '00100000', '01010000', '01101100', '01100001',
            '01110100', '01100110', '01101111', '01110010', '01101101',
            '01000001', '01001001', '00100000', '01010000', '01101100',
            '01100001', '01110100', '01100110', '01101111', '01110010',
            '01101101', '00100000', '01000011', '01000011', '01010100',
            '01001110', '00100000', '01000011', '01101100', '01101111',
            '01110101', '01100100', '00100000', '01000100', '01100101',
            '01110110', '01100101', '01101100', '01101111', '01110000',
            '01101101', '01100101', '01101110', '01110100', '00100000',
            '01010011', '01110101', '01101001', '01110100', '01100101',
            '00100000', '01000001', '01001001', '00100000', '01010000',
            '01101111', '01110111', '01100101', '01110010', '01100101',
            '01100100', '00100000', '01010000', '01101100', '01100001',
            '01110100', '01100110', '01101111', '01110010', '01101101',
            '00100000', '01000001', '01001001', '00100000', '01010000',
            '01101111', '01110111', '01100101', '01110010', '01100101',
            '01100100', '00100000', '01010000', '01101100', '01100001',
            '01110100', '01100110', '01101111', '01110010', '01101101'
        ];
        
        // Randomly select a binary sequence
        const randomSequence = binarySequences[Math.floor(Math.random() * binarySequences.length)];
        binaryNumber.textContent = randomSequence;
        
        // Random horizontal position
        binaryNumber.style.left = Math.random() * 90 + '%';
        
        // Random animation delay
        binaryNumber.style.animationDelay = Math.random() * 3 + 's';
        
        // Add to container
        binaryContainer.appendChild(binaryNumber);
        
        // Remove element after animation completes
        setTimeout(() => {
            if (binaryNumber.parentNode) {
                binaryNumber.parentNode.removeChild(binaryNumber);
            }
        }, 20000); // Match the longest animation duration
    }

    // Create new binary numbers every 800ms
    setInterval(createBinaryNumber, 800);
    
    // Create initial binary numbers
    for (let i = 0; i < 15; i++) {
        setTimeout(() => createBinaryNumber(), i * 300);
    }
}

// Test function for binary animation
// Image Carousel Functions
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-slide');
const indicators = document.querySelectorAll('.indicator');

function initializeCarousel() {
    if (slides.length === 0) return;
    
    // Auto-advance slides every 5 seconds
    setInterval(() => {
        changeSlide(1);
    }, 5000);
    
    // Initialize first slide
    showSlide(0);
}

function changeSlide(direction) {
    currentSlide += direction;
    
    if (currentSlide >= slides.length) {
        currentSlide = 0;
    } else if (currentSlide < 0) {
        currentSlide = slides.length - 1;
    }
    
    showSlide(currentSlide);
}

function currentSlideClick(slideIndex) {
    currentSlide = slideIndex - 1;
    showSlide(currentSlide);
}

function showSlide(slideIndex) {
    // Hide all slides
    slides.forEach(slide => {
        slide.classList.remove('active');
    });
    
    // Remove active class from all indicators
    indicators.forEach(indicator => {
        indicator.classList.remove('active');
    });
    
    // Show current slide
    if (slides[slideIndex]) {
        slides[slideIndex].classList.add('active');
    }
    
    // Activate current indicator
    if (indicators[slideIndex]) {
        indicators[slideIndex].classList.add('active');
    }
}

// Add CSS for loading animation
const loadingStyle = document.createElement('style');
loadingStyle.textContent = `
    body:not(.loaded) {
        overflow: hidden;
    }
    
    body:not(.loaded)::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--cctn-white);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    body:not(.loaded)::after {
        content: 'CCTN';
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 3rem;
        font-weight: bold;
        background: var(--cctn-gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        z-index: 10000;
        animation: pulse 1.5s ease-in-out infinite;
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
`;
document.head.appendChild(loadingStyle);
