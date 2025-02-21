// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.x.x/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.x.x/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBppdgLVlZrHk38-VD-TUDn-9ITpV8xdK0",
  authDomain: "sleep-monitoring-619.firebaseapp.com",
  projectId: "sleep-monitoring-619",
  storageBucket: "sleep-monitoring-619.appspot.com",
  messagingSenderId: "128118296602",
  appId: "1:128118296602:web:b50a0130f6019e548401a3",
  measurementId: "G-4SDHQ9TG1L"
};

// Initialise Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
