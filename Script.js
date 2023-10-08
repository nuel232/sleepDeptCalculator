function calculateSleepDebt() {
    
    
    const sleepHours = {
        monday:parseFloat(document.getElementById('monday').value),
        tuesday: parseFloat(document.getElementById('tuesday').value),
        wednesday: parseFloat(document.getElementById('wednesday').value),
        thursday: parseFloat(document.getElementById('thursday').value),
        friday: parseFloat(document.getElementById('friday').value),
        saturday: parseFloat(document.getElementById('saturday').value),
        sunday: parseFloat(document.getElementById('sunday').value)
    }
    if (sleepHours.sunday> 24) {
        document.getElementById('result').textContent = "You have inputed a value of more than 24 hours ";

    }else if (sleepHours.monday > 24) {
        document.getElementById('result').textContent = "You have inputted a value of more than 24 hours ";

    }else if (sleepHours.tuesday > 24) {
        document.getElementById('result').textContent = "You have inputed a value of more than 24 hours ";

    }else if (sleepHours.wednesday > 24) {
        document.getElementById('result').textContent = "You have inputed a value of more than 24 hours ";

    }else if (sleepHours.thursday > 24) {
        document.getElementById('result').textContent = "You have inputed a value of more than 24 hours ";

    }else if (sleepHours.friday > 24) {
        document.getElementById('result').textContent = "You have inputed a value of more than 24 hours ";

    }else if (sleepHours.saturday > 24) {
        document.getElementById('result').textContent = "You have inputed a value of more than 24 hours ";
    } else {
        const totalSleep = Object.values(sleepHours).reduce((acc, curr) => acc + curr, 0);
        const idealSleepHoursPerWeek = 7 * 8; // 8 hours of sleep per day for 7 days
        const sleepDebt = idealSleepHoursPerWeek - totalSleep;
    
        // Check if total sleep hours exceed 24
    
        let result = '';
    
        if (sleepDebt === 0) {
            result = 'You have no sleep debt. Great job!';
        } else if (sleepDebt > 0) {
            result = `You need ${sleepDebt} more hours of sleep this week.`;
        } else {
            result = `You've had more sleep than required by ${-sleepDebt} hours this week.`;
        }
    
        document.getElementById('result').textContent = result;
        
    }

}
