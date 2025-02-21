// Import Firebase and Firestore functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBppdgLVlZrHk38-VD-TUDn-9ITpV8xdK0",
    authDomain: "sleep-monitoring-619.firebaseapp.com",
    projectId: "sleep-monitoring-619",
    storageBucket: "sleep-monitoring-619.appspot.com",
    messagingSenderId: "128118296602",
    appId: "1:128118296602:web:b50a0130f6019e548401a3",
    measurementId: "G-4SDHQ9TG1L"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

if (window.location.pathname.includes("dashboard.html")) {
    const sleepForm = document.getElementById("sleepForm");
    const sleepDataList = document.getElementById("sleepDataList");

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

    // Display sleep data from Firestore
    const displaySleepData = async () => {
        sleepDataList.innerHTML = "";

        // Fetch data from Firestore
        const q = query(collection(db, "sleepData"), orderBy("sleepDate", "desc"));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            const item = doc.data();
            const li = document.createElement("li");
            li.innerHTML = `
                Sleep: ${item.sleepDate} ${item.sleepTime} → Wake: ${item.wakeDate} ${item.wakeTime} 
                | Duration: ${item.duration}
                <button class="edit-btn" data-id="${doc.id}">Edit</button>
                <button class="delete-btn" data-id="${doc.id}">Delete</button>
            `;
            sleepDataList.appendChild(li);
        });

        // Add event listeners for Edit and Delete buttons
        document.querySelectorAll(".edit-btn").forEach(button => {
            button.addEventListener("click", async (event) => {
                const docId = event.target.getAttribute("data-id");
                const qSnapshot = await getDocs(collection(db, "sleepData"));
                qSnapshot.forEach((doc) => {
                    if (doc.id === docId) {
                        const item = doc.data();
                        document.getElementById("sleepDate").value = item.sleepDate;
                        document.getElementById("sleepTime").value = item.sleepTime;
                        document.getElementById("wakeDate").value = item.wakeDate;
                        document.getElementById("wakeTime").value = item.wakeTime;
                        sleepForm.setAttribute("data-edit-id", docId);
                    }
                });
            });
        });

        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", async (event) => {
                const docId = event.target.getAttribute("data-id");
                await deleteDoc(doc(db, "sleepData", docId));
                displaySleepData();
                alert("Sleep data deleted successfully!");
            });
        });
    };

    // Handle form submission
    sleepForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const sleepDate = document.getElementById("sleepDate").value;
        const sleepTime = document.getElementById("sleepTime").value;
        const wakeDate = document.getElementById("wakeDate").value;
        const wakeTime = document.getElementById("wakeTime").value;

        const duration = calculateDuration(sleepDate, sleepTime, wakeDate, wakeTime);
        const newEntry = { sleepDate, sleepTime, wakeDate, wakeTime, duration };

        const editId = sleepForm.getAttribute("data-edit-id");

        if (editId) {
            // Update existing entry
            await updateDoc(doc(db, "sleepData", editId), newEntry);
            alert("Sleep data updated successfully!");
            sleepForm.removeAttribute("data-edit-id");
        } else {
            // Save new entry
            await addDoc(collection(db, "sleepData"), newEntry);
            alert("Sleep data saved successfully!");
        }

        displaySleepData();
        sleepForm.reset();
    });

    // Display the existing sleep data on page load
    window.addEventListener("load", displaySleepData);
}
