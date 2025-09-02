CodeQuest

CodeQuest is a browser extension for the  platform, designed to enhance the user experience for competitive programmers. It provides a suite of tools for goal setting, progress tracking, and automated solution backup to a personal GitHub repository, integrating directly into the Codeforces user interface.

Table of Contents

Key Features

    Target Management: Set, track, and manage performance goals based on problem difficulty ratings over specified time periods. Progress is displayed directly on the Codeforces website for constant visibility.

    Automated GitHub Integration: Automatically commit and push accepted solutions to a designated GitHub repository. This feature helps maintain an organized portfolio of problem-solving history with zero manual intervention.

    Progress Visualization: Access a dashboard with analytics on your performance, including a breakdown of solved problems by rating and by programming tag (e.g., data structures, greedy, dp).

    Seamless UI Integration: The extension embeds its components, such as the target tracker, into the native Codeforces interface for a fluid and non-intrusive user experience.

Demonstration

Statistics and Analytics Dashboard

The popup provides a comprehensive overview of solved problems, categorized by rating and tag.

Target Configuration

Users can define specific targets, such as the number of problems to solve at each difficulty level within a set date range.
<img src="66XvNF1o.jpeg" alt="Target Configuration Panel" width="600"/>

GitHub Repository Setup

Configure the extension to connect with your GitHub account for automated code backups.
<img src="PXJ2Sxdr.jpeg" alt="GitHub Setup Panel" width="600"/>

Installation Guide

Prerequisites

    A Chromium-based browser such as Google Chrome, Microsoft Edge, or Brave.

Option 1: Manual Installation for Development

    Clone or download this repository to your local machine:

    Open your browser and navigate to the extensions management page (chrome://extensions or edge://extensions).

    Enable Developer mode using the toggle switch.

    Click the Load unpacked button.

    Select the directory where you cloned the repository.

Configuration and Usage

After installation, follow these steps to configure the extension.

1. Initial Setup

    Click the CodeQuest icon in your browser's toolbar to open the popup.

    Enter your Codeforces Handle in the designated field to link your account.

2. GitHub Integration (Optional)

    From the main popup, navigate to the Set Github Repo section.

    Provide the following details:

        Username: Your GitHub username.

        Repository: The name of the target repository for your solutions.

        Token: A GitHub Personal Access Token (PAT). You must generate a token with repo scope to allow the extension to push code to your private/public repositories. .

        Path: The specific directory within the repository where solutions should be stored (e.g., Codeforces/Solutions/).

    Click Setup to save the configuration.

3. Setting a New Target

    Open the popup and select Set New Target.

    Use the date pickers to define the start and end dates for your target period.

    Select a problem Rating and enter the desired Target Count.

    Click Add more to include targets for multiple rating levels.

    Click Set Target to activate your goals.

The extension is now configured. Your target progress will be visible on Codeforces, and accepted solutions will be automatically pushed to your GitHub repository.

Technology Stack

    Frontend: HTML5, CSS3, JavaScript (ES6)

    Charting Library:  for data visualization.

    APIs: Utilizes the official  for user data and the  for repository management.
