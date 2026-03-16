# 🎬 Video Store Platform

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![tRPC](https://img.shields.io/badge/tRPC-2596BE?style=for-the-badge&logo=trpc&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)

A modern, full-stack video storefront built with the **T3 Stack** and designed to be deployed on **Cloudflare's edge network**. 

This platform allows users to browse and purchase movies, while providing administrators with a powerful dashboard to manage the store's inventory, analytics, and user interactions.

## ✨ Features

### 👤 User Experience
* **Browse & Discover**: Explore a rich catalog of movies with a responsive, modern UI built using Tailwind CSS and shadcn/ui.
* **Seamless Purchasing**: Frictionless checkout flow for buying movies.
* **Intelligent Search**: Enhanced search capabilities powered by AI (using Vercel AI SDK).

### 🛡️ Admin Dashboard
* **Inventory Management**: Add, edit, or remove movies from the store's catalog.
* **Store Analytics**: View sales data, user metrics, and store performance via interactive charts (Recharts).
* **Edge-Ready**: Fully optimized for Cloudflare Workers & D1 Database, ensuring global low-latency access.

## 🛠️ Tech Stack

* **Framework**: [Next.js](https://nextjs.org/) (App Router)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **API**: [tRPC](https://trpc.io/) for end-to-end typesafe APIs
* **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) via [Drizzle ORM](https://orm.drizzle.team/)
* **Styling**: [Tailwind](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
* **Deployment**: [OpenNext Cloudflare](https://opennext.js.org/cloudflare) & Wrangler
* **State Management**: [Jotai](https://jotai.org/) for global state management & [TanStack Query](https://tanstack.com/query/latest) for server state management
* **Testing**: [Jest](https://jestjs.io/)

## 🚀 Getting Started (Local Development)

Follow these steps to get the project running on your local machine.

### Prerequisites
* **Node.js** (v20 or higher recommended)
* **pnpm** (Package manager, v10+)
* **Wrangler CLI** (Cloudflare's developer CLI)

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd video-store
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root of the project and add any necessary environment variables (e.g., API keys, database credentials). Refer to `.env.example` for required variables.

3. **Install dependencies:**
   ```bash
   npm install
   ```

4.a **Start the development server:**
   Run Next.js locally with Turbo:
   ```bash
   npm run dev
   ```
4.b **Start Cloudflare Preview:**
   Run the project in a Cloudflare Workers environment locally:
   ```bash
   npm run preview
   ```

## ☁️ Deployment

This project is configured to run on Cloudflare Pages/Workers using `opennextjs-cloudflare`. 

To deploy to your own Cloudflare account:

1. Authenticate with Cloudflare:
   ```bash
   npx wrangler login
   ```
2. Provision your D1 database in the Cloudflare dashboard and update the `database_id` in `wrangler.jsonc`.
3. Run the deployment script:
   ```bash
   npm deploy
   ```

## 🧪 Testing

We use Jest to ensure application reliability.
```bash
# Run the test suite
npm run test
```

## 📁 Project Structure

* `/src/app/home` - The main storefront for users.
* `/src/app/admin` - The administrative dashboard and CMS.
* `/src/app/api` - Next.js API routes (including tRPC endpoints and AI Agent).
* `/src/components` - Reusable UI components (shadcn/ui).
* `/src/server` - tRPC routers, database schemas, and business logic.
* `/src/trpc` - tRPC client setup and React Query providers.

---
