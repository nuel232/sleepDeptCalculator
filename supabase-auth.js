// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM elements
const authModal = document.getElementById('auth-modal');
const modalTitle = document.getElementById('modal-title');
const authForm = document.getElementById('auth-form');
const authSubmit = document.getElementById('auth-submit');
const authError = document.getElementById('auth-error');
const loginButton = document.getElementById('login-button');
const signupButton = document.getElementById('signup-button');
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
    // Show welcome overlay
    showWelcomeOverlay();
    
    // Welcome button event listeners
    welcomeLoginBtn.addEventListener('click', () => {
        hideWelcomeOverlay();
        isLoginMode = true;
        openAuthModal('Sign In');
    });
    
    welcomeSignupBtn.addEventListener('click', () => {
        hideWelcomeOverlay();
        isLoginMode = false;
        openAuthModal('Sign Up');
    });
    
    welcomeGuestBtn.addEventListener('click', () => {
        hideWelcomeOverlay();
    });
    
    // Check for existing session
    const { data, error } = await supabaseClient.auth.getSession();
    
    if (data.session) {
        const { user } = data.session;
        handleSuccessfulAuth(user);
        hideWelcomeOverlay();
        loadUserData();
        animateUIElements();
    }
});

// Event listeners
loginButton.addEventListener('click', () => {
    isLoginMode = true;
    openAuthModal('Sign In');
});

signupButton.addEventListener('click', () => {
    isLoginMode = false;
    openAuthModal('Sign Up');
});

logoutButton.addEventListener('click', handleLogout);

closeModalBtn.addEventListener('click', closeAuthModal);

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

syncDataBtn.addEventListener('click', async () => {
    if (!currentUser) {
        alert('Please sign in to sync your data');
        return;
    }
    
    await syncDataToSupabase();
});

// Auth functions
async function handleLogin(email, password) {
    showLoading();
    
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
}

async function handleSignup(email, password) {
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
    
    hideLoading();
    
    if (error) {
        showError(error.message);
        return;
    }
    
    // Always show confirmation message since Supabase is configured to require email verification
    closeAuthModal();
    alert(`Account created! Please check your email (${email}) to confirm your account before signing in. Check your spam folder if you don't see the confirmation email.`);
    
    // Don't create user profile or set currentUser until they've confirmed their email
}

async function handleLogout() {
    showLoading();
    
    const { error } = await supabaseClient.auth.signOut();
    
    hideLoading();
    
    if (error) {
        console.error('Error logging out:', error.message);
        return;
    }
    
    currentUser = null;
    userEmail.textContent = '';
    loginButton.style.display = 'inline-block';
    signupButton.style.display = 'inline-block';
    logoutButton.style.display = 'none';
    
    // Reset local data display but keep the data in localStorage
    // This way users can still use the app without logging in
}

// Database functions
async function createUserProfile(userId) {
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
}

async function syncDataToSupabase() {
    if (!currentUser) return;
    
    // Get sleep history from localStorage
    const sleepHistoryString = localStorage.getItem('sleepHistory');
    if (!sleepHistoryString) {
        alert('No sleep data to sync');
        return;
    }
    
    const sleepHistory = JSON.parse(sleepHistoryString);
    showLoading();
    
    // First, delete existing records for this user
    await supabaseClient
        .from('sleep_records')
        .delete()
        .eq('user_id', currentUser.id);
    
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
        alert('Error syncing data. Please try again.');
    } else {
        alert('Data synced successfully!');
    }
}

async function loadUserData() {
    if (!currentUser) return;
    
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
        // Ask user if they want to load cloud data
        const loadCloud = confirm('Load your saved data from the cloud?');
        if (loadCloud) {
            // Convert the data format from Supabase to match our app's format
            const formattedData = data.map(record => ({
                date: record.date,
                totalSleep: record.total_sleep,
                sleepDebt: record.sleep_debt,
                idealSleepPerDay: record.ideal_sleep_per_day,
                sleepQuality: record.sleep_quality,
                sleepHours: record.sleep_hours
            }));
            
            // Update localStorage
            localStorage.setItem('sleepHistory', JSON.stringify(formattedData));
            
            // Refresh the display
            sleepHistory = formattedData;
            displaySleepHistory();
        }
    }
}

// UI Helper functions
function showWelcomeOverlay() {
    welcomeOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function hideWelcomeOverlay() {
    welcomeOverlay.style.opacity = '0';
    setTimeout(() => {
        welcomeOverlay.style.display = 'none';
        document.body.style.overflow = 'auto'; // Re-enable scrolling
    }, 500);
}

function openAuthModal(title) {
    modalTitle.textContent = title;
    authSubmit.textContent = title;
    authError.style.display = 'none';
    authModal.style.display = 'block';
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
}

function closeAuthModal() {
    authModal.style.display = 'none';
}

function handleSuccessfulAuth(user) {
    currentUser = user;
    userEmail.textContent = user.email;
    loginButton.style.display = 'none';
    signupButton.style.display = 'none';
    logoutButton.style.display = 'inline-block';
}

function showError(message) {
    authError.textContent = message;
    authError.style.display = 'block';
}

function showLoading() {
    // You could add a loading spinner here
    document.body.style.cursor = 'wait';
}

function hideLoading() {
    document.body.style.cursor = 'default';
}

// Animate UI elements with staggered animation
function animateUIElements() {
    const cards = [
        document.getElementById('calculator'),
        document.querySelector('.result-container'),
        document.querySelector('.sleep-chart-container'),
        document.querySelector('.recommendations'),
        document.querySelector('.history-container')
    ];
    
    // Reset any existing animations
    cards.forEach(card => {
        if (card) {
            card.style.animation = 'none';
            card.offsetHeight; // Trigger reflow
        }
    });
    
    // Apply staggered animations
    cards.forEach((card, index) => {
        if (card) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.animation = `slideInUp 0.5s ease-out ${index * 0.1}s forwards`;
        }
    });
}

// Close modal when clicking outside of it
window.addEventListener('click', (e) => {
    if (e.target === authModal) {
        closeAuthModal();
    }
}); 