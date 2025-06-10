// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginError = document.getElementById('login-error');
const signupError = document.getElementById('signup-error');
const tabButtons = document.querySelectorAll('.auth-tab-btn');
const tabContents = document.querySelectorAll('.auth-tab-content');

// Check for Supabase hash params on page load
document.addEventListener('DOMContentLoaded', async function() {
    // Check if there's a hash in the URL (Supabase uses this for auth)
    if (window.location.hash) {
        try {
            // Try to exchange the hash for a session
            const { data, error } = await supabaseClient.auth.getSession();
            
            if (error) {
                console.error('Error processing authentication:', error.message);
                showError(loginError, 'Authentication link has expired or is invalid. Please try signing in or request a new confirmation email.');
            } else if (data.session) {
                // If successful, redirect to main app
                localStorage.setItem('userLoggedIn', 'true');
                window.location.href = 'index.html';
            }
        } catch (err) {
            console.error('Error during authentication:', err);
        }
    }
});

// Tab switching functionality
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.getAttribute('data-tab');
        
        // Update active tab button
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Show the selected tab content
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabName}-tab`) {
                content.classList.add('active');
            }
        });
        
        // Clear any error messages
        loginError.style.display = 'none';
        signupError.style.display = 'none';
    });
});

// Resend confirmation email link
const resendConfirmationLink = document.getElementById('resend-confirmation');
if (resendConfirmationLink) {
    resendConfirmationLink.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const email = prompt('Please enter your email address to resend the confirmation:');
        if (!email) return;
        
        try {
            showLoading();
            
            // Get the current domain without port
            const currentDomain = window.location.protocol + '//' + window.location.hostname;
            
            const { data, error } = await supabaseClient.auth.resend({
                type: 'signup',
                email: email,
                options: {
                    emailRedirectTo: currentDomain + '/auth.html'
                }
            });
            
            hideLoading();
            
            if (error) {
                showError(loginError, error.message);
                return;
            }
            
            alert('If your email exists in our system, a new confirmation link has been sent. Please check your inbox and spam folder.');
            
        } catch (err) {
            hideLoading();
            showError(loginError, 'An unexpected error occurred. Please try again.');
        }
    });
}

// Login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        showLoading();
        
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            hideLoading();
            
            // Provide more specific error messages for common errors
            if (error.message.includes('Email not confirmed')) {
                showError(loginError, 'Please check your email and confirm your account before signing in. Check your spam folder if needed.');
            } else if (error.message.includes('Invalid login credentials')) {
                showError(loginError, 'Invalid email or password. Please try again.');
            } else {
                showError(loginError, error.message);
            }
            return;
        }
        
        // Redirect to main app on successful login
        localStorage.setItem('userLoggedIn', 'true');
        window.location.href = 'index.html';
        
    } catch (err) {
        hideLoading();
        showError(loginError, 'An unexpected error occurred. Please try again.');
        console.error('Login error:', err);
    }
});

// Signup form submission
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showError(signupError, 'Passwords do not match');
        return;
    }
    
    try {
        showLoading();
        
        // Get the current domain without port
        const currentDomain = window.location.protocol + '//' + window.location.hostname;
        
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: currentDomain + '/auth.html'
            }
        });
        
        if (error) {
            showError(signupError, error.message);
            hideLoading();
            return;
        }
        
        hideLoading();
        
        // Always show the email confirmation message since Supabase is configured to require email verification
        signupForm.innerHTML = `
            <div class="success-message">
                <i class="fas fa-check-circle"></i>
                <h3>Account Created!</h3>
                <p>Please check your email (${email}) to confirm your account before signing in.</p>
                <p>Check your spam folder if you don't see the confirmation email.</p>
                <a href="auth.html" class="auth-submit-btn">Back to Sign In</a>
            </div>
        `;
        
        // Don't create user profile or set userLoggedIn until they've confirmed their email
        
    } catch (err) {
        hideLoading();
        showError(signupError, 'An unexpected error occurred. Please try again.');
        console.error('Signup error:', err);
    }
});

// Database functions
async function createUserProfile(userId) {
    try {
        const { error } = await supabaseClient
            .from('profiles')
            .insert([
                { 
                    id: userId,
                    user_id: userId,
                    created_at: new Date()
                }
            ]);
        
        if (error) {
            console.error('Error creating user profile:', error.message);
        }
    } catch (err) {
        console.error('Profile creation error:', err);
    }
}

// UI Helper functions
function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
    element.classList.add('shake');
    
    // Remove animation class after it completes
    setTimeout(() => {
        element.classList.remove('shake');
    }, 500);
}

function showLoading() {
    document.body.classList.add('loading');
    document.body.style.cursor = 'wait';
    
    // Disable form buttons
    document.querySelectorAll('button[type="submit"]').forEach(button => {
        button.disabled = true;
    });
}

function hideLoading() {
    document.body.classList.remove('loading');
    document.body.style.cursor = 'default';
    
    // Re-enable form buttons
    document.querySelectorAll('button[type="submit"]').forEach(button => {
        button.disabled = false;
    });
} 