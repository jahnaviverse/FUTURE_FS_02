// auth.js
document.addEventListener("DOMContentLoaded", () => {
    console.log("Auth.js loaded");
    console.log("API available?", typeof API !== 'undefined');
    
    const loginForm = document.getElementById("loginForm");
    
    // Check if already logged in
    const token = localStorage.getItem("crm_token");
    if (token && window.location.pathname.includes("index.html")) {
        window.location.href = "pages/dashboard.html";
    }
    
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    } else {
        console.error("Login form not found!");
    }
});

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const remember = document.getElementById("remember")?.checked || false;
    const errorDiv = document.getElementById("loginError");
    
    // Check if API is available
    if (typeof API === 'undefined') {
        errorDiv.textContent = "System error: API not loaded. Please refresh the page.";
        console.error("API is not defined - Check if api.js loaded correctly");
        return;
    }
    
    try {
        errorDiv.textContent = "";
        console.log("Attempting login for:", email);
        
        const response = await API.login(email, password);
        console.log("Login response:", response);
        
        if (response.token) {
            // Store token and user data
            localStorage.setItem("crm_token", response.token);
            localStorage.setItem("crm_user", JSON.stringify(response.user));
            
            if (remember) {
                localStorage.setItem("crm_remember", "true");
            }
            
            // Redirect to dashboard
            window.location.href = "pages/dashboard.html";
        } else {
            throw new Error("Invalid response from server");
        }
    } catch (error) {
        console.error("Login error:", error);
        errorDiv.textContent = error.message || "Login failed. Please check your credentials.";
    }
}