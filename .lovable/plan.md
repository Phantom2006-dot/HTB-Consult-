

# HTB Consults – LMS & Training Platform

## Overview
A professional landing page and training platform for HTB Consults, matching the dark/gold design aesthetic of htbconsults.com. The platform will offer Project Management training, Business Analysis training, CV Review, and 1-on-1 Mentoring, with user accounts, online enrollment with payment, and calendar-based booking.

---

## 1. Landing Page (Home)
- **Hero section** with bold headline about professional training & development, dark background with gold accents, CTA button to browse courses
- **Training categories overview** – cards for Project Management, Business Analysis, CV Review, and Mentoring
- **Why Choose HTB Consults** – value propositions (industry expertise, proven track record, tailored approach)
- **Mission & Vision** section
- **Testimonials / social proof** area
- **Footer** with company info, contact details, social media links, quick links

## 2. Training / Courses Page
- Grid of available courses with thumbnails, descriptions, pricing, and duration
- **Course detail pages** with syllabus/modules, downloadable materials info, instructor details, pricing, and an "Enroll Now" button
- Categories: Project Management, Business Analysis, and other courses
- Each course shows content as structured pages with downloadable resources

## 3. Services Page
- **CV Review** – description, pricing, and booking CTA
- **1-on-1 Mentoring** – description, pricing, and booking CTA
- Calendar-based booking system where users can pick available time slots

## 4. About Us Page
- Company story, team section, approach, and expertise areas
- Matching the existing HTB Consults design language

## 5. Contact Page
- Contact form (name, email, message)
- Office phone, email, address details
- FAQ accordion section

## 6. Authentication System
- **Sign Up page** – email/password registration with validation
- **Login page** – email/password login
- **Forgot Password** flow – email-based password reset
- Protected routes for enrolled users
- User profile with enrollment history

## 7. Backend (Supabase)
- **User profiles table** – name, avatar, bio
- **Courses table** – title, description, category, price, duration, modules/content
- **Enrollments table** – tracks which users enrolled in which courses
- **Bookings table** – for mentoring and CV review calendar slots
- **Available slots table** – admin-defined availability for 1-on-1 sessions
- Row-Level Security on all tables

## 8. Payments (Stripe)
- Integrated checkout for course enrollment
- Payment for CV Review and Mentoring bookings
- Success/cancel pages after payment

## 9. Design & Branding
- Dark background (#1a1a2e or similar dark navy) with gold/amber accent color matching HTB Consults' brand
- Professional serif + sans-serif typography
- Responsive design for mobile and desktop
- Navigation bar with logo and links: Home, Courses, Services, About, Contact, Login/Sign Up

