

# Scrap Project Overview

This document provides a comprehensive "inch-by-inch" technical overview of the **Scrap** application, detailing the languages, architecture, and connectivity.

## 1. The "Inch-by-Inch" Tech Stack

### Frontend (User Interface)
- **Language**: **TypeScript (TSX)**. We use TypeScript for type safety, ensuring that data passed between components is consistent. TSX allows us to write HTML-like structures directly within our logic.
### Framework: Next.js 16 (The "Skeleton")
**Next.js** is more than just a library; it is the **Framework** that holds everything together. Think of it as the "Operating System" for the web app.

- **App Router Architecture**: We use the latest **App Router** (the `src/app` folder). Every folder inside `app` automatically becomes a page (e.g., `app/admin` becomes `your-site.com/admin`).
- **Server Components (Default)**: By default, pages are rendered on the server. This makes the app **extremely fast** because the browser doesn't have to download huge amounts of JavaScript to show the first page.
- **Client Components**: When we need interactivity (like a map that you can drag or a button that shows a popup), we add `'use client'` at the top of the file. This tells Next.js to make that specific part interactive.
- **Image Optimization**: Next.js automatically shrinks and optimizes images so the app stays fast even with high-quality scrap material photos.
- **Built-in Routing**: It handles moving between pages (like jumping from "Login" to "Dashboard") instantly without reloading the whole browser.

### Styling: Tailwind CSS 4 (The "Skin")
Tailwind is the framework we use for **Design**.
- Instead of writing hundreds of lines of CSS in separate files, we use "utility classes" directly in the code (e.g., `bg-blue-500` for a blue background). 
- It ensures the app looks beautiful on **Phones, Tablets, and Desktops** automatically using "Responsive Design."

### Animations: Framer Motion (The "Movement")
To make the app feel "premium," we use **Framer Motion**.
- It handles smooth transitions, like the way a menu slides in from the side or the way a success message "pops" onto the screen. It makes the app feel "alive" rather than static.
- **Maps**: **Leaflet**. Used to render the interactive maps for tracking and location selection.

### Backend (Logic & Security)
- **Language**: **TypeScript**. All backend logic is written in pure TypeScript.
- **Architecture**: **Next.js Server Actions**. We don't use a separate "Backend" server like Express. instead, we use "Server Actions" (found in `src/app/actions.ts`). 
    - **How it works**: When a user clicks "Book Pickup," a function decorated with `'use server'` is called. This function runs securely on the server, not in the user's browser.
- **API Strategy**: **Zero-REST API**. By using Server Actions, we eliminate the need for traditional REST or GraphQL endpoints. The frontend calls functions directly, and Next.js handles the network communication securely.

### Database (Data Storage)
- **Database Engine**: **MongoDB (Atlas)**. A NoSQL, document-based database. It stores data as JSON-like documents, which is ideal for flexible scrap material lists and user profiles.
- **ORM (The Bridge)**: **Prisma**. This is the most critical connection point.
    - **Schema**: Defined in `prisma/schema.prisma`. It describes exactly what a `User`, `Booking`, or `Address` looks like.
    - **Type Safety**: Prisma generates TypeScript types based on your database structure, preventing errors where you might try to save a "Name" as a "Number."

---

## 2. How Everything Connects (Data Flow)

Here is the exact path data takes:

1.  **UI Layer (Frontend)**: A user fills out the booking form (`src/app/book/booking-form.tsx`).
2.  **Action Layer (Bridge)**: The form calls a "Server Action" (e.g., `createBookingAction` in `src/app/actions.ts`).
3.  **Data Layer (ORM)**: The Server Action uses the **Prisma Client** (`src/lib/db.ts`) to talk to the database.
    - *Example*: `db.booking.create({ data: { ... } })`
4.  **Database Layer**: **Prisma** translates that TypeScript command into a MongoDB query and sends it to the cloud-hosted **MongoDB Atlas** instance.
5.  **Response**: The database confirms the save, Prisma returns the data back to the Server Action, and the Action updates the UI (e.g., redirecting the user to the "Success" page).

---

## 3. Detailed Folder Structure

```text
scrap/
├── prisma/               # THE DATA BLUEPRINT
│   └── schema.prisma     # Defines models (User, Booking, etc.) for MongoDB
├── src/
│   ├── app/              # THE ROUTING & BACKEND LOGIC
│   │   ├── (auth)/       # Login/Signup logic
│   │   ├── actions.ts    # THE BRAIN: Most backend code lives here as Server Actions
│   │   ├── ...           # Each folder is a page/URL (e.g., /admin, /agent)
│   ├── components/       # THE UI BUILDING BLOCKS
│   │   ├── ui/           # Buttons, Inputs, Dialogs (Shared across the app)
│   │   └── maps/         # Complex map logic
│   ├── lib/              # THE CORE UTILITIES
│   │   ├── db.ts         # Connects the whole app to Prisma/MongoDB
│   │   └── store.ts      # Global shared app state
│   └── utils/            # Helper functions (Math, Date formatting, etc.)
```
