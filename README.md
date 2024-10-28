This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Initial Setup
- Clone the repository.
- Open terminal and run the following command:
  ```bash
  npm install
  # or
  yarn install
  ```
- Create a file named `.env.local` at the project root.
- Open the `.env.local` file and add the following environment variables:
  ```bash
  JIRA_BASE_URL=<Base URL of the JIRA board for search query>
  JIRA_USERNAME=<Email id of the user>
  JIRA_API_TOKEN=<JIRA API token>
  ```
- The JIRA_BASE_URL sample: `https://<your_domain>.atlassian.net/rest/api/3/search`
- Steps to collect the JIRA API token:
  - Go to your profile page in JIRA.
  - Click the `Security` tab.
  - Under the `API Tokens` section click the `Create and manage API tokens` link.
  - Generate a new API token.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
