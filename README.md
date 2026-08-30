# GetMyCode

A secure self-service system for distributing unique attendance codes.

GetMyCode is a full-stack web application I built after encountering a real code-distribution problem during the Imo State Skill-Up Program in Nigeria.

The system allows program administrators to upload participant records and their assigned attendance codes. Participants can then verify their identity using their registered email and a one-time password (OTP), and securely retrieve the code assigned to them.

The goal is simple: replace manual code distribution with a controlled, self-service verification workflow.

---

Why I Built It

I built GetMyCode after experiencing the problem firsthand during the Imo State Skill-Up Program.

Participants were required to use individual attendance codes, but distributing those codes to a large number of people created unnecessary friction.

The process led to issues such as:

- Participants struggling to receive or locate their assigned codes
- Organizers spending time manually distributing codes
- Codes being shared or delivered incorrectly
- Participants repeatedly contacting organizers for assistance
- Difficulty managing large lists of individual codes

I kept thinking about a simple question:

«Why should distributing an individual attendance code require so much manual coordination?»

So I built GetMyCode.

Instead of requiring organizers to manually send individual codes, an administrator can upload a session roster containing participant emails and their assigned codes. Participants then verify ownership of their email and retrieve their own code through the application.

What started as a problem I encountered in a real program became a reusable system for secure, self-service code distribution.

---

The Problem

Traditional manual distribution creates a workflow like this:

Administrator
     │
     ├── Find participant
     ├── Find assigned code
     ├── Send code
     │
     ▼
Participant
     │
     ├── Receive message
     ├── Find code
     └── Use code

When this happens across a large group, the process becomes difficult to manage.

There is also no strong system-level guarantee that the person requesting a code is actually the participant assigned to that code.

---

The Solution

GetMyCode introduces an identity-verification layer between the participant and their attendance code.

Administrator
      │
      │ Upload participant records
      ▼
┌─────────────────────┐
│    Admin Dashboard  │
└──────────┬──────────┘
           │
           ▼
       Supabase
           │
           │ Session + participant
           │ + assigned code
           ▼
┌─────────────────────┐
│   Participant App   │
└──────────┬──────────┘
           │
           │ Select session
           ▼
      Enter email
           │
           ▼
      Generate OTP
           │
           ▼
     Receive email
           │
           ▼
      Verify OTP
           │
           ▼
 Retrieve assigned code
           │
           ▼
        Done

The important relationship is:

Verified participant
        +
Active session
        ↓
Authorized attendance code

---

Core Features

🔐 Email OTP Verification

Participants verify their identity using a six-digit one-time password sent to their registered email address.

This removes the need for participants to create or remember another password.

---

🎟️ Unique Attendance Codes

Each participant can be associated with a unique attendance code for a particular session.

The system is designed around the principle that participants should only be able to retrieve the code assigned to them.

---

🧑🏾‍💼 Admin Dashboard

Administrators can manage attendance sessions and upload participant information together with their assigned codes.

This replaces the need to manually send individual codes to participants.

---

🗓️ Session-Based Access

Attendance codes are associated with specific sessions.

The participant selects the relevant session before beginning the verification process.

This creates a clear boundary between:

Participant
    +
Session
    +
Assigned Code

rather than treating attendance codes as globally accessible resources.

---

📧 Transactional Email

OTP messages are delivered through Resend, allowing the verification flow to happen directly through the participant's email.

---

☁️ Persistent Database

Participant, session, and attendance information is stored using Supabase/PostgreSQL rather than browser-only storage.

This allows the application to maintain a centralized source of truth.

---

How It Works

1. Administrator creates a session

The administrator prepares the session and participant data.

Session
├── Participant A → Code A
├── Participant B → Code B
├── Participant C → Code C
└── ...

2. Participant opens GetMyCode

The participant selects the relevant active session.

3. Participant enters their email

The system uses the participant's registered email as the identity they are attempting to verify.

4. OTP is generated

A six-digit OTP is generated and delivered through email.

5. Participant verifies the OTP

The participant enters the received code.

6. The system resolves the assignment

After successful verification, the application identifies the participant's authorized attendance code for that session.

7. The code is displayed

The participant can view and copy their assigned attendance code.

---

Architecture

GetMyCode is implemented as a full-stack Next.js application.

                         ┌──────────────────┐
                         │    Participant   │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │    Next.js App   │
                         │                  │
                         │   App Router     │
                         │   React UI       │
                         │   Server Logic   │
                         └────────┬─────────┘
                                  │
                 ┌────────────────┼────────────────┐
                 │                │                │
                 ▼                ▼                ▼
          ┌────────────┐   ┌────────────┐   ┌────────────┐
          │  Supabase  │   │   Resend   │   │   Vercel   │
          │ PostgreSQL │   │   Email    │   │ Deployment │
          └────────────┘   └────────────┘   └────────────┘
                 │
                 ▼
        Sessions / Participants
        / Attendance Assignments

The application keeps the architecture relatively small while separating the main concerns:

- UI and routing
- Application logic
- Database access
- Authentication/verification
- Email delivery
- Deployment configuration

---

Technology Stack

Technology| Purpose
Next.js| Full-stack application framework
React| User interface
TypeScript| Static typing and application safety
Tailwind CSS| Styling and responsive UI
Supabase| Database and backend infrastructure
PostgreSQL| Relational data storage
Resend| Transactional email / OTP delivery
Vercel| Deployment
ESLint| Code quality and static analysis

---

Project Structure

GetMyCode/
│
├── app/
│   ├── admin/
│   ├── ...
│   └── application routes
│
├── components/
│   └── reusable UI components
│
├── lib/
│   └── supabase/
│       └── database clients and utilities
│
├── supabase/
│   └── database configuration / migrations
│
├── public/
│   └── static assets
│
├── next.config.ts
├── tailwind.config.ts
├── eslint.config.mjs
├── tsconfig.json
├── vercel.json
└── package.json

The application separates route-level experiences from reusable components and database infrastructure.

---

Security Considerations

Because the system handles participant identity and assigned attendance codes, access control is an important part of the architecture.

Identity Verification

A participant must verify ownership of their registered email before retrieving an attendance code.

Email
  ↓
OTP
  ↓
Verification
  ↓
Authorized session
  ↓
Assigned code

---

Server-Side Secrets

Sensitive credentials are supplied through environment variables rather than committed directly to the repository.

Example:

SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
ADMIN_PASSWORD=

The Supabase service-role key is particularly sensitive and should only be used in trusted server-side contexts.

---

Public Supabase Configuration

The browser-facing Supabase configuration uses the public project URL and anon key:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

Public configuration and privileged server credentials are kept conceptually separate.

---

Data Model

The core domain can be represented around sessions and participant assignments.

┌────────────────────┐
│       Session      │
├────────────────────┤
│ id                 │
│ name               │
│ status             │
│ created_at         │
└─────────┬──────────┘
          │
          │ 1:N
          ▼
┌────────────────────────┐
│ Participant Assignment │
├────────────────────────┤
│ session_id             │
│ participant_email      │
│ attendance_code        │
└────────────────────────┘

This structure allows the same participant to potentially have different attendance-code assignments across different sessions.

---

Engineering Decisions

Why Next.js?

Next.js allows the application to combine the user interface, routing, and server-side functionality within one application.

This keeps the system relatively lightweight while still allowing sensitive operations to remain outside the browser.

---

Why TypeScript?

The application handles several related concepts:

- Sessions
- Participants
- Attendance codes
- Verification states
- Administrative operations

TypeScript helps make those relationships explicit and reduces the risk of passing incompatible data between parts of the application.

---

Why Supabase?

The application requires persistent relational data.

Supabase provides PostgreSQL-backed storage and the infrastructure needed to build the application's data layer without maintaining a database server from scratch.

---

Why Email OTP?

The target users do not need another password to remember.

Email OTP provides a simple verification mechanism while allowing the application to establish that the person controlling the registered email is requesting access.

---

Why Session-Scoped Codes?

An attendance code is meaningful within the context of a particular session.

Associating codes with sessions makes the domain model more explicit and prevents the system from treating a code as a universal credential.

---

Local Development

Requirements

Before running the application locally, you will need:

- Node.js
- npm
- A Supabase project
- A Resend account/API key

Clone the Repository

git clone https://github.com/Daniel-Sunday/GetMyCode.git

cd GetMyCode

Install Dependencies

npm install

Configure Environment Variables

Create a ".env.local" file:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

RESEND_API_KEY=

ADMIN_PASSWORD=

Never commit ".env.local" or privileged credentials to source control.

Start the Development Server

npm run dev

The application will be available at:

http://localhost:3000

---

Available Scripts

Development

npm run dev

Starts the Next.js development server.

Production Build

npm run build

Creates an optimized production build.

Production Server

npm run start

Starts the application using the production build.

Lint

npm run lint

Runs ESLint against the project.

---

Deployment

The application is configured for deployment on Vercel.

A production deployment requires the appropriate environment variables to be configured in the hosting environment.

GitHub
   ↓
Vercel
   ↓
Next.js Application
   │
   ├── Supabase
   └── Resend

Production secrets should be configured through the deployment platform rather than committed to the repository.

---

What I Learned Building It

GetMyCode started as a practical solution to a problem I encountered during a real program.

Building it required thinking beyond the interface itself.

The project involved decisions around:

- Modeling participants and sessions
- Assigning unique resources to individual users
- Authentication and verification
- Server-side versus client-side responsibilities
- Protecting sensitive credentials
- Persistent relational data
- Transactional email
- Administrative workflows
- Deployment configuration

The most important lesson was that a seemingly simple operational problem can require several layers of engineering once the solution needs to be reliable and secure.

---

Current Limitations

GetMyCode is a working product, but there are areas I would strengthen for a larger production deployment.

Security

- [ ] Add stronger administrator authentication
- [ ] Add OTP expiration and retry limits
- [ ] Add rate limiting
- [ ] Further harden database access policies
- [ ] Add audit logging

Reliability

- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Add end-to-end authentication tests
- [ ] Add automated CI checks

Data Ingestion

- [ ] Stronger spreadsheet schema validation
- [ ] Duplicate-record detection
- [ ] Better malformed-data handling
- [ ] Import validation feedback

Product

- [ ] Instructor accounts
- [ ] Multiple administrators
- [ ] Session analytics
- [ ] Attendance claim history
- [ ] Multi-program support

---

Project Status

Working full-stack application

The core workflow is implemented:

Create Session
      ↓
Upload Participant Data
      ↓
Participant Selects Session
      ↓
Enter Email
      ↓
Receive OTP
      ↓
Verify Identity
      ↓
Resolve Assignment
      ↓
Retrieve Attendance Code

---

Why This Project Matters

GetMyCode is an example of building from an observed problem rather than starting with a technology and looking for somewhere to use it.

I encountered the problem during the Imo State Skill-Up Program in Nigeria, understood the friction it created for both participants and organizers, and built a system that could remove much of that manual coordination.

The project combines a real-world workflow with full-stack engineering:

Problem → Product → Architecture → Implementation → Deployment

---

Author

Daniel Sunday

GitHub: "Daniel-Sunday" (https://github.com/Daniel-Sunday)

---

Repository

"View the source code on GitHub" (https://github.com/Daniel-Sunday/GetMyCode)

---

Built from a real problem. Designed as a reusable system.
