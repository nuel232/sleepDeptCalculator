// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM elements - with null checks
const authModal = document.getElementById('auth-modal');
const modalTitle = authModal ? document.getElementById('modal-title') : null;
const authForm = document.getElementById('auth-form');
const authSubmit = document.getElementById('auth-submit');
const authError = document.getElementById('auth-error');
const loginButton = document.getElementById('login-button'); // This may be null
const signupButton = document.getElementById('signup-button'); // This may be null
const logoutButton = document.getElementById('logout-button');
const userEmail = document.getElementById('user-email');
const closeModalBtn = document.querySelector('.close');
const syncDataBtn = document.getElementById('sync-data');

// Welcome overlay elements
const welcomeOverlay = document.getElementById('welcome-overlay');
const welcomeLoginBtn = document.getElementById('welcome-login');
const welcomeSignupBtn = document.getElementById('welcome-signup');
const welcomeGuestBtn = document.getElementById('welcome-guest');

// Auth state
let isLoginMode = true;
let currentUser = null;

// Check for existing session on page load
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Show welcome overlay if it exists
        if (welcomeOverlay) {
            showWelcomeOverlay();
            
            // Welcome button event listeners
            if (welcomeLoginBtn) {
                welcomeLoginBtn.addEventListener('click', () => {
                    hideWelcomeOverlay();
                    isLoginMode = true;
                    openAuthModal('Sign In');
                });
            }
            
            if (welcomeSignupBtn) {
                welcomeSignupBtn.addEventListener('click', () => {
                    hideWelcomeOverlay();
                    isLoginMode = false;
                    openAuthModal('Sign Up');
                });
            }
            
            if (welcomeGuestBtn) {
                welcomeGuestBtn.addEventListener('click', () => {
                    hideWelcomeOverlay();
                    localStorage.setItem('guestMode', 'true');
                });
            }
        }
        
        // Check for existing session
        const { data, error } = await supabaseClient.auth.getSession();
        
        if (error) {
            console.error('Error checking session:', error.message);
        } else if (data && data.session) {
            const { user } = data.session;
            handleSuccessfulAuth(user);
            if (welcomeOverlay) hideWelcomeOverlay();
            loadUserData();
            animateUIElements();
        }
    } catch (err) {
        console.error('Error initializing auth:', err);
    }
});

// Add event listeners only if elements exist
// Event listeners for loginButton and signupButton
if (loginButton) {
    loginButton.addEventListener('click', () => {
        isLoginMode = true;
        openAuthModal('Sign In');
    });
}

if (signupButton) {
    signupButton.addEventListener('click', () => {
        isLoginMode = false;
        openAuthModal('Sign Up');
    });
}

// Event listener for logoutButton
if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
}

// Event listener for closeModalBtn
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeAuthModal);
}

// Event listener for authForm
if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (isLoginMode) {
            await handleLogin(email, password);
        } else {
            await handleSignup(email, password);
        }
    });
}

// Event listener for syncDataBtn
if (syncDataBtn) {
    syncDataBtn.addEventListener('click', async () => {
        if (!currentUser) {
            alert('Please sign in to sync your data');
            return;
        }
        
        await syncDataToSupabase();
    });
}

// Auth functions
async function handleLogin(email, password) {
    showLoading();
    
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        
        hideLoading();
        
        if (error) {
            // Provide more specific error messages for common errors
            if (error.message.includes('Email not confirmed')) {
                showError('Please check your email and confirm your account before signing in. Check your spam folder if needed.');
            } else if (error.message.includes('Invalid login credentials')) {
                showError('Invalid email or password. Please try again.');
            } else {
                showError(error.message);
            }
            return;
        }
        
        handleSuccessfulAuth(data.user);
        closeAuthModal();
        loadUserData();
        animateUIElements();
    } catch (err) {
        hideLoading();
        showError('An unexpected error occurred. Please try again later.');
        console.error('Login error:', err);
    }
}

async function handleSignup(email, password) {
    showLoading();
    
    try {
        // Get the current domain without port
        const currentDomain = window.location.protocol + '//' + window.location.hostname;
        
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: currentDomain + '/auth.html'
            }
        });
        
        hideLoading();
        
        if (error) {
            showError(error.message);
            return;
        }
        
        // Always show confirmation message since Supabase is configured to require email verification
        closeAuthModal();
        alert(`Account created! Please check your email (${email}) to confirm your account before signing in. Check your spam folder if you don't see the confirmation email.`);
        
        // Don't create user profile or set currentUser until they've confirmed their email
    } catch (err) {
        hideLoading();
        showError('An unexpected error occurred during signup. Please try again later.');
        console.error('Signup error:', err);
    }
}

async function handleLogout() {
    showLoading();
    
    try {
        const { error } = await supabaseClient.auth.signOut();
        
        hideLoading();
        
        if (error) {
            console.error('Error logging out:', error.message);
            alert('Error signing out: ' + error.message);
            return;
        }
        
        currentUser = null;
        if (userEmail) userEmail.textContent = '';
        if (loginButton) loginButton.style.display = 'inline-block';
        if (signupButton) signupButton.style.display = 'inline-block';
        if (logoutButton) logoutButton.style.display = 'none';
        
        // Reset local data display but keep the data in localStorage
        // This way users can still use the app without logging in
    } catch (err) {
        hideLoading();
        console.error('Logout error:', err);
        alert('An unexpected error occurred during logout. Please try again.');
    }
}

// Database functions
async function createUserProfile(userId) {
    try {
        // Create a profile record for the new user
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
        console.error('Error creating user profile:', err);
    }
}

async function syncDataToSupabase() {
    if (!currentUser) {
        alert('Please sign in to sync your data');
        return;
    }
    
    try {
        // Get sleep history from localStorage
        const sleepHistoryString = localStorage.getItem('sleepHistory');
        if (!sleepHistoryString) {
            alert('No sleep data to sync');
            return;
        }
        
        const sleepHistory = JSON.parse(sleepHistoryString);
        showLoading();
        
        // First, delete existing records for this user
        const { error: deleteError } = await supabaseClient
            .from('sleep_records')
            .delete()
            .eq('user_id', currentUser.id);
            
        if (deleteError) {
            hideLoading();
            console.error('Error deleting existing records:', deleteError.message);
            alert('Error syncing data: ' + deleteError.message);
            return;
        }
        
        // Insert all sleep records
        const records = sleepHistory.map(entry => ({
            user_id: currentUser.id,
            date: entry.date,
            total_sleep: entry.totalSleep,
            sleep_debt: entry.sleepDebt,
            ideal_sleep_per_day: entry.idealSleepPerDay,
            sleep_quality: entry.sleepQuality,
            sleep_hours: entry.sleepHours,
            created_at: new Date()
        }));
        
        const { error } = await supabaseClient
            .from('sleep_records')
            .insert(records);
        
        hideLoading();
        
        if (error) {
            console.error('Error syncing data:', error.message);
            alert('Error syncing data: ' + error.message);
        } else {
            alert('Data synced successfully!');
        }
    } catch (err) {
        hideLoading();
        console.error('Error syncing data:', err);
        alert('An unexpected error occurred while syncing data. Please try again.');
    }
}

async function loadUserData() {
    if (!currentUser) return;
    
    try {
        showLoading();
        
        // Fetch sleep records for this user
        const { data, error } = await supabaseClient
            .from('sleep_records')
            .select()
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });
        
        hideLoading();
        
        if (error) {
            console.error('Error loading user data:', error.message);
            return;
        }
        
        if (data && data.length > 0) {
            // Process and display the data
            const sleepHistoryFromDB = data.map(record => ({
                date: record.date,
                totalSleep: record.total_sleep,
                sleepDebt: record.sleep_debt,
                idealSleepPerDay: record.ideal_sleep_per_day,
                sleepQuality: record.sleep_quality,
                sleepHours: record.sleep_hours
            }));
            
            // Merge with local data or replace it
            const localHistory = localStorage.getItem('sleepHistory') 
                ? JSON.parse(localStorage.getItem('sleepHistory')) 
                : [];
                
            const mergedHistory = mergeHistoryData(sleepHistoryFromDB, localHistory);
            
            // Save to localStorage
            localStorage.setItem('sleepHistory', JSON.stringify(mergedHistory));
            
            // Update UI
            if (typeof renderSleepHistory === 'function') {
                renderSleepHistory();
            }
        }
    } catch (err) {
        hideLoading();
        console.error('Error loading user data:', err);
    }
}

// UI Helper functions
function showWelcomeOverlay() {
    if (!welcomeOverlay) return;
    welcomeOverlay.style.display = 'flex';
}

function hideWelcomeOverlay() {
    if (!welcomeOverlay) return;
    welcomeOverlay.style.display = 'none';
}

function openAuthModal(title) {
    if (!authModal || !modalTitle) return;
    
    modalTitle.textContent = title;
    authModal.style.display = 'block';
    
    // Clear previous errors
    if (authError) authError.textContent = '';
}

function closeAuthModal() {
    if (!authModal) return;
    authModal.style.display = 'none';
}

function handleSuccessfulAuth(user) {
    currentUser = user;
    if (userEmail) userEmail.textContent = user.email;
    if (loginButton) loginButton.style.display = 'none';
    if (signupButton) signupButton.style.display = 'none';
    if (logoutButton) logoutButton.style.display = 'inline-block';
}

function showError(message) {
    if (!authError) {
        console.error(message);
        return;
    }
    authError.textContent = message;
    authError.style.display = 'block';
}

function showLoading() {
    // You could add a loading spinner here
    document.body.style.cursor = 'wait';
    
    // Disable all buttons during loading
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.disabled = true;
    });
}

function hideLoading() {
    // Hide loading spinner
    document.body.style.cursor = 'default';
    
    // Re-enable all buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.disabled = false;
    });
}

function animateUIElements() {
    try {
        // Add animation classes to UI elements for a smoother experience
        const elements = [
            document.querySelector('header'),
            document.getElementById('calculator'),
            document.querySelector('.result-container'),
            document.querySelector('.sleep-chart-container'),
            document.querySelector('.recommendations'),
            document.querySelector('.history-container')
        ];
        
        elements.forEach((element, index) => {
            if (!element) return;
            
            // Add a slight delay for each element to create a cascade effect
            setTimeout(() => {
                element.classList.add('animate-in');
            }, index * 100);
        });
    } catch (err) {
        console.error('Animation error:', err);
        // Non-critical error, don't show to user
    }
}

// Close modal when clicking outside of it
window.addEventListener('click', (e) => {
    if (e.target === authModal) {
        closeAuthModal();
    }
});

// Utility function to merge cloud and local data
function mergeHistoryData(cloudData, localData) {
    try {
        if (!localData || localData.length === 0) return cloudData;
        if (!cloudData || cloudData.length === 0) return localData;
        
        // Create a map of existing entries by date
        const dataMap = new Map();
        
        // Add local data first
        localData.forEach(entry => {
            dataMap.set(entry.date, entry);
        });
        
        // Add or update with cloud data (cloud takes precedence)
        cloudData.forEach(entry => {
            dataMap.set(entry.date, entry);
        });
        
        // Convert map back to array and sort by date (newest first)
        return Array.from(dataMap.values()).sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
    } catch (err) {
        console.error('Error merging data:', err);
        // If there's an error, return local data to be safe
        return localData;
    }
} 