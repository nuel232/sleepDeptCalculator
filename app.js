// DOM Elements - only declaring elements not already declared in supabase-auth.js
const calculatorForm = document.getElementById('calculator');
const resultDiv = document.getElementById('result');
const sleepChartDiv = document.getElementById('sleep-chart');
const recommendationsDiv = document.getElementById('recommendations-list');
const historyListDiv = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history');
// Removing duplicate declarations - these are already defined in supabase-auth.js
// const syncDataBtn = document.getElementById('sync-data');
// const logoutButton = document.getElementById('logout-button');
// const userEmailSpan = document.getElementById('user-email');
const themeToggle = document.getElementById('theme-toggle');
const qualityStars = document.querySelectorAll('.star');

// Variables
let sleepQualityRating = 0;
let sleepHistory = [];
let currentUserId = null;
let isGuestMode = localStorage.getItem('guestMode') === 'true';

// Check authentication status on page load
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const theme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', theme);
        updateThemeIcon();
        
        // Get saved sleep history from local storage
        loadSleepHistoryFromLocalStorage();
        renderSleepHistory();
        
        // Authentication is now handled by supabase-auth.js
        // Just initialize the UI components that don't depend on auth
        initializeEventHandlers();
    } catch (err) {
        console.error('Initialization error:', err);
        // Show a user-friendly error message
        showErrorMessage('There was an error loading the application. Please refresh the page and try again.');
    }
});

// Initialize event handlers that don't depend on authentication
function initializeEventHandlers() {
    try {
        // Star rating functionality
        if (qualityStars && qualityStars.length > 0) {
            qualityStars.forEach(star => {
                star.addEventListener('mouseover', highlightStars);
                star.addEventListener('mouseout', resetStars);
                star.addEventListener('click', setRating);
            });
        }
        
        // Theme toggle
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }
        
        // Clear history button
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', clearSleepHistory);
        }
        
        // Calculate button - added event listener programmatically
        const calculateBtn = document.getElementById('calculate-btn');
        if (calculateBtn) {
            // Remove the inline onclick attribute and add a proper event listener
            calculateBtn.removeAttribute('onclick');
            calculateBtn.addEventListener('click', calculateSleepDebt);
        }
    } catch (err) {
        console.error('Error initializing event handlers:', err);
    }
}

// Theme toggling
function toggleTheme() {
    try {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        updateThemeIcon();
    } catch (err) {
        console.error('Error toggling theme:', err);
    }
}

function updateThemeIcon() {
    try {
        if (!themeToggle) return;
        
        const currentTheme = document.body.getAttribute('data-theme');
        const icon = themeToggle.querySelector('i');
        
        if (!icon) return;
        
        if (currentTheme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    } catch (err) {
        console.error('Error updating theme icon:', err);
    }
}

// Star rating functions
function highlightStars(e) {
    try {
        const value = parseInt(e.currentTarget.dataset.value);
        updateStarDisplay(value);
    } catch (err) {
        console.error('Error highlighting stars:', err);
    }
}

function resetStars() {
    try {
        updateStarDisplay(sleepQualityRating);
    } catch (err) {
        console.error('Error resetting stars:', err);
    }
}

function setRating(e) {
    try {
        sleepQualityRating = parseInt(e.currentTarget.dataset.value);
        updateStarDisplay(sleepQualityRating);
    } catch (err) {
        console.error('Error setting star rating:', err);
    }
}

function updateStarDisplay(value) {
    try {
        if (!qualityStars) return;
        
        qualityStars.forEach(star => {
            const starValue = parseInt(star.dataset.value);
            const icon = star.querySelector('i');
            
            if (!icon) return;
            
            if (starValue <= value) {
                icon.classList.add('active');
            } else {
                icon.classList.remove('active');
            }
        });
    } catch (err) {
        console.error('Error updating star display:', err);
    }
}

// Helper function to show an error message to the user
function showErrorMessage(message) {
    try {
        // Check if there's a result div we can use
        if (resultDiv) {
            resultDiv.innerHTML = `
                <div class="error-message">
                    <p><strong>Error:</strong> ${message}</p>
                </div>
            `;
            resultDiv.scrollIntoView({ behavior: 'smooth' });
        } else {
            // Fallback to alert
            alert(message);
        }
    } catch (err) {
        // Last resort
        alert(message);
        console.error('Error showing error message:', err);
    }
}

// Main functionality
function calculateSleepDebt() {
    try {
        // Get values from inputs
        const mondaySleep = parseFloat(document.getElementById('monday')?.value) || 0;
        const tuesdaySleep = parseFloat(document.getElementById('tuesday')?.value) || 0;
        const wednesdaySleep = parseFloat(document.getElementById('wednesday')?.value) || 0;
        const thursdaySleep = parseFloat(document.getElementById('thursday')?.value) || 0;
        const fridaySleep = parseFloat(document.getElementById('friday')?.value) || 0;
        const saturdaySleep = parseFloat(document.getElementById('saturday')?.value) || 0;
        const sundaySleep = parseFloat(document.getElementById('sunday')?.value) || 0;
        const idealSleep = parseFloat(document.getElementById('ideal-sleep')?.value) || 8;
        
        // Calculate total sleep hours
        const actualSleepHours = mondaySleep + tuesdaySleep + wednesdaySleep + 
                                thursdaySleep + fridaySleep + saturdaySleep + sundaySleep;
        
        // Calculate ideal sleep hours
        const idealSleepHours = idealSleep * 7;
        
        // Calculate sleep debt/surplus
        const sleepDifference = actualSleepHours - idealSleepHours;
        
        // Calculate average daily sleep
        const averageSleep = (actualSleepHours / 7).toFixed(1);
        
        // Generate result message
        let resultMessage = '';
        let resultClass = '';
        
        if (sleepDifference < -10) {
            resultMessage = `<strong>Severe Sleep Debt:</strong> You're ${Math.abs(sleepDifference).toFixed(1)} hours short of your ideal sleep. This is a serious sleep deficit that can affect health and cognitive function.`;
            resultClass = 'severe-debt';
        } else if (sleepDifference < -5) {
            resultMessage = `<strong>Moderate Sleep Debt:</strong> You're ${Math.abs(sleepDifference).toFixed(1)} hours short of your ideal sleep. This level of sleep debt can impact mood and performance.`;
            resultClass = 'moderate-debt';
        } else if (sleepDifference < 0) {
            resultMessage = `<strong>Mild Sleep Debt:</strong> You're ${Math.abs(sleepDifference).toFixed(1)} hours short of your ideal sleep. Try to catch up on sleep this weekend.`;
            resultClass = 'mild-debt';
        } else if (sleepDifference === 0) {
            resultMessage = `<strong>Perfect Sleep Balance:</strong> You got exactly your ideal amount of sleep this week!`;
            resultClass = 'balanced';
        } else {
            resultMessage = `<strong>Sleep Surplus:</strong> You got ${sleepDifference.toFixed(1)} hours more than your ideal sleep amount this week.`;
            resultClass = 'surplus';
        }
        
        // Display result
        if (resultDiv) {
            resultDiv.innerHTML = `
                <div class="result-details ${resultClass}">
                    <div class="result-summary">
                        <div class="result-item">
                            <span class="result-label">Total Sleep</span>
                            <span class="result-value">${actualSleepHours.toFixed(1)} hrs</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Ideal Sleep</span>
                            <span class="result-value">${idealSleepHours.toFixed(1)} hrs</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Average Daily</span>
                            <span class="result-value">${averageSleep} hrs</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Sleep Debt</span>
                            <span class="result-value">${sleepDifference.toFixed(1)} hrs</span>
                        </div>
                    </div>
                    <p class="result-message">${resultMessage}</p>
                </div>
            `;
        }
        
        // Update chart
        renderSleepChart([mondaySleep, tuesdaySleep, wednesdaySleep, thursdaySleep, fridaySleep, saturdaySleep, sundaySleep], idealSleep);
        
        // Generate and display recommendations
        generateRecommendations(sleepDifference, averageSleep);
        
        // Save to history
        saveSleepData({
            date: new Date().toISOString(),
            totalSleep: actualSleepHours,
            idealSleep: idealSleepHours,
            sleepDebt: sleepDifference,
            averageSleep: parseFloat(averageSleep),
            quality: sleepQualityRating,
            dailyData: {
                monday: mondaySleep,
                tuesday: tuesdaySleep,
                wednesday: wednesdaySleep,
                thursday: thursdaySleep,
                friday: fridaySleep,
                saturday: saturdaySleep,
                sunday: sundaySleep
            }
        });
    } catch (err) {
        console.error('Error calculating sleep debt:', err);
        showErrorMessage('There was an error calculating your sleep debt. Please try again.');
    }
}

// Chart rendering
function renderSleepChart(dailyData, idealSleep) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const maxSleep = Math.max(...dailyData, idealSleep) + 2;
    
    let chartHTML = '<div class="chart-container">';
    
    // Add bars for each day
    days.forEach((day, index) => {
        const sleepHours = dailyData[index];
        const barHeight = (sleepHours / maxSleep) * 100;
        const barClass = sleepHours < idealSleep ? 'sleep-deficit' : 'sleep-surplus';
        
        chartHTML += `
            <div class="chart-column">
                <div class="chart-label">${sleepHours.toFixed(1)}h</div>
                <div class="chart-bar ${barClass}" style="height: ${barHeight}%"></div>
                <div class="chart-day">${day.substring(0, 3)}</div>
            </div>
        `;
    });
    
    // Add ideal sleep reference line
    const idealLinePosition = (idealSleep / maxSleep) * 100;
    chartHTML += `
        <div class="ideal-sleep-line" style="bottom: ${idealLinePosition}%">
            <span class="ideal-label">Ideal (${idealSleep}h)</span>
        </div>
    `;
    
    chartHTML += '</div>';
    sleepChartDiv.innerHTML = chartHTML;
}

// Recommendations
function generateRecommendations(sleepDifference, averageSleep) {
    let recommendations = [];
    
    if (sleepDifference < -10) {
        recommendations = [
            "Consider seeing a sleep specialist to address your severe sleep debt.",
            "Block off 8-9 hours for sleep each night for the next two weeks to recover.",
            "Avoid caffeine after noon and eliminate alcohol until your sleep debt improves.",
            "Create a strict wind-down routine starting 90 minutes before bedtime.",
            "Take a short 20-minute nap in the early afternoon if possible."
        ];
    } else if (sleepDifference < -5) {
        recommendations = [
            "Aim for an extra hour of sleep each night for the next week.",
            "Maintain a consistent sleep schedule, even on weekends.",
            "Reduce screen time in the evening, especially within 1 hour of bedtime.",
            "Consider relaxation techniques like meditation before bed.",
            "Evaluate your sleep environment for noise, light, and temperature issues."
        ];
    } else if (sleepDifference < 0) {
        recommendations = [
            "Try to get to bed 30 minutes earlier for the next few days.",
            "Avoid heavy meals within 3 hours of bedtime.",
            "Ensure your bedroom is cool, dark, and quiet.",
            "Consider using white noise if environmental sounds disturb your sleep.",
            "Try to catch up on sleep during the weekend (but not more than 1 hour extra)."
        ];
    } else if (sleepDifference === 0) {
        recommendations = [
            "Excellent job! Keep maintaining your current sleep schedule.",
            "Continue to prioritize your sleep habits.",
            "Consider tracking your sleep quality using a sleep journal or app.",
            "Make sure you're getting enough physical activity during the day for optimal sleep quality.",
            "Share your successful sleep habits with friends and family."
        ];
    } else {
        recommendations = [
            "You're getting more sleep than your target, which is generally good.",
            "Make sure excessive sleep isn't due to depression or other health issues.",
            "Try to maintain a consistent wake-up time, even if you go to bed later.",
            "Consider the quality of your sleep - more isn't always better if quality is poor.",
            "If you feel well-rested, you might adjust your ideal sleep time slightly downward."
        ];
    }
    
    if (averageSleep < 6) {
        recommendations.push("Your average daily sleep is significantly below recommendations for adults. Try to gradually increase your sleep time.");
    } else if (averageSleep > 10) {
        recommendations.push("You're sleeping more than most adults need. If you don't feel refreshed, consult a healthcare provider.");
    }
    
    if (sleepQualityRating <= 2) {
        recommendations.push("Your sleep quality rating is low. Consider factors that might be disrupting your sleep quality, like stress or sleep environment.");
    }
    
    let recHTML = '<ul class="recommendations-list">';
    recommendations.forEach(rec => {
        recHTML += `<li>${rec}</li>`;
    });
    recHTML += '</ul>';
    
    recommendationsDiv.innerHTML = recHTML;
}

// History management
function saveSleepData(data) {
    // Add to beginning of array to show newest first
    sleepHistory.unshift(data);
    
    // Limit history to last 10 entries
    if (sleepHistory.length > 10) {
        sleepHistory = sleepHistory.slice(0, 10);
    }
    
    // Save to localStorage
    localStorage.setItem('sleepHistory', JSON.stringify(sleepHistory));
    
    // If logged in, save to database
    if (currentUserId) {
        saveSleepDataToDatabase(data);
    }
    
    // Refresh history display
    renderSleepHistory();
}

function renderSleepHistory() {
    if (sleepHistory.length === 0) {
        historyListDiv.innerHTML = '<p class="empty-history">No sleep data recorded yet.</p>';
        return;
    }
    
    let historyHTML = '<div class="history-items">';
    
    sleepHistory.forEach((item, index) => {
        const date = new Date(item.date).toLocaleDateString();
        const qualityStars = getStarRating(item.quality);
        const resultClass = getResultClass(item.sleepDebt);
        
        historyHTML += `
            <div class="history-item ${resultClass}">
                <div class="history-date">${date}</div>
                <div class="history-details">
                    <div class="history-data">
                        <span>Total: ${item.totalSleep.toFixed(1)}h</span>
                        <span>Avg: ${item.averageSleep.toFixed(1)}h/day</span>
                        <span class="sleep-debt">Debt: ${item.sleepDebt.toFixed(1)}h</span>
                    </div>
                    <div class="history-quality">
                        ${qualityStars}
                    </div>
                </div>
            </div>
        `;
    });
    
    historyHTML += '</div>';
    historyListDiv.innerHTML = historyHTML;
}

function getStarRating(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star active"></i>';
        } else {
            stars += '<i class="fas fa-star"></i>';
        }
    }
    return stars;
}

function getResultClass(sleepDebt) {
    if (sleepDebt < -10) return 'severe-debt';
    if (sleepDebt < -5) return 'moderate-debt';
    if (sleepDebt < 0) return 'mild-debt';
    if (sleepDebt === 0) return 'balanced';
    return 'surplus';
}

function clearSleepHistory() {
    if (confirm('Are you sure you want to clear all sleep history?')) {
        sleepHistory = [];
        localStorage.removeItem('sleepHistory');
        renderSleepHistory();
        
        if (currentUserId) {
            clearSleepDataFromDatabase();
        }
    }
}

function loadSleepHistoryFromLocalStorage() {
    const savedHistory = localStorage.getItem('sleepHistory');
    if (savedHistory) {
        sleepHistory = JSON.parse(savedHistory);
    }
}

// Database operations
async function saveSleepDataToDatabase(data) {
    try {
        const { error } = await supabaseClient
            .from('sleep_records')
            .insert([
                {
                    user_id: currentUserId,
                    record_date: data.date,
                    total_sleep: data.totalSleep,
                    ideal_sleep: data.idealSleep,
                    sleep_debt: data.sleepDebt,
                    average_sleep: data.averageSleep,
                    quality_rating: data.quality,
                    daily_data: data.dailyData
                }
            ]);
            
        if (error) {
            console.error('Error saving sleep data:', error);
        }
    } catch (err) {
        console.error('Database save error:', err);
    }
}

async function syncSleepDataFromDatabase() {
    try {
        const { data, error } = await supabaseClient
            .from('sleep_records')
            .select('*')
            .eq('user_id', currentUserId)
            .order('record_date', { ascending: false })
            .limit(10);
            
        if (error) {
            console.error('Error fetching sleep data:', error);
            return;
        }
        
        if (data && data.length > 0) {
            // Transform database format to app format
            const dbHistory = data.map(record => ({
                date: record.record_date,
                totalSleep: record.total_sleep,
                idealSleep: record.ideal_sleep,
                sleepDebt: record.sleep_debt,
                averageSleep: record.average_sleep,
                quality: record.quality_rating,
                dailyData: record.daily_data
            }));
            
            // Merge with local data, keeping the most recent entries
            const mergedHistory = mergeHistoryData(dbHistory, sleepHistory);
            sleepHistory = mergedHistory;
            
            // Save merged data to localStorage
            localStorage.setItem('sleepHistory', JSON.stringify(sleepHistory));
            
            // Update UI
            renderSleepHistory();
        }
    } catch (err) {
        console.error('Database sync error:', err);
    }
}

function mergeHistoryData(dbData, localData) {
    // Create a map of dates for easy lookup
    const dateMap = new Map();
    
    // Add database entries to map
    dbData.forEach(entry => {
        dateMap.set(entry.date, entry);
    });
    
    // Add local entries, overwriting DB entries if they exist
    localData.forEach(entry => {
        dateMap.set(entry.date, entry);
    });
    
    // Convert map back to array and sort by date (newest first)
    const mergedData = Array.from(dateMap.values()).sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    
    // Limit to 10 entries
    return mergedData.slice(0, 10);
}

async function syncSleepData() {
    if (!currentUserId) {
        alert('You must be logged in to sync data.');
        return;
    }
    
    try {
        // First clear existing records
        await clearSleepDataFromDatabase();
        
        // Then upload all local records
        const promises = sleepHistory.map(data => 
            supabaseClient
                .from('sleep_records')
                .insert([
                    {
                        user_id: currentUserId,
                        record_date: data.date,
                        total_sleep: data.totalSleep,
                        ideal_sleep: data.idealSleep,
                        sleep_debt: data.sleepDebt,
                        average_sleep: data.averageSleep,
                        quality_rating: data.quality,
                        daily_data: data.dailyData
                    }
                ])
        );
        
        await Promise.all(promises);
        alert('Data synchronized successfully!');
    } catch (err) {
        console.error('Sync error:', err);
        alert('Error syncing data. Please try again.');
    }
}

async function clearSleepDataFromDatabase() {
    if (!currentUserId) return;
    
    try {
        const { error } = await supabaseClient
            .from('sleep_records')
            .delete()
            .eq('user_id', currentUserId);
            
        if (error) {
            console.error('Error clearing sleep data:', error);
        }
    } catch (err) {
        console.error('Database clear error:', err);
    }
} 