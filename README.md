<div align="center">

# GetMyCode

### Secure, self-service attendance-code distribution

A full-stack verification system built to replace the manual distribution of
individual attendance codes.

<br />

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![Resend](https://img.shields.io/badge/Email-Resend-black)](https://resend.com/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)](https://vercel.com/)

<br />

**Built from a real operational problem encountered during the  
Imo State Skill-Up Program in Nigeria.**

</div>

---

## Why I Built It

GetMyCode started with a problem I encountered firsthand during the
**Imo State Skill-Up Program in Nigeria**.

Participants needed individual attendance codes, but distributing those
codes across a large group became unnecessarily difficult. Participants
struggled to receive or locate their codes, while organizers had to spend
time manually managing and distributing them.

I kept thinking:

> **Why should distributing an individual attendance code require so much manual coordination?**

So I built GetMyCode.

Instead of manually sending codes, an administrator uploads a session roster
containing participant emails and their assigned codes. Participants then
verify their identity through email OTP and retrieve their own code.

**A manual distribution problem became a self-service system.**

---

## The Problem

| Manual Process | GetMyCode |
|---|---|
| Organizers manually distribute codes | Participants retrieve codes themselves |
| Participants depend on organizers | Email verification establishes identity |
| Large lists are difficult to manage | Session-based assignments |
| Codes can be misplaced or incorrectly shared | Each participant retrieves their assigned code |
| Repeated administrative support | Automated verification workflow |

---

## How It Works

```mermaid
flowchart LR
    A[Administrator] --> B[Upload Session Roster]
    B --> C[(Supabase)]
    D[Participant] --> E[Select Session]
    E --> F[Enter Email]
    F --> G[Receive OTP]
    G --> H[Verify Identity]
    H --> I[Retrieve Assigned Code]
    C --> I
Participant Verification Flow
flowchart TD
    A[Select Active Session]
    --> B[Enter Registered Email]
    --> C[Generate 6-Digit OTP]
    --> D[Send OTP via Resend]
    --> E[Verify OTP]
    --> F[Resolve Session Assignment]
    --> G[Display Attendance Code]
The system establishes a controlled relationship between:
Verified Participant
        +
Active Session
        +
Authorized Assignment
        ↓
Participant's Attendance Code
Core Features
�

🔐 Email OTP Verification
Participants verify ownership of their registered email through a six-digit one-time password.
�

�

🎟️ Unique Attendance Codes
Each participant can be associated with a unique attendance code for a specific session.
�

�

🧑🏾‍💼 Admin Dashboard
Administrators can manage sessions and upload participant information with their assigned codes.
�

�

🗓️ Session-Based Access
Attendance-code assignments are scoped to specific sessions instead of being treated as globally accessible resources.
�

�

📧 Transactional Email
OTP messages are delivered through Resend as part of the verification workflow.
�

�

☁️ Persistent Database
Participant, session, and attendance data are stored using Supabase and PostgreSQL.
�

System Architecture
GetMyCode is built as a full-stack Next.js application with a persistent PostgreSQL-backed data layer and transactional email infrastructure.
flowchart TB

    ADMIN[Administrator]
    USER[Participant]

    ADMIN --> APP[Next.js Application]
    USER --> APP

    APP --> UI[React UI]
    APP --> SERVER[Server-Side Logic]

    SERVER --> DB[(Supabase / PostgreSQL)]
    SERVER --> EMAIL[Resend Email API]

    APP --> DEPLOY[Vercel]

    DB --> DATA[Sessions & Participant Assignments]
    EMAIL --> OTP[One-Time Password]
Architecture at a Glance
                    GetMyCode
                        │
              ┌─────────┴─────────┐
              │                   │
        Administrator         Participant
              │                   │
              └─────────┬─────────┘
                        ↓
                Next.js Application
                        │
              ┌─────────┴─────────┐
              │                   │
              ↓                   ↓
        Server-Side Logic     React UI
              │
       ┌──────┴───────┐
       ↓              ↓
   Supabase         Resend
   PostgreSQL        Email
       │
       ↓
 Sessions / Participants
 / Attendance Assignments
Technology Stack
Layer
Technology
Purpose
Framework
Next.js 15
Full-stack web application
UI
React 18
Component-based interface
Language
TypeScript
Static typing and safer application logic
Styling
Tailwind CSS
Responsive interface styling
Database
Supabase / PostgreSQL
Persistent relational data
Verification
Email OTP
Participant identity verification
Email
Resend
Transactional OTP delivery
Deployment
Vercel
Application hosting
Code Quality
ESLint
Static analysis and consistency
Project Structure
GetMyCode/
│
├── app/
│   ├── admin/
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
│   └── database configuration and migrations
│
├── public/
│   └── static assets
│
├── next.config.ts
├── tailwind.config.ts
├── eslint.config.mjs
├── tsconfig.json
├── vercel.json
├── package.json
└── README.md
The separation between application routes, reusable components, Supabase utilities, and database infrastructure keeps the major concerns of the application organized independently.
Data Model
The core domain revolves around sessions and participant assignments.
erDiagram

    SESSION ||--o{ PARTICIPANT_ASSIGNMENT : contains

    SESSION {
        uuid id
        string name
        string status
        timestamp created_at
    }

    PARTICIPANT_ASSIGNMENT {
        uuid session_id
        string participant_email
        string attendance_code
    }
Conceptually
Session
   │
   ├── Participant A → Code A
   ├── Participant B → Code B
   ├── Participant C → Code C
   └── Participant D → Code D
This session-scoped model allows the same participant to have different attendance-code assignments across different sessions.
🔐 Security Model
Because GetMyCode handles participant identity and individually assigned attendance codes, access control is an important part of the system.
The intended access flow is:
flowchart LR

    A[Registered Email]
    --> B[OTP Verification]

    B --> C[Verified Identity]

    C --> D[Session Context]

    D --> E[Authorized Assignment]

    E --> F[Attendance Code]
Identity Before Retrieval
The participant must verify control of the registered email before the application resolves the assigned attendance code.
Authentication
      ↓
Authorization
      ↓
Data Retrieval
The attendance code should not be treated as a publicly accessible resource.
Server-Side Secrets
Sensitive credentials are supplied through environment variables rather than committed to source control.
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
ADMIN_PASSWORD=
The Supabase service-role key is privileged and should only be used in trusted server-side contexts.
Public Supabase Configuration
The browser-facing configuration uses:
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
Public configuration and privileged server credentials are kept conceptually separate.
📧 OTP Verification
The verification workflow uses Resend to deliver a six-digit OTP.
Participant
     │
     │ Enter registered email
     ↓
GetMyCode
     │
     │ Generate OTP
     ↓
Resend
     │
     │ Email OTP
     ↓
Participant
     │
     │ Enter OTP
     ↓
Verification
     │
     ↓
Authorized Session
     │
     ↓
Assigned Attendance Code
This provides a passwordless verification experience while reducing the amount of information participants need to remember.
🧑🏾‍💼 Administrative Workflow
The administrator workflow is designed around preparing a session before participants begin retrieving codes.
flowchart TD

    A[Administrator]
    --> B[Create / Select Session]

    B --> C[Prepare Participant Data]

    C --> D[Upload Session Roster]

    D --> E[(Supabase)]

    E --> F[Participant Access]
The administrator provides the system with the relationship between:
Participant Email
        ↓
Session
        ↓
Assigned Attendance Code
Participants then resolve that relationship through the verification flow rather than requiring the administrator to manually send each code.
📊 Product Workflow
Administrator
Create Session
      ↓
Prepare Participant Records
      ↓
Upload Session Roster
      ↓
System Stores Assignments
      ↓
Participants Can Begin Verification
Participant
Open GetMyCode
      ↓
Select Session
      ↓
Enter Registered Email
      ↓
Receive OTP
      ↓
Verify OTP
      ↓
Retrieve Assigned Code
      ↓
Copy / Use Code
🧠 Engineering Decisions
Why Next.js?
Next.js provides a unified framework for the application's interface, routing, and server-side operations.
This keeps the system relatively lightweight while allowing sensitive operations to remain outside the browser.
Why TypeScript?
The application works with several related domain objects:
Sessions
Participants
Attendance codes
Verification states
Administrative operations
TypeScript makes these relationships explicit and helps reduce invalid data flowing between application layers.
Why Supabase?
The application requires persistent relational data.
Supabase provides PostgreSQL-backed storage and the infrastructure required to manage the application's data without maintaining a database server from scratch.
Why PostgreSQL?
The system naturally contains relationships between sessions, participants, and assigned codes.
A relational database provides a clear way to represent those relationships and enforce data integrity.
Why Email OTP?
Participants do not need to create or remember another password.
OTP verification provides a low-friction way to establish control of the registered email address.
Why Session-Scoped Codes?
An attendance code belongs to a specific session.
Modeling that relationship explicitly prevents the code from becoming a globally accessible resource.
🛡️ Design Principles
GetMyCode is built around several core principles.
1. Self-Service
The participant should be able to retrieve their own code without requiring manual intervention from the administrator.
2. Least Necessary Access
A participant should receive the information associated with their own verified assignment rather than having access to the broader session dataset.
3. Session Context
Attendance codes belong to specific sessions and should be resolved within that context.
4. Server-Side Protection
Privileged credentials and sensitive operations should remain on the server.
5. Low-Friction Verification
The participant experience should require as few steps as possible while still establishing identity.
🚀 Getting Started
Prerequisites
Before running the project locally, you will need:
Node.js
npm
A Supabase project
A Resend account and API key
1. Clone the Repository
git clone https://github.com/Daniel-Sunday/GetMyCode.git
cd GetMyCode
2. Install Dependencies
npm install
3. Configure Environment Variables
Create a .env.local file in the project root:
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

RESEND_API_KEY=

ADMIN_PASSWORD=
Never commit .env.local, API keys, service-role credentials, or other secrets to source control.
4. Start the Development Server
npm run dev
Open the application at:
http://localhost:3000
📜 Available Scripts
Command
Description
npm run dev
Starts the development server
npm run build
Creates the production build
npm run start
Starts the production server
npm run lint
Runs ESLint
☁️ Deployment
GetMyCode is configured for deployment using Vercel.
GitHub
   │
   ↓
Vercel
   │
   ↓
Next.js Application
   │
   ├───────────────┐
   ↓               ↓
Supabase         Resend
PostgreSQL       Email
Production environment variables should be configured through the deployment platform rather than committed to the repository.
🧪 Testing & Reliability Roadmap
The next stage of engineering maturity would include automated verification of the most important business and security rules.
Planned
[ ] Unit tests for verification logic
[ ] Integration tests for database operations
[ ] End-to-end authentication tests
[ ] OTP expiration and retry limits
[ ] Rate limiting
[ ] Spreadsheet validation tests
[ ] Database policy testing
[ ] Continuous integration checks
🔭 Roadmap
Security
[ ] Stronger administrator authentication
[ ] OTP expiration
[ ] OTP retry limits
[ ] Rate limiting
[ ] Audit logging
[ ] Further database access hardening
Data Management
[ ] Stronger spreadsheet schema validation
[ ] Duplicate-record detection
[ ] Improved malformed-data handling
[ ] Session lifecycle management
Product
[ ] Instructor accounts
[ ] Multiple administrators
[ ] Multi-program support
[ ] Session analytics
[ ] Attendance claim history
[ ] Improved participant management
Engineering
[ ] Unit testing
[ ] Integration testing
[ ] End-to-end testing
[ ] GitHub Actions CI
[ ] Automated production checks
[ ] Application monitoring
⚖️ Current Limitations
GetMyCode is currently a working full-stack application, but there are areas that would require additional hardening before operating at a larger scale.
These include:
More robust administrator authentication
OTP lifecycle management
Rate limiting
Comprehensive automated testing
Advanced audit logging
Stronger import validation
More extensive production monitoring
These are natural next steps as the application evolves from a working product into a more production-hardened system.
📌 Project Status
Status: Working full-stack application
The core workflow is implemented:
Administrator
      ↓
Upload Session Data
      ↓
Participant Selects Session
      ↓
Enter Registered Email
      ↓
Receive OTP
      ↓
Verify Identity
      ↓
Resolve Assignment
      ↓
Retrieve Attendance Code
💡 What This Project Demonstrates
GetMyCode demonstrates the ability to move from a real-world problem to a working technical system.
Product Thinking
Identifying operational friction
Designing a self-service workflow
Reducing unnecessary administrative work
Designing around a real user environment
Full-Stack Engineering
Next.js application architecture
React component development
TypeScript
PostgreSQL data modeling
Supabase integration
Server-side logic
Email API integration
Environment-based configuration
Deployment architecture
Security & Systems Thinking
Identity verification
Session-scoped authorization
Sensitive credential management
Public versus privileged configuration
Controlled data retrieval
🧭 From Problem to Product
The complete journey can be summarized as:
Real-World Problem
        ↓
Observe the Friction
        ↓
Define the Workflow
        ↓
Design the Domain Model
        ↓
Build the Verification System
        ↓
Connect Persistent Storage
        ↓
Integrate Transactional Email
        ↓
Deploy the Application
GetMyCode was built because the problem existed first.
The technology followed the problem.
🌍 The Origin
GetMyCode began during the Imo State Skill-Up Program in Nigeria.
I experienced the difficulty of distributing individual attendance codes across a large group and saw how much unnecessary coordination the process created.
Rather than accepting the manual process as unavoidable, I explored whether the distribution could be turned into a simple self-service system.
That became GetMyCode.
A real operational problem became a product.
📈 Future Direction
The current system solves a focused problem:
Securely distributing individual codes to verified participants.
The same architecture can be extended to other situations where a coordinator needs to distribute unique, session-specific resources to verified users.
Potential applications include:
Training programs
Educational institutions
Workshops
Certification programs
Events
Cohort-based learning
Program-specific credentials
The core abstraction remains:
Program
   ↓
Session
   ↓
Authorized User
   ↓
Unique Resource
👨🏾‍💻 Author
Daniel Sunday
Building software around real problems, with a focus on practical product development and full-stack engineering.
�


�⁠�
�

Built from a real problem. Designed as a reusable system.
GetMyCode
�
```
