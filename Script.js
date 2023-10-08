document.addEventListener("DOMContentLoaded", function () {
    const calculateButton = document.querySelector("button"); // Select the button element
    const resultDiv = document.getElementById("result");

    calculateButton.addEventListener("click", function () {
        let totalSleep = 0;

        // Get sleep hours for each day of the week
        const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
        for (const day of daysOfWeek) {
            const sleepHours = parseFloat(document.getElementById(day).value);
            if (!isNaN(sleepHours) && sleepHours >= 0 && sleepHours <= 24) {
                totalSleep += sleepHours;
            } else {
                alert("Please enter a valid number between 0 and 24 for " + day + ".");
                return;
            }
        }

        // Calculate sleep debt
        const idealSleepPerDay = 8;
        const idealSleepPerWeek = idealSleepPerDay * 7;
        const sleepDebt = idealSleepPerWeek - totalSleep;

        // Display result
        if (sleepDebt < 0) {
            resultDiv.textContent = `You've had ${-sleepDebt} hours more sleep!`;
        } else {
            resultDiv.textContent = `You need ${sleepDebt} hours of sleep this week.`;
        }
    });
});
