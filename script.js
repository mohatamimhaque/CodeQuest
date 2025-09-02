document.addEventListener("DOMContentLoaded", () => {
    const handleInput = document.getElementById("handle");
    const showHandleEl = document.getElementById("showhandle");

    // Load handle from storage
    chrome.storage.local.get("userHandle", (data) => {
        if (data.userHandle) {
            if (handleInput) handleInput.value = data.userHandle;
            if (showHandleEl) showHandleEl.value = data.userHandle;
        } else {
            if (handleInput) handleInput.placeholder = "Enter your handle";
        }
        if (handleInput) handleInput.disabled = false;
    });

    async function fetchData() {
        const { codeForcesTarget } = await chrome.storage.local.get("codeForcesTarget");
        const handle = handleInput ? handleInput.value : "";
        console.log("Handle:", handle);

        if (codeForcesTarget) {
            let parsedData;
            try {
                parsedData = typeof codeForcesTarget === "string"
                    ? JSON.parse(codeForcesTarget)
                    : codeForcesTarget;
            } catch (e) {
                console.error("Invalid codeForcesTarget format:", e);
                return;
            }

            if (document.getElementById("showstartDate")) {
                document.getElementById("showstartDate").value = parsedData.startDate || "";
            }
            if (document.getElementById("showendDate")) {
                document.getElementById("showendDate").value = parsedData.endDate || "";
            }

            const startDate = new Date(parsedData.startDate).getTime() / 1000;
            const endDate = new Date(parsedData.endDate).getTime() / 1000;

            const url = `https://codeforces.com/api/user.status?handle=${handle}`;
            try {
                const response = await fetch(url);
                const result = await response.json();

                if (result.status !== "OK") {
                    throw new Error("Failed to fetch Codeforces data.");
                }

                const submissions = result.result;
                const solvedProblems = {};

                function getExtension(language) {
                    language = language.toLowerCase();
                    if (language.includes("c++")) return ".cpp";
                    if (language.includes("c#")) return ".cs";
                    if (language.includes("java")) return ".java";
                    if (language.includes("py")) return ".py";
                    if (language.includes("pascal")) return ".pas";
                    if (language.includes("kotlin")) return ".kt";
                    if (language.includes("ruby")) return ".rb";
                    if (language.includes("go")) return ".go";
                    return ".txt";
                }

                function sleep(ms) {
                    return new Promise(resolve => setTimeout(resolve, ms));
                }

               

            

               


                for (const submission of submissions) {
                    if (
                        submission.verdict === "OK" &&
                        submission.creationTimeSeconds >= startDate &&
                        submission.creationTimeSeconds <= endDate
                    ) {
                        const rating = submission.problem.rating || "Unrated";
                        if (!solvedProblems[rating]) {
                            solvedProblems[rating] = new Set();
                        }
                        solvedProblems[rating].add(submission.problem.name);

                       
                    }
                }

                // Count solved problems per rating
                const problems = {};
                for (const [rating, pp] of Object.entries(solvedProblems)) {
                    problems[rating] = pp.size;
                }

                const targetList = Object.fromEntries(
                    Object.entries(parsedData.targeted || {}).sort(([a], [b]) => b.localeCompare(a))
                );

                const showListEl = document.querySelector(".showList");
                if (showListEl) {
                    showListEl.innerHTML = "";
                    for (const [rating, target] of Object.entries(targetList)) {
                        let solved = problems[rating] || 0;
                        let width = (parseInt(solved) / parseInt(target)) * 100;
                        if (isNaN(width) || !isFinite(width)) width = 16;
                        if (width < 16) width = 16;
                        if (width > 100) width = 100;

                        let color = "green";
                        if (width <= 25) color = "red";
                        else if (width <= 50) color = "rgb(252, 188, 12)";
                        else if (width <= 75) color = "rgb(1, 197, 1)";

                        showListEl.innerHTML += `
                            <div class="show-item">
                                <p class="rating-no">${rating} Ratings:</p>
                                <div class="progress" role="progressbar">
                                    <div class="progress-bar progress-bar-striped progress-bar-animated"
                                         style="width:${width}%; background-color:${color};">
                                        <p class="textShow">${solved} / ${target}</p>
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                }
            } catch (error) {
                console.error(error);
                alert("Error fetching data. Please try again.");
            }
        } else {
            const alertEl = document.querySelector(".target-section.showing .alert");
            if (alertEl) {
                alertEl.style.display = "block";
                alertEl.innerHTML = "You don't have any target. Please set your target!!";
            }
        }
    }

    // Run fetch after delay
    setTimeout(fetchData, 2000);
});
