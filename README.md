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
