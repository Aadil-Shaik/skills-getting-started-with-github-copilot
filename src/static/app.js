// Search and filter logic for activities
document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;
  searchInput.addEventListener('input', function () {
    filterActivities(searchInput.value);
  });
});

let allActivities = {};

function filterActivities(query) {
  const listDiv = document.getElementById('activities-list');
  if (!listDiv) return;
  const q = query.trim().toLowerCase();
  let filtered = Object.entries(allActivities);
  if (q) {
    filtered = filtered.filter(([name, details]) => {
      return (
        name.toLowerCase().includes(q) ||
        (details.schedule && details.schedule.toLowerCase().includes(q)) ||
        (details.description && details.description.toLowerCase().includes(q))
      );
    });
  }
  renderActivities(filtered);
}

function renderActivities(activitiesArr) {
  const listDiv = document.getElementById('activities-list');
  if (!listDiv) return;
  if (!activitiesArr.length) {
    listDiv.innerHTML = '<p>No activities found.</p>';
    return;
  }
  listDiv.innerHTML = activitiesArr.map(([name, details]) => `
    <div class="activity-card">
      <h4>${name}</h4>
      <p>${details.description}</p>
      <p><strong>Schedule:</strong> ${details.schedule}</p>
      <p><strong>Participants:</strong> ${details.participants.length} / ${details.max_participants}</p>
    </div>
  `).join('');
}

// Fetch and display activities (with search support)
async function fetchAndDisplayActivities() {
  const res = await fetch('/activities');
  allActivities = await res.json();
  filterActivities(document.getElementById('search-input').value || '');
}

// On DOMContentLoaded, fetch activities
document.addEventListener('DOMContentLoaded', fetchAndDisplayActivities);

// ...existing code...
document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
