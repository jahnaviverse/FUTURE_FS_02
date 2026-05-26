document.addEventListener("DOMContentLoaded", () => {
  const { TOKEN_KEY } = window.CRM_CONFIG;

  if (localStorage.getItem(TOKEN_KEY)) {
    window.location.href = "pages/dashboard.html";
    return;
  }

  const form = document.getElementById("loginForm");
  const err = document.getElementById("loginError");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    err.textContent = "";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      err.textContent = "Email and password are required.";
      return;
    }

    // Demo credentials
    if (email !== "admin@crm.in" || password !== "Admin1234") {
      err.textContent = "Invalid demo credentials.";
      return;
    }

    // Demo login success
    localStorage.setItem(TOKEN_KEY, "demo-token");

    window.location.href = "pages/dashboard.html";
  });
});