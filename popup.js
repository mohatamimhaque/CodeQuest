document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("setnew").addEventListener("click", function() {
        document.querySelector(".set_target_section").classList.add('active');
        document.querySelector(".show-section").style.display = "none";
        // flatpickr("#startDate", {
        //     dateFormat: "m / d / Y", // Match the format in your image
        //     defaultDate: "today"
        // });

        // flatpickr("#endDate", {
        //     dateFormat: "m / d / Y",
        //     defaultDate: "today"
        // });
    });
    document.getElementById("setgithub").addEventListener("click", function() {
        document.querySelector(".set_repo_section").classList.add('active');
        document.querySelector(".show-section").style.display = "none";
    });
    let rating = [800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000];
    let targeted = {};
    const today = new Date();

    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const yyyy = today.getFullYear();

    const formattedDate = yyyy + '-' + mm + '-' + dd;

    document.getElementById('startDate').value = formattedDate;
    document.getElementById('endDate').value = formattedDate;

    function updateSelectOptions() {
        const select = document.getElementById("rating");
        select.innerHTML = "";
        rating.forEach(value => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function updateProblemList() {
        const problemList = document.querySelector(".problem-list");
        const items = problemList.querySelectorAll(".problem-item");
        items.forEach(item => item.remove());

        for (const [rating, target] of Object.entries(targeted)) {
            const item = document.createElement("div");
            item.className = "problem-item";

            const ratingElement = document.createElement("p");
            ratingElement.className = "problem-rating";
            ratingElement.textContent = rating;

            const targetElement = document.createElement("p");
            targetElement.className = "problem-target";
            targetElement.textContent = target;

            item.appendChild(ratingElement);
            item.appendChild(targetElement);
            problemList.appendChild(item);
        }
    }

    const addItemContainer = document.querySelector(".add-item");
    addItemContainer.innerHTML = `
        <select id="rating" class="dropdown"></select>
        <input id="targetCount" type="number" class="small-input" placeholder="Target Count" />
    `;

    updateSelectOptions();

    document.getElementById("add").addEventListener("click", function() {
        const selectedValue = document.getElementById("rating").value;
        const targetCount = document.getElementById("targetCount").value;

        if (selectedValue && targetCount) {
            targeted[selectedValue] = targetCount;

            rating = rating.filter(value => value != selectedValue);

            updateSelectOptions();
            document.getElementById("targetCount").value = ""; // Clear the input field
            updateProblemList();


        } else {
            alert("Please select a rating and enter a target count.");
        }
    });

    document.getElementById("set").addEventListener("click", function() {
        const startDate = document.getElementById("startDate").value;
        const endDate = document.getElementById("endDate").value;

        if (!startDate || !endDate) {
            alert("Please enter both start and end dates.");
            return;
        }

        const dataToStore = {
            startDate: startDate,
            endDate: endDate,
            targeted: targeted
        };

        chrome.storage.local.set({ codeForcesTarget: dataToStore }).then(() => {
            console.log("Data has been saved.");
            })
        location.reload();
    });



    document.getElementById("setrepo").addEventListener("click", function() {
        const username = document.getElementById("username").value.trim();
        const repo = document.getElementById("repo").value.trim();
        const path = document.getElementById("path").value.trim();
        const token = document.getElementById("token").value.trim();

        if (!username || !repo || !path || !token) {
            alert("Please fill up all fields.");
            return;
        }

        const dataToStore = {
            username,
            repo,
            path,
            token
        };


        chrome.storage.local.set({ githubrepo: dataToStore }).then(() => {
            console.log("Data has been saved.");
        })

        location.reload();
    });

    window.addEventListener('DOMContentLoaded', () => {
        async function loadGitHubRepoSettings() {
    const data = await chrome.storage.local.get('githubrepo');
    
    if (data.githubrepo) {
        const { username, repo, path, token } = data.githubrepo;
        
        document.getElementById('username').value = username;
        document.getElementById('repo').value = repo;
        document.getElementById('path').value = path;
        document.getElementById('token').value = token;
    }
}

loadGitHubRepoSettings();
    });



    document.getElementById("developer").addEventListener("click", function(e) {
        e.preventDefault();
        window.open("https://www.facebook.com/mohatamim44", "_blank");
    });

});


// localStorage.removeItem('codeForcesTarget');
// localStorage.removeItem('githubrepo');
