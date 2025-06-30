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
  listDiv.innerHTML = activitiesArr.map(([name, details]) => {
    const participantsList = details.participants && details.participants.length
      ? `<ul class="participants-list">${details.participants.map(email => `<li>${email}</li>`).join('')}</ul>`
      : '<p class="no-participants">No participants yet.</p>';
    return `
      <div class="activity-card">
        <h4>${name}</h4>
        <p>${details.description}</p>
        <p><strong>Schedule:</strong> ${details.schedule}</p>
        <p><strong>Participants:</strong> ${details.participants.length} / ${details.max_participants}</p>
        <div class="participants-section">
          <span class="participants-title">Signed Up:</span>
          ${participantsList}
        </div>
      </div>
    `;
  }).join('');
}

// Fetch and display activities (with search support)
async function fetchAndDisplayActivities() {
  const res = await fetch('/activities');
  allActivities = await res.json();
  filterActivities(document.getElementById('search-input').value || '');
}

// On DOMContentLoaded, fetch activities
document.addEventListener('DOMContentLoaded', fetchAndDisplayActivities);


// Populate the activity select dropdown
document.addEventListener("DOMContentLoaded", () => {
  const activitySelect = document.getElementById("activity");
  if (!activitySelect) return;
  fetch("/activities")
    .then(res => res.json())
    .then(activities => {
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';
      Object.keys(activities).forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    });
});

// Handle form submission and refresh activities after signup
document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  if (!signupForm) return;
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
        // Refresh activities list to show new participant
        fetchAndDisplayActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }
      messageDiv.classList.remove("hidden");
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
});
