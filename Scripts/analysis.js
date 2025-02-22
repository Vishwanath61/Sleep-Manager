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

// Calculate and Display Data
const fetchAndDisplayData = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "sleepData"));
        const sleepData = [];

        querySnapshot.forEach((doc) => {
            sleepData.push(doc.data());
        });

        // Calculate Averages
        const calculateAverages = (data) => {
            const totalDuration = data.reduce((acc, curr) => {
                const [hrs, mins] = curr.duration.split('h ');
                const totalMins = (parseInt(hrs) * 60) + parseInt(mins.replace('m', ''));
                return acc + totalMins;
            }, 0);

            const overallAvg = (totalDuration / data.length) / 60;

            const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dailyAverages = Array(7).fill(0);
            const dayCounts = Array(7).fill(0);

            data.forEach(item => {
                const sleepDate = new Date(`${item.sleepDate}T${item.sleepTime}`);
                const day = sleepDate.getDay();
                const [hrs, mins] = item.duration.split('h ');
                const totalMins = (parseInt(hrs) * 60) + parseInt(mins.replace('m', ''));

                dailyAverages[day] += totalMins;
                dayCounts[day]++;
            });

            const dailyAvgHours = dailyAverages.map((total, index) => 
                dayCounts[index] > 0 ? (total / dayCounts[index]) : 0
            );

            return { overallAvg, dailyAvgHours, daysOfWeek };
        };

        const { overallAvg, dailyAvgHours, daysOfWeek } = calculateAverages(sleepData);

        // Function to Convert Minutes to Hours and Minutes
        const formatTime = (minutes) => {
            const hrs = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${hrs}h ${mins}m`;
        };

        // Display Charts
        new Chart(document.getElementById('overallAverageChart').getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Average Sleep (hrs)'],
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

        new Chart(document.getElementById('dailyAverageChart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: daysOfWeek,
                datasets: [{
                    label: 'Avg Sleep',
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
                                const hrs = Math.floor(value / 60);
                                const mins = value % 60;
                                return `${hrs}h ${mins}m`;
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                return `Avg Sleep: ${formatTime(value)}`;
                            }
                        }
                    },
                    datalabels: {
                        anchor: 'end',
                        align: 'top',
                        formatter: (value) => formatTime(value),
                        color: '#000'
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error fetching sleep data:", error);
    }
};

window.addEventListener('load', fetchAndDisplayData);
