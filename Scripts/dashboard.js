import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.x.x/firebase-firestore.js";

const db = getFirestore(app);

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

    // Calculate sleep duration
    const calculateDuration = (sleepDate, sleepTime, wakeDate, wakeTime) => {
        const sleepDateTime = new Date(`${sleepDate}T${sleepTime}`);
        const wakeDateTime = new Date(`${wakeDate}T${wakeTime}`);

        // Check if wake time is on the next day
        if (wakeDateTime < sleepDateTime) {
            wakeDateTime.setDate(wakeDateTime.getDate() + 1);
        }

        const durationMs = wakeDateTime - sleepDateTime;
        const durationHrs = Math.floor(durationMs / (1000 * 60 * 60));
        const durationMins = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

        return `${durationHrs}h ${durationMins}m`;
    };

    // Display sleep data in the list with Edit and Delete buttons
    const displaySleepData = () => {
        const sleepData = getSleepData();
        sleepDataList.innerHTML = "";
        sleepData.forEach((item, index) => {
            const li = document.createElement("li");
            li.innerHTML = `
                Sleep: ${item.sleepDate} ${item.sleepTime} → Wake: ${item.wakeDate} ${item.wakeTime} 
                | Duration: ${item.duration}
                <button class="edit-btn" data-index="${index}">Edit</button>
                <button class="delete-btn" data-index="${index}">Delete</button>
            `;
            sleepDataList.appendChild(li);
        });

        // Add event listeners for Edit and Delete buttons
        document.querySelectorAll(".edit-btn").forEach(button => {
            button.addEventListener("click", (event) => {
                const index = event.target.getAttribute("data-index");
                editSleepData(index);
            });
        });

        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", (event) => {
                const index = event.target.getAttribute("data-index");
                deleteSleepData(index);
            });
        });
    };

    // Edit Sleep Data
    const editSleepData = (index) => {
        const sleepData = getSleepData();
        const entry = sleepData[index];

        // Prefill the form with existing data
        document.getElementById("sleepDate").value = entry.sleepDate;
        document.getElementById("sleepTime").value = entry.sleepTime;
        document.getElementById("wakeDate").value = entry.wakeDate;
        document.getElementById("wakeTime").value = entry.wakeTime;

        // Remove the existing entry to be updated
        sleepData.splice(index, 1);
        saveSleepData(sleepData);
        displaySleepData();
    };

    // Delete Sleep Data
    const deleteSleepData = (index) => {
        const sleepData = getSleepData();
        sleepData.splice(index, 1); // Remove the entry at the given index
        saveSleepData(sleepData);
        displaySleepData();
    };

    // Handle form submission
    sleepForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const sleepDate = document.getElementById("sleepDate").value;
        const sleepTime = document.getElementById("sleepTime").value;
        const wakeDate = document.getElementById("wakeDate").value;
        const wakeTime = document.getElementById("wakeTime").value;

        const duration = calculateDuration(sleepDate, sleepTime, wakeDate, wakeTime);

        const newEntry = { sleepDate, sleepTime, wakeDate, wakeTime, duration };
        const sleepData = getSleepData();
        sleepData.push(newEntry);
        saveSleepData(sleepData);
        displaySleepData();
        sleepForm.reset();
    });

    // Display the existing sleep data on page load
    displaySleepData();
}
