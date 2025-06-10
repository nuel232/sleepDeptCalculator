// Global variables
let sleepQualityRating = 0;
let sleepHistory = [];
const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const defaultIdealSleepHours = 8;

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load saved data from localStorage
    loadSavedData();
    
    // Initialize the sleep quality rating stars
    initializeStarRating();
    
    // Initialize dark mode toggle
    initializeThemeToggle();
    
    // Add event listener for the clear history button
    document.getElementById('clear-history').addEventListener('click', clearHistory);
});

// Initialize star rating functionality
function initializeStarRating() {
    const stars = document.querySelectorAll('.star');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const value = parseInt(this.getAttribute('data-value'));
            sleepQualityRating = value;
            
            // Update the UI to reflect the selected rating
            stars.forEach(s => {
                const starValue = parseInt(s.getAttribute('data-value'));
                if (starValue <= value) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });
}

// Initialize theme toggle functionality
function initializeThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const icon = themeToggle.querySelector('i');
    
    // Check if there's a saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        icon.classList.replace('fa-moon', 'fa-sun');
    }
    
    // Add event listener for theme toggle
    themeToggle.addEventListener('click', function() {
        if (document.body.getAttribute('data-theme') === 'dark') {
            document.body.removeAttribute('data-theme');
            icon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'light');
        } else {
            document.body.setAttribute('data-theme', 'dark');
            icon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'dark');
        }
    });
}

// Load saved data from localStorage
function loadSavedData() {
    // Load sleep history
    const savedHistory = localStorage.getItem('sleepHistory');
    if (savedHistory) {
        sleepHistory = JSON.parse(savedHistory);
        displaySleepHistory();
    }
    
    // Load last week's data
    const savedWeekData = localStorage.getItem('lastWeekData');
    if (savedWeekData) {
        const weekData = JSON.parse(savedWeekData);
        
        // Fill in the form with saved data
        days.forEach(day => {
            if (weekData[day] !== undefined) {
                document.getElementById(day).value = weekData[day];
            }
        });
        
        // If there was a saved ideal sleep value, set it
        if (weekData.idealSleep) {
            document.getElementById('ideal-sleep').value = weekData.idealSleep;
        }
    }
}

// Main function to calculate sleep debt
function calculateSleepDebt() {
    // Get all sleep hours inputs
    const sleepHours = {};
    days.forEach(day => {
        const value = parseFloat(document.getElementById(day).value);
        sleepHours[day] = isNaN(value) ? 0 : value;
    });
    
    // Get ideal sleep hours
    const idealSleepPerDay = parseFloat(document.getElementById('ideal-sleep').value) || defaultIdealSleepHours;
    const idealSleepHoursPerWeek = 7 * idealSleepPerDay;
    const sleepThreshold = idealSleepPerDay - 1; // Threshold for inadequate sleep (1 hour less than ideal)
    
    // Validate input values
    for (const day in sleepHours) {
        if (sleepHours[day] > 24) {
            document.getElementById('result').textContent = 
                `You entered ${sleepHours[day]} hours for ${day}, which exceeds 24 hours. Please enter a valid value.`;
      return;
    }
  }

  // Calculate total sleep
    const sleepValues = Object.values(sleepHours);
  const totalSleep = sleepValues.reduce((acc, curr) => acc + curr, 0);
  const sleepDebt = idealSleepHoursPerWeek - totalSleep;
    const avgSleepPerDay = totalSleep / 7;
    
    // Create result message
    let resultHTML = createResultMessage(totalSleep, sleepDebt, idealSleepHoursPerWeek, sleepHours, sleepThreshold);
    document.getElementById('result').innerHTML = resultHTML;
    
    // Generate and display the sleep chart
    createSleepChart(sleepHours, idealSleepPerDay);
    
    // Generate and display recommendations
    generateRecommendations(sleepDebt, sleepHours, avgSleepPerDay, sleepQualityRating);
    
    // Save the data to history
    saveToHistory(sleepHours, totalSleep, sleepDebt, idealSleepPerDay, sleepQualityRating);
    
    // Save this week's data to localStorage
    saveWeekData(sleepHours, idealSleepPerDay);
}

// Create the result message
function createResultMessage(totalSleep, sleepDebt, idealSleepHoursPerWeek, sleepHours, sleepThreshold) {
  let result = "";

    // Determine sleep debt result
    if (Math.abs(sleepDebt) < 0.5) {
        result = `<strong>Perfect balance!</strong> You got exactly the right amount of sleep (${totalSleep.toFixed(1)} hours).`;
    } else if (sleepDebt > 0) {
        result = `<strong>Sleep deficit:</strong> You need ${sleepDebt.toFixed(1)} more hours of sleep. You got ${totalSleep.toFixed(1)} hours out of an ideal ${idealSleepHoursPerWeek} hours.`;
    } else {
        result = `<strong>Extra sleep:</strong> You've had ${Math.abs(sleepDebt).toFixed(1)} hours more sleep than your ideal amount. You got ${totalSleep.toFixed(1)} hours out of an ideal ${idealSleepHoursPerWeek} hours.`;
    }
    
    // Check for days with inadequate sleep
    const inadequateSleepDays = Object.keys(sleepHours).filter(
        day => sleepHours[day] < sleepThreshold && sleepHours[day] > 0
    );
    
    if (inadequateSleepDays.length > 0) {
        const formattedDays = inadequateSleepDays.map(day => day.charAt(0).toUpperCase() + day.slice(1));
        result += `<br><br><strong>Low sleep days:</strong> You had inadequate sleep on: ${formattedDays.join(", ")}.`;
    }
    
    // Check for missed days
    const missedDays = Object.keys(sleepHours).filter(day => sleepHours[day] === 0);
    if (missedDays.length > 0) {
        const formattedMissedDays = missedDays.map(day => day.charAt(0).toUpperCase() + day.slice(1));
        result += `<br><br><strong>Missing data:</strong> No sleep data for: ${formattedMissedDays.join(", ")}.`;
    }
    
    return result;
}

// Create a visual chart of sleep patterns
function createSleepChart(sleepHours, idealSleepPerDay) {
    const chartContainer = document.getElementById('sleep-chart');
    chartContainer.innerHTML = ''; // Clear previous chart
    
    const maxSleepHours = Math.max(...Object.values(sleepHours), idealSleepPerDay);
    const chartHeight = 200; // Chart height in pixels
    const scale = chartHeight / (maxSleepHours + 1); // Scale factor for chart
    
    // Create grid lines
    for (let hour = 0; hour <= maxSleepHours + 1; hour += 2) {
        if (hour <= maxSleepHours) {
            const gridLine = document.createElement('div');
            gridLine.className = 'chart-grid';
            gridLine.style.bottom = (hour * scale + 30) + 'px';
            
            const gridLabel = document.createElement('div');
            gridLabel.className = 'chart-grid-label';
            gridLabel.textContent = hour + 'h';
            gridLabel.style.bottom = (hour * scale + 30 - 10) + 'px';
            
            chartContainer.appendChild(gridLine);
            chartContainer.appendChild(gridLabel);
        }
    }
    
    // Add ideal sleep line
    const idealLine = document.createElement('div');
    idealLine.className = 'ideal-line';
    idealLine.style.bottom = (idealSleepPerDay * scale + 30) + 'px';
    chartContainer.appendChild(idealLine);
    
    // Create bars for each day
    const dayAbbreviations = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    days.forEach((day, index) => {
        const hoursSlept = sleepHours[day];
        const barContainer = document.createElement('div');
        
        // Create bar
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        if (hoursSlept < idealSleepPerDay - 1 && hoursSlept > 0) {
            bar.classList.add('below-threshold');
        }
        
        // Set bar position and dimensions
        bar.style.height = (hoursSlept * scale) + 'px';
        bar.style.left = (index * (100 / 7) + (100 / 14)) + '%';
        
        // Add tooltip with exact hours
        bar.title = `${day.charAt(0).toUpperCase() + day.slice(1)}: ${hoursSlept} hours`;
        
        // Create label
        const label = document.createElement('div');
        label.className = 'chart-label';
        label.textContent = dayAbbreviations[index];
        label.style.left = (index * (100 / 7) + (100 / 14)) + '%';
        
        chartContainer.appendChild(bar);
        chartContainer.appendChild(label);
    });
}

// Generate sleep recommendations based on data analysis
function generateRecommendations(sleepDebt, sleepHours, avgSleepPerDay, sleepQuality) {
    const recommendationsContainer = document.getElementById('recommendations-list');
    recommendationsContainer.innerHTML = '';
    
    const recommendations = [];
    
    // Recommendation based on sleep debt
    if (sleepDebt > 7) {
        recommendations.push('You have a severe sleep deficit. Consider adjusting your schedule to allow for at least 1 more hour of sleep per night.');
    } else if (sleepDebt > 3) {
        recommendations.push('You have a moderate sleep deficit. Try to get to bed earlier on a few nights this week.');
    } else if (sleepDebt < -7) {
        recommendations.push('You\'re sleeping significantly more than your ideal amount. This could indicate a health issue or recovery from sleep debt.');
    }
    
    // Recommendation based on consistency
    const sleepValues = Object.values(sleepHours).filter(val => val > 0);
    if (sleepValues.length >= 2) {
        const maxDiff = Math.max(...sleepValues) - Math.min(...sleepValues);
        if (maxDiff > 4) {
            recommendations.push('Your sleep schedule is inconsistent. Try to maintain a more regular sleep schedule, even on weekends.');
        }
    }
    
    // Recommendation based on sleep quality
    if (sleepQuality === 1 || sleepQuality === 2) {
        recommendations.push('Your sleep quality is poor. Consider factors that may be affecting your sleep: stress, caffeine, screen time before bed, or your sleep environment.');
    } else if (sleepQuality === 3) {
        recommendations.push('Your sleep quality is average. Try relaxation techniques before bed to improve sleep quality.');
    }
    
    // Add general recommendations
    recommendations.push('The National Sleep Foundation recommends adults get 7-9 hours of sleep per night.');
    recommendations.push('Maintain a consistent sleep schedule, even on weekends.');
    recommendations.push('Create a relaxing bedtime routine and avoid screens 1 hour before bed.');
    recommendations.push('Make sure your bedroom is quiet, dark, and at a comfortable temperature.');
    
    // Display recommendations
    if (recommendations.length > 0) {
        const ul = document.createElement('ul');
        recommendations.forEach(rec => {
            const li = document.createElement('li');
            li.textContent = rec;
            ul.appendChild(li);
        });
        recommendationsContainer.appendChild(ul);
    }
}

// Save this week's data to history
function saveToHistory(sleepHours, totalSleep, sleepDebt, idealSleepPerDay, sleepQuality) {
    const date = new Date();
    const dateString = date.toLocaleDateString();
    
    // Create history entry
    const historyEntry = {
        date: dateString,
        totalSleep: totalSleep,
        sleepDebt: sleepDebt,
        idealSleepPerDay: idealSleepPerDay,
        sleepQuality: sleepQuality,
        sleepHours: {...sleepHours}
    };
    
    // Add to history array (limit to 10 entries)
    sleepHistory.unshift(historyEntry);
    if (sleepHistory.length > 10) {
        sleepHistory.pop();
    }
    
    // Save to localStorage
    localStorage.setItem('sleepHistory', JSON.stringify(sleepHistory));
    
    // Update the history display
    displaySleepHistory();
}

// Display sleep history
function displaySleepHistory() {
    const historyContainer = document.getElementById('history-list');
    historyContainer.innerHTML = '';
    
    if (sleepHistory.length === 0) {
        historyContainer.innerHTML = '<p>No history available yet.</p>';
        return;
    }
    
    sleepHistory.forEach(entry => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-entry';
        
        const dateDiv = document.createElement('div');
        dateDiv.textContent = entry.date;
        
        const infoDiv = document.createElement('div');
        infoDiv.innerHTML = `Total: ${entry.totalSleep.toFixed(1)}h, 
                            Debt: ${entry.sleepDebt.toFixed(1)}h, 
                            Quality: ${displayStars(entry.sleepQuality)}`;
        
        historyItem.appendChild(dateDiv);
        historyItem.appendChild(infoDiv);
        
        // Add click event to display detailed view
        historyItem.addEventListener('click', () => {
            displayHistoryDetails(entry);
        });
        
        historyContainer.appendChild(historyItem);
    });
}

// Display detailed view of a history entry
function displayHistoryDetails(entry) {
    // Create a modal or expand the entry to show detailed information
    alert(`
        Date: ${entry.date}
        Total Sleep: ${entry.totalSleep.toFixed(1)} hours
        Sleep Debt: ${entry.sleepDebt.toFixed(1)} hours
        Ideal Sleep: ${entry.idealSleepPerDay} hours per day
        Sleep Quality: ${entry.sleepQuality}/5
        
        Daily Breakdown:
        Monday: ${entry.sleepHours.monday} hours
        Tuesday: ${entry.sleepHours.tuesday} hours
        Wednesday: ${entry.sleepHours.wednesday} hours
        Thursday: ${entry.sleepHours.thursday} hours
        Friday: ${entry.sleepHours.friday} hours
        Saturday: ${entry.sleepHours.saturday} hours
        Sunday: ${entry.sleepHours.sunday} hours
    `);
    
    // In the future, you can replace this with a more elegant solution
}

// Clear history
function clearHistory() {
    if (confirm('Are you sure you want to clear your sleep history?')) {
        sleepHistory = [];
        localStorage.removeItem('sleepHistory');
        displaySleepHistory();
    }
}

// Save this week's data for future reference
function saveWeekData(sleepHours, idealSleepPerDay) {
    const weekData = {
        ...sleepHours,
        idealSleep: idealSleepPerDay
    };
    
    localStorage.setItem('lastWeekData', JSON.stringify(weekData));
}

// Utility function to display star rating
function displayStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= rating ? '★' : '☆';
    }
    return stars;
}

// When displaySleepHistory is called from supabase-auth.js
window.displaySleepHistory = displaySleepHistory;
window.sleepHistory = sleepHistory;