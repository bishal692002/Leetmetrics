document.addEventListener("DOMContentLoaded", function() {
    // DOM Elements
    const searchButton = document.getElementById("search-btn");
    const usernameInput = document.getElementById("user-input");
    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");
    const statsCard = document.querySelector(".stats-card");

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
            alert("Invalid Username. Use only letters, numbers, underscore or hyphen (1-15 characters)");
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
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
        return `${Math.floor(diffInSeconds / 31536000)} years ago`;
    }

    // Function to update circular progress
    function updateCircularProgress(element, percentage) {
        const circleFill = element.querySelector('.progress-circle-fill');
        const rotation = percentage * 3.6; // Convert percentage to degrees (360 degrees = 100%)
        
        if (percentage > 50) {
            circleFill.classList.add('greater-50');
            circleFill.querySelector('::before').style.transform = `rotate(180deg)`;
            circleFill.style.transform = `rotate(${rotation - 180}deg)`;
        } else {
            circleFill.classList.remove('greater-50');
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

    // Function to update progress circles
    // Updated function to properly handle circular progress
function updateProgressCircles(data) {
    // Update easy progress
    if (data.easySolved !== undefined && data.totalEasy !== undefined) {
        const easyPercentage = Math.round((data.easySolved / data.totalEasy) * 100);
        easyLabel.textContent = `${data.easySolved}/${data.totalEasy}`;
        
        // Get easy circle elements
        const easyCircleFill = document.querySelector(".easy-progress .progress-circle-fill");
        const easyFillBefore = document.querySelector(".easy-progress .progress-circle-fill::before");
        const rotation = easyPercentage * 3.6; // Convert percentage to degrees (360 degrees = 100%)
        
        if (easyPercentage > 50) {
            easyCircleFill.classList.add('greater-50');
        } else {
            easyCircleFill.classList.remove('greater-50');
        }
        
        // Apply the rotation directly to the element's style
        easyCircleFill.style.transform = `rotate(${rotation}deg)`;
    } else {
        easyLabel.textContent = "0/0";
        const easyCircleFill = document.querySelector(".easy-progress .progress-circle-fill");
        easyCircleFill.classList.remove('greater-50');
        easyCircleFill.style.transform = 'rotate(0deg)';
    }

    // Update medium progress
    if (data.mediumSolved !== undefined && data.totalMedium !== undefined) {
        const mediumPercentage = Math.round((data.mediumSolved / data.totalMedium) * 100);
        mediumLabel.textContent = `${data.mediumSolved}/${data.totalMedium}`;
        
        const mediumCircleFill = document.querySelector(".medium-progress .progress-circle-fill");
        const rotation = mediumPercentage * 3.6;
        
        if (mediumPercentage > 50) {
            mediumCircleFill.classList.add('greater-50');
        } else {
            mediumCircleFill.classList.remove('greater-50');
        }
        
        mediumCircleFill.style.transform = `rotate(${rotation}deg)`;
    } else {
        mediumLabel.textContent = "0/0";
        const mediumCircleFill = document.querySelector(".medium-progress .progress-circle-fill");
        mediumCircleFill.classList.remove('greater-50');
        mediumCircleFill.style.transform = 'rotate(0deg)';
    }

    // Update hard progress
    if (data.hardSolved !== undefined && data.totalHard !== undefined) {
        const hardPercentage = Math.round((data.hardSolved / data.totalHard) * 100);
        hardLabel.textContent = `${data.hardSolved}/${data.totalHard}`;
        
        const hardCircleFill = document.querySelector(".hard-progress .progress-circle-fill");
        const rotation = hardPercentage * 3.6;
        
        if (hardPercentage > 50) {
            hardCircleFill.classList.add('greater-50');
        } else {
            hardCircleFill.classList.remove('greater-50');
        }
        
        hardCircleFill.style.transform = `rotate(${rotation}deg)`;
    } else {
        hardLabel.textContent = "0/0";
        const hardCircleFill = document.querySelector(".hard-progress .progress-circle-fill");
        hardCircleFill.classList.remove('greater-50');
        hardCircleFill.style.transform = 'rotate(0deg)';
    }
}

    // Function to update stats card
    function updateStatsCard(data, username) {
        // Calculate total solved and acceptance rate
        const totalSolved = data.totalSolved || 0;
        const totalQuestions = data.totalQuestions || 0;
        const solvedPercentage = totalQuestions ? Math.round((totalSolved / totalQuestions) * 100) : 0;
        const acceptanceRate = data.acceptanceRate || "N/A";
        const reputation = data.reputation || "N/A";
        const contestRating = data.contestRating || "N/A";
        const contributionPoints = data.contributionPoints || "N/A";
        const lastActive = data.lastSubmission ? timeAgo(data.lastSubmission) : "N/A";
        
        // Additional metrics
        const submissions = data.totalSubmissions || "N/A";
        const acceptedSubmissions = data.acceptedSubmissions || "N/A";
        const streak = data.streak || "N/A";
        const ranking = data.ranking || "N/A";
        const activeDays = data.activeDays || "N/A";
        
        // Create rank progress bar
        const rankProgress = data.ranking ? (100 - Math.min(data.ranking / 1000, 100)) : 0;

        const rankClass = data.ranking
            ? data.ranking <= 1000
                ? "elite"
                : data.ranking <= 10000
                ? "advanced"
                : data.ranking <= 100000
                ? "intermediate"
                : "beginner"
            : "unknown";

        // Update the stats card with user info and metrics
        statsCard.innerHTML = `
            <div class="user-profile">
                <h2 class="username">${username}</h2>
                <div class="rank ${rankClass}">Rank: ${formatNumber(ranking)}</div>
            </div>
            
            <div class="stats-summary">
                <div class="stat-item">
                    <span class="stat-label">Problems Solved:</span>
                    <span class="stat-value">${formatNumber(totalSolved)} / ${formatNumber(totalQuestions)}</span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${solvedPercentage}%"></div>
                    </div>
                    <span class="stat-percentage">${solvedPercentage}%</span>
                </div>
                
                <div class="stat-item">
                    <span class="stat-label">Acceptance Rate:</span>
                    <span class="stat-value">${acceptanceRate}%</span>
                </div>
                
                <div class="stat-item">
                    <span class="stat-label">Submissions:</span>
                    <span class="stat-value">${formatNumber(submissions)}</span>
                </div>
                
                <div class="stat-item">
                    <span class="stat-label">Accepted Submissions:</span>
                    <span class="stat-value">${formatNumber(acceptedSubmissions)}</span>
                </div>
                
                <div class="stat-item">
                    <span class="stat-label">Contest Rating:</span>
                    <span class="stat-value">${contestRating}</span>
                </div>
                
                <div class="stat-item">
                    <span class="stat-label">Contribution Points:</span>
                    <span class="stat-value">${formatNumber(contributionPoints)}</span>
                </div>

                <div class="stat-item">
                    <span class="stat-label">Last Active:</span>
                    <span class="stat-value">${lastActive}</span>
                </div>
            </div>
            
            <div class="streak-container">
                <div class="streak-item">
                    <div class="streak-value">${formatNumber(streak)}</div>
                    <div class="streak-label">Current Streak</div>
                </div>
                <div class="streak-item">
                    <div class="streak-value">${formatNumber(activeDays)}</div>
                    <div class="streak-label">Active Days</div>
                </div>
                <div class="streak-item">
                    <div class="streak-value">${formatNumber(reputation)}</div>
                    <div class="streak-label">Reputation</div>
                </div>
            </div>
            
            <div class="additional-metrics">
                <div class="metric-card">
                    <div class="metric-value">${data.easySolved || 0}</div>
                    <div class="metric-label">Easy Problems</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${data.mediumSolved || 0}</div>
                    <div class="metric-label">Medium Problems</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${data.hardSolved || 0}</div>
                    <div class="metric-label">Hard Problems</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${calculateEfficiency(data)}%</div>
                    <div class="metric-label">Efficiency Rate</div>
                </div>
            </div>
            
            <div class="motivation-tip">
                <h3>Keep Coding!</h3>
                <p>Daily practice is key to mastering algorithms. Try to solve at least one problem per day.</p>
                <p class="tip">Tip: Focus on improving your ${getWeakestArea(data)} problems next.</p>
            </div>
        `;
    }
    
    // Function to calculate efficiency rate
    function calculateEfficiency(data) {
        if (!data.acceptedSubmissions || !data.totalSubmissions) return "N/A";
        return Math.round((data.acceptedSubmissions / data.totalSubmissions) * 100);
    }
    
    // Function to determine weakest area
    function getWeakestArea(data) {
        if (!data.easySolved || !data.mediumSolved || !data.hardSolved) return "diverse";
        
        const easyPercentage = data.easySolved / (data.totalEasy || 1);
        const mediumPercentage = data.mediumSolved / (data.totalMedium || 1);
        const hardPercentage = data.hardSolved / (data.totalHard || 1);
        
        if (hardPercentage <= mediumPercentage && hardPercentage <= easyPercentage) return "hard";
        if (mediumPercentage <= hardPercentage && mediumPercentage <= easyPercentage) return "medium";
        return "easy";
    }

    // Event listener for search button
    searchButton.addEventListener('click', function() {
        const username = usernameInput.value;
        console.log("Searching for username:", username);
        if (validateUsername(username)) {
            fetchUserDetails(username);
        }
    });
    
    // Event listener for Enter key in input field
    usernameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const username = usernameInput.value;
            if (validateUsername(username)) {
                fetchUserDetails(username);
            }
        }
    });
});