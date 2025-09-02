(async () => {
    const profileLink = document.querySelector(".lang-chooser a[href*='/profile/']");

    if (profileLink) {
        const handle = profileLink.getAttribute("href").split("/").pop();
        chrome.storage.local.set({
            userHandle: handle
        }, () => {
            console.log("✔ Codeforces handle saved:", handle);
        });

        try {
            const {
                codeForcesTarget
            } = await chrome.storage.local.get("codeForcesTarget");
            const sidebar = document.querySelector("#sidebar");
            if (sidebar) {
                const wrapper = document.createElement("div");
                wrapper.className = "roundbox sidebox borderTopRound";


                wrapper.innerHTML = `
                    <div class="caption titled">→ Target </div>
                    <div style="padding: 0.5em;">
                        <div style="text-align:center;">
                        <div class="item">
                            <label for="showstartDate" class="form-label">From</label>
                            <input type="text" id="showstartDate" class="input-field" disabled />
                        </div>
                        <div class="item">
                            <label for="showendDate" class="form-label">To</label>
                            <input type="text" id="showendDate" class="input-field" disabled>
                        </div>
                        </div>
                    </div>
                    <section class="target-section showing">
                        <p class="alert" style="display:none"></p>
                        <div class="showList"></div>
                    </section>
                    <style>
                        .item {
                        display: flex;
                        width: 100%;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 8px;
                        }

                        .form-label {
                        font-size: 12px;
                        display: block;
                        color: #00796b;
                        text-wrap: nowrap;
                        text-align: start;
                        }

                        input.input-field {
                        padding: 2px 6px;
                        margin-bottom: 3px;
                        font-size: 11px;
                        border: none;
                        border-radius: 4px;
                        width: 150px;
                        outline: none;
                        color: #00796b !important;
                        background: transparent;
                        }

                        input,
                        label,
                        select,
                        option {
                        cursor: pointer;
                        }

                        .input-field:disabled {
                        background: transparent;
                        color: #aaa;
                        cursor: default;
                        }

                        #showstartDate,
                        #showendDate {
                        cursor: not-allowed;
                        }

                        .progress {
                        height: 14px;
                        background-color: #f5f5f5;
                        border-radius: 4px;
                        overflow: hidden;
                        position: relative;
                        margin-bottom: 8px;
                        }

                        .progress-bar {
                        height: 100%;
                        background-color: rgb(1, 197, 1);
                        position: relative;
                        width: 0;
                        max-width: 100%;
                        }

                        .textShow {
                        font-size: 10px;
                        color: white;
                        padding: 0;
                        margin: 0;
                        font-weight: 800;
                        margin-right: 6px;
                        text-wrap: nowrap;
                        }

                        .progress-bar-striped {
                        background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
                        background-size: 1rem 1rem;
                        display: flex;
                        align-items: center;
                        justify-content: end;
                        }

                        .rating-no {
                        font-size: 12px;
                        margin-bottom: 3px;
                        color: #00796b;
                        }

                        .alert {
                        font-size: 14px;
                        font-weight: 600;
                        color: #00796b;
                        margin: 8px;
                        }

                        .show-item {
                        padding: 2px 6px;
                        }
                    </style>
                `

                sidebar.prepend(wrapper);

                function formatDate(isoDate) {
                    const date = new Date(isoDate);
                    return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric"
                    });
                }




                async function fetchData() {
                    const {
                        codeForcesTarget
                    } = await chrome.storage.local.get("codeForcesTarget");

                    if (codeForcesTarget) {
                        let parsedData;
                        try {
                            parsedData = typeof codeForcesTarget === "string" ?
                                JSON.parse(codeForcesTarget) :
                                codeForcesTarget;
                        } catch (e) {
                            console.error("Invalid codeForcesTarget format:", e);
                            return;
                        }

                        if (document.getElementById("showstartDate")) {
                            document.getElementById("showstartDate").value = ":   " + formatDate(parsedData.startDate) || "";
                        }
                        if (document.getElementById("showendDate")) {
                            document.getElementById("showendDate").value = ":   " + formatDate(parsedData.endDate) || "";
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
                            var count = 0;
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

                            const {
                                githubrepo
                            } = await chrome.storage.local.get("githubrepo");

                            let username, repo, token, path;
                            if (githubrepo) {
                                try {
                                    const repoData = typeof githubrepo === "string" ? JSON.parse(githubrepo) : githubrepo;
                                    ({
                                        username,
                                        repo,
                                        path,
                                        token
                                    } = repoData);
                                } catch (e) {
                                    console.error("Invalid githubrepo format:", e);
                                }
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

                                    if (githubrepo) {
                                        const submissionId = submission.id;
                                        const submissionKey = `${repo}${submissionId}`;
                                        const stored = await chrome.storage.local.get(submissionKey);
                                        const storedStatus = stored[submissionKey];

                                        if (storedStatus === "1") {
                                            console.log(`✔ Skipping ${submissionId}, already uploaded`);
                                            continue;
                                        }

                                        const contestId = submission.contestId;
                                        const index = submission.problem.index;
                                        const problemName = submission.problem.name
                                            .replace(/[^a-z0-9]/gi, "_")
                                            .replace(/['"]/g, "");
                                        const extension = getExtension(submission.programmingLanguage);
                                        const filename = `${contestId}${index}_${problemName}${extension}`;
                                        const submissionUrl = `https://codeforces.com/contest/${contestId}/submission/${submissionId}`;

                                        try {
                                            const res = await fetch(submissionUrl);
                                            const text = await res.text();
                                            const parser = new DOMParser();
                                            const doc = parser.parseFromString(text, "text/html");
                                            const codeBlock = doc.querySelector("pre#program-source-text");


                                            if (codeBlock) {
                                                const code = codeBlock.textContent;

                                                let contentBase64;
                                                try {
                                                    contentBase64 = btoa(unescape(encodeURIComponent(code)));
                                                } catch (e) {
                                                    console.error("Encoding failed:", e);
                                                    continue;
                                                }

                                                const ghUrl = `https://api.github.com/repos/${username}/${repo}/contents/${path}${filename}`;

                                                let sha;
                                                try {
                                                    const checkRes = await fetch(ghUrl, {
                                                        headers: {
                                                            "Authorization": `token ${token}`,
                                                            "Accept": "application/vnd.github+json"
                                                        }
                                                    });
                                                    const checkData = await checkRes.json();
                                                    sha = checkData.sha;
                                                } catch (e) {}

                                                const body = {
                                                    message: `Add/update ${filename}`,
                                                    content: contentBase64
                                                };
                                                if (sha) body.sha = sha;

                                                await fetch(ghUrl, {
                                                    method: "PUT",
                                                    headers: {
                                                        "Authorization": `token ${token}`,
                                                        "Accept": "application/vnd.github+json"
                                                    },
                                                    body: JSON.stringify(body)
                                                });

                                                await chrome.storage.local.set({
                                                    [submissionKey]: "1"
                                                });
                                                console.log(`✔ Uploaded: ${filename}`);
                                                count++;
                                            } else {
                                                console.warn(`❌ Could not fetch code for submission ${submissionId}.`);
                                            }
                                        } catch (err) {
                                            console.error(`Error fetching submission ${submissionId}:`, err);
                                        }

                                        await sleep(200);
                                    }
                                }
                            }

                            async function createReadme() {
                                const apiUrl = `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=200000`;

                                try {
                                    const response = await fetch(apiUrl);
                                    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                                    const data = await response.json();
                                    if (data.status !== "OK") throw new Error(`API error: ${data.comment || data.status}`);

                                    function formatTime(epoch) {
                                        const d = new Date(epoch * 1000);
                                        d.setUTCHours(d.getUTCHours() + 6); // Shift to UTC+6
                                        const dateStr = d.toLocaleString("en-US", {
                                            month: "short",
                                            day: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: false,
                                            timeZone: "UTC"
                                        }).replace(",", "");
                                        return `${dateStr}UTC+6`;
                                    }

                                    const submissions = {};
                                    data.result.forEach(sub => {
                                        if (sub.verdict !== "OK") return;
                                        submissions[sub.id] = {
                                            contestId: sub.contestId || 0,
                                            index: sub.problem.index,
                                            name: sub.problem.name.replace(/["']/g, ""),
                                            language: sub.programmingLanguage,
                                            tags: (sub.problem.tags || []).join(", "),
                                            submittedTime: sub.creationTimeSeconds,
                                            timeMs: `${sub.timeConsumedMillis} ms`,
                                            memoryKb: `${Math.floor(sub.memoryConsumedBytes / 1024)} KB`
                                        };
                                    });

                                    const sorted = Object.entries(submissions)
                                        .sort((a, b) => b[1].submittedTime - a[1].submittedTime);

                                    const seen = new Set();
                                    let count = 1;
                                    let md = "# 🏆 Codeforces Submissions\n\n";
                                    md += "| # | Platform | Problem | Solution | Tags | Lang | Submitted | Time | Memory |\n";
                                    md += "|---|----------|---------|----------|------|------|-----------|------|--------|\n";

                                    sorted.forEach(([id, info]) => {
                                        const key = `${info.contestId}-${info.index}`;
                                        if (seen.has(key)) return;
                                        seen.add(key);

                                        const platformLink = `<a href="https://codeforces.com/contest/${info.contestId}/submission/${id}" target="_blank">Codeforces</a>`;
                                        const problemLink = `<a href="https://codeforces.com/contest/${info.contestId}/problem/${info.index}" target="_blank">${info.contestId}${info.index} - ${info.name}</a>`;
                                        const solLink = `<a href="solutions/codeforces/${info.contestId}${info.index}_${info.name.replace(/\s+/g, '_')}${getExtension(info.language)}" target="_blank">Solutions</a>`;
                                        const timeStr = formatTime(info.submittedTime);

                                        md += `| ${count++} | ${platformLink} | ${problemLink} | ${solLink} | ${info.tags} | ${info.language} | ${timeStr} | ${info.timeMs} | ${info.memoryKb} |\n`;
                                    });



                                    const apiBase = `https://api.github.com/repos/${username}/${repo}/contents/README.md`;

                                    let sha = null;
                                    const message = '📦 Update README via JS';
                                    const branch = 'main';

                                    try {
                                        const resGet = await fetch(apiBase, {
                                            headers: {
                                                Authorization: `token ${token}`,
                                                Accept: 'application/vnd.github.v3+json'
                                            }
                                        });

                                        if (resGet.ok) {
                                            const data = await resGet.json();
                                            sha = data.sha;
                                        }
                                    } catch (e) {
                                        console.warn('File not found or SHA fetch failed. Assuming new file.', e);
                                    }

                                    const body = {
                                        message,
                                        content: btoa(unescape(encodeURIComponent(md))),
                                        branch
                                    };

                                    if (sha) {
                                        body.sha = sha;
                                    }

                                    const resPut = await fetch(apiBase, {
                                        method: 'PUT',
                                        headers: {
                                            Authorization: `token ${token}`,
                                            Accept: 'application/vnd.github.v3+json'
                                        },
                                        body: JSON.stringify(body)
                                    });

                                    const result = await resPut.json();

                                    if (!resPut.ok) {
                                        console.error('❌ GitHub API error:', result.message);
                                        throw new Error(result.message || 'Unknown GitHub error');
                                    }

                                    console.log('✅ File pushed successfully:', result.commit.html_url);




                                } catch (err) {
                                    console.error("Error generating submissions:", err);
                                }
                            }

                            if (count > 0) {
                                createReadme();
                            }


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
                        }
                    } else {
                        const alertEl = document.querySelector(".target-section.showing .alert");
                        if (alertEl) {
                            alertEl.style.display = "block";
                            alertEl.innerHTML = "You don't have any target. Please set your target!!";
                        }
                    }
                }
                setTimeout(fetchData, 10);
            }



        } catch (err) {
            console.error("❌ Error reading from storage:", err);
        }



        const currentUrl = window.location.href;
        if (currentUrl.includes('profile')) {
            analytics(currentUrl.split('/').at(-1));
        }









const timerDiv = document.createElement('div');
timerDiv.id = 'timer';
timerDiv.style.width = '100%';
timerDiv.style.display = 'flex';
timerDiv.style.alignItems = 'center';  // vertical center alignment
timerDiv.style.justifyContent = 'flex-end'; // right align everything horizontally
timerDiv.style.gap = '10px'; // space between logo and time

// Create logo image
const logo = document.createElement('img');
logo.src =  chrome.runtime.getURL('icon.png');  // replace with your logo URL or path
logo.alt = 'Logo';
logo.style.width = '24px';  // adjust size as needed
logo.style.height = '24px';

// Create the time element
const time = document.createElement('p');
time.style.fontFamily = 'monospace';
time.style.fontSize = '16px';
time.style.color = '#00796b';
time.style.margin = '0';
time.textContent = '00:00:00';

// Append logo and time to timerDiv
timerDiv.appendChild(logo);
timerDiv.appendChild(time);

document.body.appendChild(timerDiv);

// Timer logic
let seconds = 0;
function pad(num) {
  return num.toString().padStart(2, '0');
}
function updateTimer() {
  seconds++;
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  time.textContent = `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}
setInterval(updateTimer, 1000);





        if (currentUrl.split('/').includes('problem')) {
            const pageContent = document.getElementById("pageContent");
            if (pageContent) {
                pageContent.prepend(timerDiv);
            }
        }
    }






    async function analytics(handle) {
        const url = `https://codeforces.com/api/user.status?handle=${handle}`;
        try {
            const response = await fetch(url);
            const result = await response.json();

            if (result.status !== "OK") {
                throw new Error("Failed to fetch Codeforces data.");
            }

            const submissions = result.result;


            const ratingWise = {};
            const tagWise = {};
            const names = [];
            const unsolved = [];
            for (const submission of submissions) {
                let key = submission['problem']['rating'];
                let name = submission['problem']['name'];
                if (submission.verdict === "OK" && !names.includes(name)) {
                    if (ratingWise[key]) {
                        ratingWise[key] += 1;
                    } else {
                        ratingWise[key] = 1;
                    }
                    let tags = submission['problem']['tags'];
                    for (let t of tags) {
                        if (tagWise[t]) {
                            tagWise[t] += 1;
                        } else {
                            tagWise[t] = 1;
                        }
                    }
                    names.push(name);
                }
            }

            for (const submission of submissions) {
                let key = submission['problem']['rating'];
                let name = submission['problem']['name'];
                let contestId = submission['problem']['contestId'];
                let index = submission['problem']['index'];
                if (submission.verdict != "WORNG ANSWER" && !unsolved.includes(contestId + index) && !names.includes(name)) {
                    unsolved.push(contestId + index);
                }
            }
            const sortedEntries = Object.entries(tagWise).sort((a, b) => b[1] - a[1]); // descending order
            const sortedCounts = Object.fromEntries(sortedEntries);


            const problemSolved = document.createElement("div");
            problemSolved.className = "roundbox  borderTopRound borderBottomRound";
            problemSolved.style.padding = "2em 1em";
            problemSolved.style.marginTop = "1em";
            problemSolved.setAttribute("height", "10");


            problemSolved.innerHTML = `
                                    <h4> Problem Ratings </h4>
                                

                                    <style>
                                        h4{
                                            color: #00796b !important;
                                        }
                                    </style>

                                `

            async function barChart(dataObj) {
                try {


                    const container = document.createElement("div");
                    container.style.cssText = `
                                            width: auto;
                                            margin: 20px auto;
                                            background: #fff;
                                            padding: 10px;
                                            border: 1px solid #ccc;
                                            border-radius: 8px;
                                            z-index: 99999;
                                            `;

                    const canvas = document.createElement("canvas");
                    canvas.id = "injectedChart";
                    container.appendChild(canvas);

                    problemSolved.appendChild(container);

                    const labels = Object.keys(dataObj);
                    const values = Object.values(dataObj);
                    const palette = [
                        "#ADD8E6", "#98FB98", "#DDA0DD", "#FFDAB9", "#B0E0E6",
                        "#F0E68C", "#E6E6FA", "#AFEEEE", "#87CEFA", "#7B68EE", "#BA55D3", "#FF69B4", "#FFA07A",
                        "#20B2AA", "#DA70D6", "#C71585", "#DB7093", "#CD5C5C", "#F4A460", "#2E8B57", "#8A2BE2",
                        "#4682B4", "#D2B48C", "#BDB76B", "#FF4500", "#FF8C00", "#ADFF2F", "#00FA9A", "#40E0D0",
                        "#87CEEB", "#6A5ACD", "#EE82EE", "#FF1493", "#FFD700", "#FFC0CB", "#B0E0E6", "#98FB98",
                        "#DDA0DD", "#FFDAB9", "#AFEEEE", "#87CEFA", "#7B68EE", "#BA55D3", "#FF69B4", "#FFA07A",
                        "#20B2AA", "#DA70D6", "#C71585", "#DB7093", "#CD5C5C", "#F4A460", "#2E8B57", "#8A2BE2"
                    ];

                    const colors = labels.map((_, i) => {
                        return palette[i % palette.length];
                    });


                    new Chart(canvas, {
                        type: "bar",
                        data: {
                            labels: labels,
                            datasets: [{
                                data: values,
                                backgroundColor: colors
                            }]
                        },
                        options: {
                            plugins: {
                                legend: {
                                    display: false
                                },
                                tooltip: {
                                    enabled: true
                                },
                                datalabels: {
                                    color: "#00796b",
                                    anchor: "end",
                                    align: "top",
                                    font: {
                                        weight: "bold"
                                    }
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true
                                }
                            }
                        },
                        plugins: [ChartDataLabels]
                    });
                } catch (err) {
                    console.error("Chart loading error:", err);
                }
            }

            barChart(ratingWise);




            const tagsSolved = document.createElement("div");
            tagsSolved.className = "roundbox  borderTopRound borderBottomRound";
            tagsSolved.style.padding = "2em 1em";
            tagsSolved.style.marginTop = "1em";
            tagsSolved.setAttribute("height", "10");


            tagsSolved.innerHTML = `
                                    <h4>  Tags Solved  </h4>
                                `

            async function pieChart(dataObj) {
                try {
                    const chartWrapper = document.createElement("div");
                    chartWrapper.style.cssText = `
                                            display: flex;
                                            flex-direction: column;
                                            align-items: flex-start;
                                            width: 100%;
                                            padding: 10px;
                                            color: #00796b;
                                            font-family: sans-serif;
                                            box-sizing: border-box;
                                          `;



                    const chartAndLegendContainer = document.createElement("div");
                    chartAndLegendContainer.style.cssText = `
                                          display: flex;
                                          flex-wrap: wrap;
                                          justify-content: space-between;
                                          align-items: flex-start;
                                          width: 100%;
                                          padding:0 16px;
                                        `;

                    const canvas = document.createElement("canvas");
                    canvas.id = "injectedChart";
                    canvas.style.maxWidth = "350px";
                    canvas.style.maxHeight = "350px";
                    canvas.style.flexShrink = "0";
                    canvas.style.marginBottom = "20px";

                    chartAndLegendContainer.appendChild(canvas);
                    chartWrapper.appendChild(chartAndLegendContainer);
                    tagsSolved.appendChild(chartWrapper);

                    const labels = Object.keys(dataObj);
                    const values = Object.values(dataObj);

                    const palette = [
                        "#FF6B6B", "#4ECDC4", "#FFA500", "#1E90FF", "#FFB347", "#00CED1", "#9370DB", "#40E0D0",
                        "#6495ED", "#DA70D6", "#F08080", "#3CB371", "#FF8C00", "#00BFFF", "#BA55D3", "#32CD32",
                        "#20B2AA", "#FF6347", "#87CEEB", "#FF69B4", "#8A2BE2", "#5F9EA0", "#FF7F50", "#4682B4",
                        "#7B68EE", "#00FA9A", "#DB7093", "#48D1CC", "#9ACD32", "#FF4500", "#ADFF2F", "#6A5ACD",
                        "#00FF7F", "#DC143C", "#FFD700", "#6B8E23", "#8B008B", "#B0C4DE", "#E9967A", "#FF1493"
                    ];



                    const backgroundColors = labels.map((_, i) => palette[i % palette.length]);
                    const borderColors = backgroundColors.map(color => {
                        const hex = color.replace("#", "");
                        const r = parseInt(hex.substring(0, 2), 16);
                        const g = parseInt(hex.substring(2, 4), 16);
                        const b = parseInt(hex.substring(4, 6), 16);
                        return `rgb(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)})`;
                    });

                    new Chart(canvas, {
                        type: "doughnut",
                        data: {
                            labels,
                            datasets: [{
                                data: values,
                                backgroundColor: backgroundColors,
                                borderColor: borderColors,
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    display: false
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            const label = context.label || '';
                                            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                                            const value = context.raw;
                                            const percent = ((value / total) * 100).toFixed(1);
                                            return `${label}: ${value} (${percent}%)`;
                                        }
                                    }
                                },
                                datalabels: {
                                    color: '#fff',
                                    formatter: (value, context) => {
                                        const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                                        const percentage = parseFloat((value / total * 100).toFixed(1));
                                        return percentage > 5 ? value : '';
                                    },
                                    font: {
                                        weight: 'bold',
                                        size: 10
                                    }
                                }
                            },
                            cutout: '50%',
                        },
                        plugins: [ChartDataLabels]
                    });

                    // --- Scrollable Legend ---
                    const legendContainer = document.createElement("div");
                    legendContainer.style.cssText = `
                                          display: flex;
                                          flex-direction: column;
                                          max-height: 300px;
                                          width:260px;
                                          overflow-y: auto;
                                          padding: 4px;
                                          font-size: 13px;
                                          line-height: 1;
                                          color: #00796b;
                                          scrollbar-width: thin;
                                        `;

                    labels.forEach((label, index) => {
                        const legendItem = document.createElement("div");
                        legendItem.style.cssText = `
                                              display: flex;
                                              align-items: center;
                                              margin-bottom: 4px;
                                            `;

                        const colorBox = document.createElement("span");
                        colorBox.style.cssText = `
                                                display: inline-block;
                                                width: 14px;
                                                height: 14px;
                                                background-color: ${backgroundColors[index]};
                                                border: 1px solid ${borderColors[index]};
                                                margin-right: 8px;
                                                border-radius: 3px;
                                                flex-shrink: 0;
                                              `;

                        const text = document.createElement("span");
                        text.textContent = `${label} : ${values[index]}`;

                        legendItem.appendChild(colorBox);
                        legendItem.appendChild(text);
                        legendContainer.appendChild(legendItem);
                    });

                    chartAndLegendContainer.appendChild(legendContainer);

                } catch (err) {
                    console.error("Chart loading error:", err);
                }
            }



            pieChart(sortedCounts);




            const unSolvedDiv = document.createElement("div");
            unSolvedDiv.className = "roundbox  borderTopRound borderBottomRound";
            unSolvedDiv.style.padding = "2em 1em";
            unSolvedDiv.style.marginTop = "1em";
            unSolvedDiv.setAttribute("height", "10");


            unSolvedDiv.innerHTML = `
                                    <h4>   Unsolved Problems   </h4>
                                `




            unSolvedDiv.appendChild(createUnsolvedProblemsSection(unsolved));




            function createUnsolvedProblemsSection(problemsArray) {
                // Container div
                const container = document.createElement('div');
                container.style.cssText = `
                                        padding: .3em 0;
                                      `;



                // Count line
                const countLine = document.createElement('p');
                countLine.style.margin = "4px 0";
                countLine.textContent = `Count : ${problemsArray.length}`;
                container.appendChild(countLine);

                const listLine = document.createElement('p');

                problemsArray.forEach((problemCode, index) => {
                    // Split number and letter from the code
                    const problemNumber = problemCode.slice(0, -1);
                    const problemLetter = problemCode.slice(-1);

                    // Create link element
                    const link = document.createElement('a');
                    link.href = `https://codeforces.com/problemset/problem/${problemNumber}/${problemLetter}`;
                    link.textContent = problemCode;
                    link.style.marginRight = '8px';
                    link.style.color = '#2a42c4';
                    link.style.textDecoration = 'none';
                    link.target = "_blank";
                    link.rel = "noopener noreferrer";

                    listLine.appendChild(link);
                });

                container.appendChild(listLine);

                return container;
            }

            const pageContent = document.getElementById("pageContent");
            if (pageContent) {
                pageContent.appendChild(problemSolved);
                pageContent.appendChild(tagsSolved);
                pageContent.appendChild(unSolvedDiv);
                // pageContent.prepend(unSolvedDiv);

            }

        } catch (error) {
            console.error(error);
            alert("Error fetching data. Please try again.");
        }



    }





})();
