document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Hardcoded credentials (change these to your preferred values)
    const hardcodedUsername = "admin";
    const hardcodedPassword = "password123";

    if (username === hardcodedUsername && password === hardcodedPassword) {
        alert("Login successful!");
        // Redirect to dashboard (we'll create this later)
        window.location.href = "dashboard.html";
    } else {
        document.getElementById("error-message").textContent = "Invalid username or password.";
    }
});
