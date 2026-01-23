document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const searchButton = document.getElementById("search-btn");
  const usernameInput = document.getElementById("user-input");
  const easyLabel = document.getElementById("easy-label");
  const mediumLabel = document.getElementById("medium-label");
  const hardLabel = document.getElementById("hard-label");

  // Function to validate username
  function validateUsername(username) {
    if (username.trim() === "") {
      alert("Username cannot be empty");
      return false;
    }
    // Fixed regex - removed space which was causing validation issues
    const regex = /^[a-zA-Z0-9_-]{1,15}$/;
    const isMatching = regex.test(username);
    if (!isMatching) {
      alert(
        "Invalid Username. Use only letters, numbers, underscore or hyphen (1-15 characters)",
      );
    }
    return isMatching;
  }

  // Function to format numbers with commas for thousands
  function formatNumber(num) {
    if (num === undefined || num === null) return "N/A";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Function to calculate time ago
  function timeAgo(timestamp) {
    if (!timestamp) return "N/A";

    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000)
      return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  }

  // Function to update circular progress
  function updateCircularProgress(element, percentage) {
    const circleFill = element.querySelector(".progress-circle-fill");
    const rotation = percentage * 3.6; // Convert percentage to degrees (360 degrees = 100%)

    if (percentage > 50) {
      circleFill.classList.add("greater-50");
      circleFill.querySelector("::before").style.transform = `rotate(180deg)`;
      circleFill.style.transform = `rotate(${rotation - 180}deg)`;
    } else {
      circleFill.classList.remove("greater-50");
      circleFill.style.transform = `rotate(${rotation}deg)`;
    }
  }

  // Function to fetch user details
  async function fetchUserDetails(username) {
    const url = `https://leetcode-stats-api.herokuapp.com/${username}`;

    try {
      // Update button to "Searching..." with loading animation
      searchButton.classList.add("loading");
      searchButton.textContent = "Searching...";
      searchButton.disabled = true;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Unable to fetch user details");
      }

      const data = await response.json();
      console.log("User data:", data);

      // Update progress circles
      updateProgressCircles(data);

      // Update stats card
      updateStatsCard(data, username);

      return data;
    } catch (error) {
      console.error("Error:", error);
      statsCard.innerHTML = `
                <div class="error-message">
                    <p>❌ Error fetching data: ${error.message}</p>
                    <p>Please check the username and try again.</p>
                </div>
            `;
    } finally {
      // Restore button state
      setTimeout(() => {
        searchButton.classList.remove("loading");
        searchButton.textContent = "Search";
        searchButton.disabled = false;
      }, 600); // Slight delay for better UX
    }
  }

  // Function to set SVG circle progress
  function setCircleProgress(circleId, percentage) {
    const circle = document.getElementById(circleId);
    if (circle) {
      const radius = 40;
      const circumference = 2 * Math.PI * radius; // 251.2
      const offset = circumference - (percentage / 100) * circumference;
      circle.style.strokeDashoffset = offset;
    }
  }

  // Function to update progress circles
  function updateProgressCircles(data) {
    // Update easy progress
    if (data.easySolved !== undefined && data.totalEasy !== undefined) {
      const easyPercentage = (data.easySolved / data.totalEasy) * 100;
      easyLabel.textContent = `${data.easySolved}/${data.totalEasy}`;
      setCircleProgress("easy-circle", easyPercentage);
    } else {
      easyLabel.textContent = "0/0";
      setCircleProgress("easy-circle", 0);
    }

    // Update medium progress
    if (data.mediumSolved !== undefined && data.totalMedium !== undefined) {
      const mediumPercentage = (data.mediumSolved / data.totalMedium) * 100;
      mediumLabel.textContent = `${data.mediumSolved}/${data.totalMedium}`;
      setCircleProgress("medium-circle", mediumPercentage);
    } else {
      mediumLabel.textContent = "0/0";
      setCircleProgress("medium-circle", 0);
    }

    // Update hard progress
    if (data.hardSolved !== undefined && data.totalHard !== undefined) {
      const hardPercentage = (data.hardSolved / data.totalHard) * 100;
      hardLabel.textContent = `${data.hardSolved}/${data.totalHard}`;
      setCircleProgress("hard-circle", hardPercentage);
    } else {
      hardLabel.textContent = "0/0";
      setCircleProgress("hard-circle", 0);
    }
  }

  // Function to update stats card
  function updateStatsCard(data, username) {
    // Calculate metrics that are definitely available
    const totalSolved = data.totalSolved || 0;
    const totalQuestions = data.totalQuestions || 0;
    const solvedPercentage = totalQuestions
      ? Math.round((totalSolved / totalQuestions) * 100)
      : 0;
    const acceptanceRate = data.acceptanceRate || 0;
    const ranking = data.ranking || "N/A";

    // Get solved counts
    const easySolved = data.easySolved || 0;
    const mediumSolved = data.mediumSolved || 0;
    const hardSolved = data.hardSolved || 0;

    const rankClass = data.ranking
      ? data.ranking <= 1000
        ? "elite"
        : data.ranking <= 10000
          ? "advanced"
          : data.ranking <= 100000
            ? "intermediate"
            : "beginner"
      : "unknown";

    // Update the stats info bar in the progress section
    document.getElementById("rank-value").textContent = formatNumber(ranking);
    document.getElementById("solved-value").textContent =
      `${formatNumber(totalSolved)} / ${formatNumber(totalQuestions)}`;
    document.getElementById("acceptance-value").textContent =
      `${acceptanceRate}%`;

    // Update the username in progress section
    document.getElementById("username-display").textContent = username;
  }

  // Function to calculate efficiency rate
  function calculateEfficiency(data) {
    if (!data.acceptedSubmissions || !data.totalSubmissions) return "N/A";
    return Math.round((data.acceptedSubmissions / data.totalSubmissions) * 100);
  }

  // Function to determine weakest area
  function getWeakestArea(data) {
    if (!data.easySolved || !data.mediumSolved || !data.hardSolved)
      return "diverse";

    const easyPercentage = data.easySolved / (data.totalEasy || 1);
    const mediumPercentage = data.mediumSolved / (data.totalMedium || 1);
    const hardPercentage = data.hardSolved / (data.totalHard || 1);

    if (hardPercentage <= mediumPercentage && hardPercentage <= easyPercentage)
      return "hard";
    if (
      mediumPercentage <= hardPercentage &&
      mediumPercentage <= easyPercentage
    )
      return "medium";
    return "easy";
  }

  // Event listener for search button
  searchButton.addEventListener("click", function () {
    const username = usernameInput.value;
    console.log("Searching for username:", username);
    if (validateUsername(username)) {
      fetchUserDetails(username);
    }
  });

  // Event listener for Enter key in input field
  usernameInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      const username = usernameInput.value;
      if (validateUsername(username)) {
        fetchUserDetails(username);
      }
    }
  });
});
