
const loginForm = document.getElementById("loginForm");

const loginMessage = document.getElementById("loginMessage");

const loginButton = document.getElementById("loginButton");

loginForm.addEventListener("submit", async function(event) {
  event.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  loginMessage.textContent = "";
  loginButton.disabled = true;

  try {

    const tokenResponse = await fetch("/api/csrf-token", {
        credentials: "same-origin",
        cache: "no-store"
        });

        if (!tokenResponse.ok) {
        throw new Error("Unable to get CSRF token.");
        }

    const { csrfToken } = await tokenResponse.json();

    const response = await fetch("/api/login", {
      method: "POST",
      
    headers: {
    "Content-Type": "application/json",
    "X-CSRF-Token": csrfToken
    },

      credentials: "same-origin",
      body: JSON.stringify({
        username,
        password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      loginMessage.textContent =
        data.message || "Login failed.";
      return;
    }

    window.location.href = "/tracker/";

  } catch (error) {
    loginMessage.textContent =
      "Unable to connect to the server.";
  } finally {
    loginButton.disabled = false;
  }
});
