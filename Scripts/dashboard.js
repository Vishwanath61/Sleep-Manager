// Check if on dashboard page
if (window.location.pathname.includes("dashboard.html")) {
    const sleepForm = document.getElementById("sleepForm");
    const sleepDataList = document.getElementById("sleepDataList");

    // Get sleep data from local storage
    const getSleepData = () => {
        return JSON.parse(localStorage.getItem("sleepData")) || [];
    };

    // Save sleep data to local storage
    const saveSleepData = (data) => {
        localStorage.setItem("sleepData", JSON.stringify(data));
    };

    // Display sleep data in the list
    const displaySleepData = () => {
        const sleepData = getSleepData();
        sleepDataList.innerHTML = "";
        sleepData.forEach(item => {
            const li = document.createElement("li");
            li.textContent = `Date: ${item.date}, Sleep Time: ${item.sleepTime}, Wake Time: ${item.wakeTime}`;
            sleepDataList.appendChild(li);
        });
    };

    // Handle form submission
    sleepForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const date = document.getElementById("sleepDate").value;
        const sleepTime = document.getElementById("sleepTime").value;
        const wakeTime = document.getElementById("wakeTime").value;

        const newEntry = { date, sleepTime, wakeTime };
        const sleepData = getSleepData();
        sleepData.push(newEntry);
        saveSleepData(sleepData);
        displaySleepData();
        sleepForm.reset();
    });

    // Display the existing sleep data on page load
    displaySleepData();
}
