// Import Firebase and Firestore functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBppdgLVlZrHk38-VD-TUDn-9ITpV8xdK0",
    authDomain: "sleep-monitoring-619.firebaseapp.com",
    projectId: "sleep-monitoring-619",
    storageBucket: "sleep-monitoring-619.appspot.com",
    messagingSenderId: "128118296602",
    appId: "1:128118296602:web:b50a0130f6019e548401a3",
    measurementId: "G-4SDHQ9TG1L"
};

// Initialise Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to Convert Minutes to Hours, Minutes, and Seconds
const formatTimeDetailed = (hours) => {
    const totalSeconds = Math.floor(hours * 3600);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
};

// Calculate and Display Data
const fetchAndDisplayData = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "sleepData"));
        const sleepData = [];

        querySnapshot.forEach((doc) => {
            sleepData.push(doc.data());
        });

        // Calculate Averages with Correct Day Handling and Multiple Naps
        const calculateAverages = (data) => {
            const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dailyTotals = {};
            const dailyAverages = Array(7).fill(0);
            const dayCounts = Array(7).fill(0);

            data.forEach(item => {
                const sleepStart = new Date(`${item.sleepDate}T${item.sleepTime}`);
                const wakeUp = new Date(`${item.wakeDate}T${item.wakeTime}`);

                // If sleep crosses midnight, adjust the date for wake-up
                if (wakeUp < sleepStart) {
                    wakeUp.setDate(wakeUp.getDate() + 1);
                }

                const sleepDuration = (wakeUp - sleepStart) / (1000 * 60); // Convert milliseconds to minutes
                
                // Group by sleepDate for daily totals
                const sleepDayKey = item.sleepDate;

                if (!dailyTotals[sleepDayKey]) {
                    dailyTotals[sleepDayKey] = 0;
                }
                dailyTotals[sleepDayKey] += sleepDuration;
            });

            // Calculate Daily Averages
            Object.entries(dailyTotals).forEach(([date, totalMinutes]) => {
                const day = new Date(date).getDay();
                dailyAverages[day] += totalMinutes;
                dayCounts[day]++;
            });

            const dailyAvgHours = dailyAverages.map((total, index) => 
                dayCounts[index] > 0 ? (total / dayCounts[index]) / 60 : 0
            );

            // Calculate Overall Average
            const totalSleepMinutes = Object.values(dailyTotals).reduce((acc, curr) => acc + curr, 0);
            const totalDays = Object.keys(dailyTotals).length;
            const overallAvg = (totalSleepMinutes / totalDays) / 60; // Convert minutes to hours

            return { overallAvg, dailyAvgHours, daysOfWeek };
        };

        const { overallAvg, dailyAvgHours, daysOfWeek } = calculateAverages(sleepData);

        // Doughnut Chart for Overall Average (in hrs, min, sec)
        new Chart(document.getElementById('overallAverageChart').getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: [formatTimeDetailed(overallAvg)],
                datasets: [{
                    data: [overallAvg.toFixed(2)],
                    backgroundColor: ['#36A2EB']
                }]
            },
            options: {
                plugins: {
                    legend: { display: true }
                }
            }
        });

        // Bar Chart for Daily Averages
        new Chart(document.getElementById('dailyAverageChart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: daysOfWeek,
                datasets: [{
                    label: 'Avg Sleep (hrs)',
                    data: dailyAvgHours,
                    backgroundColor: '#4BC0C0'
                }]
            },
            options: {
                scales: {
                    y: { 
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return `${value.toFixed(1)} hrs`;
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                return `Avg Sleep: ${formatTimeDetailed(value)}`;
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error fetching sleep data:", error);
    }
};

window.addEventListener('load', fetchAndDisplayData);
