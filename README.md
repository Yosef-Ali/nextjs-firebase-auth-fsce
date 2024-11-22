# Next.js Firebase Authentication App

A modern web application built with Next.js 13+, Firebase, and TypeScript, featuring authentication, dashboard functionality, and media management.

## Features

- 🔐 Authentication with Firebase
- 📊 Dashboard Interface
- 📝 Posts Management
- 📚 Resources Management
- 🖼️ Media Library
- 📱 Responsive Design
- 🎨 Modern UI with shadcn/ui

## Getting Started

### Prerequisites

- Node.js 16.8 or later
- Bun (recommended) or npm
- Firebase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nextjs-firebase-auth-app.git
   cd nextjs-firebase-auth-app
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Copy the environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Update the `.env.local` with your Firebase configuration.

5. Run the development server:
   ```bash
   bun run dev
   ```

### Environment Variables

Required environment variables:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

## Deployment

This app is configured for deployment on Vercel:

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your environment variables in Vercel's project settings
4. Deploy!

## Built With

- [Next.js](https://nextjs.org/)
- [Firebase](https://firebase.google.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [NextAuth.js](https://next-auth.js.org/)

## License

This project is licensed under the MIT License.
