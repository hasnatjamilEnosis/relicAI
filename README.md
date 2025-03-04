
# RelicAI

RelicAI is an advanced automated meeting notes generation application tailored for JIRA. This application streamlines the meeting documentation process by automatically creating detailed, customized notes based on essential project data, including ticket ID, summary, time logged, current status, and user commentary.

Key features of RelicAI include the use of a Large Language Model (LLM), specifically LLAMA 3.2, to analyze and distill comments on each JIRA issue, generating a concise summary of the current ticket status. 

Users can refine their notes by selecting key parameters such as the JIRA project, specific meeting attendees, timeframe, and more, ensuring precise, relevant outputs.

Additionally, RelicAI provides seamless options for exporting meeting notes in Excel format or publishing directly to the JIRA Confluence page on behalf of the user, making it a comprehensive tool for enhancing productivity and team alignment in JIRA-managed projects.

## Prerequisites

* [Sourcetree](https://www.sourcetreeapp.com/) or [github desktop](https://desktop.github.com/download/) client
* [Nodejs](https://nodejs.org/en/download/) 20.x or above
* [Postgres with pgadmin](https://www.postgresql.org/download/)
* [Ollama](https://ollama.com/download)
* [VS Code](https://code.visualstudio.com/download)

## Installation

* Clone the repository using `sourcetree` or `github desktop`
* Open the project using `VS Code`
* Open terminal inside VS Code and run the following command:
  ```bash
  npm install
  ```
* Open `pgAdmin`, create a new server and create a new database named: `relic_ai`
* Return to `VS Code`, create a new file named `.env` in the `root` directory.
* Paste in the following environment variable according to the following format:
  ```bash
  DATABASE_URL="postgresql://<postgres server user>:<postgres server password>@localhost:5432/<database name>?schema=public"
  ```
  **Example**
  ```bash
  DATABASE_URL="postgresql://postgres:admin@localhost:5432/relic_core?schema=public"
  ```
* Open terminal inside VS Code and run the following command:
  ```bash
  npx prisma migrate dev
  ```
* Follow the steps under the `JIRA API Setup` section to set the environment variables in the `.env` file
* Follow the steps under the `LLAMA Setup` section to run and set the environment variables in the `.env` file

## JIRA API Setup
- Add the following environment variables in the `.env` file:
  ```bash
  JIRA_ORG_URL=<JIRA organization URL>
  JIRA_USERNAME=<Email id of the JIRA user>
  JIRA_API_TOKEN=<JIRA API token>
  ```
- JIRA_ORG_URL sample: `https://<your_domain>.atlassian.net`
- Steps to collect the JIRA API token:
  - Go to your profile page in JIRA
  - Click the `Security` tab
  - Under the `API Tokens` section click the `Create and manage API tokens` link
  - Generate a new API token

## LLAMA Setup
- Follow the steps [here](https://www.llama.com/docs/llama-everywhere/running-meta-llama-on-windows/) to install and run LLAMA model on your local machine
- Select the OS of your machine accordingly from the `Running Llama` section
- Add the following environment variables in the `.env` file
  ```bash
  LLAMA_BASE_URL=<LLAMA base URL>
  LLAMA_MODEL=<LLAMA model which is configured locally>
  ```
- LLAMA_BASE_URL sample: If the LLAMA is hosted locally then the base URL should be `http://localhost:11434`
- LLAMA_MODEL sample: If the configured model is Llama 3.2 then the value should be `llama3.2`

## Run Locally

To start the application in `dev` mode, run the following command:
```bash
npm run dev
```

## Authors

- [@jamil2018](https://www.github.com/jamil2018)
- [@mdsizer](https://github.com/mdsizer)