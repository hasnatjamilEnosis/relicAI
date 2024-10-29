
# RelicAI

RelicAI is an advanced automated meeting notes generation application tailored for JIRA. This application streamlines the meeting documentation process by automatically creating detailed, customized notes based on essential project data, including ticket ID, summary, time logged, current status, and user commentary.

Key features of RelicAI include the use of a Large Language Model (LLM), specifically LLAMA 3.2, to analyze and distill comments on each JIRA issue, generating a concise summary of the current ticket status. 

Users can refine their notes by selecting key parameters such as the JIRA project, specific meeting attendees, timeframe, and more, ensuring precise, relevant outputs.

Additionally, RelicAI provides seamless options for exporting meeting notes in Excel format or publishing directly to the JIRA Confluence page on behalf of the user, making it a comprehensive tool for enhancing productivity and team alignment in JIRA-managed projects.


## Prerequisites

* Sourcetree or github desktop client
* Nodejs 20.x or above
* Postgres with pgadmin
* VS Code
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
```
DATABASE_URL="postgresql://<postgres server user>:<postgres server password>@localhost:5432/<database name>?schema=public"
```
**Example**
```
DATABASE_URL="postgresql://postgres:admin@localhost:5432/relic_core?schema=public"
```
* Open terminal inside VS Code and run the following command:
```
npx prisma migrate dev
```


## Run Locally

To start the application in `dev` mode, run the following command:
```
npm run dev
```


## Authors

- [@jamil2018](https://www.github.com/jamil2018)

