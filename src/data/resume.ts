import type {
  Achievement,
  Certification,
  EducationEntry,
  ExperienceEntry,
  Profile,
  Project,
  SkillGroup,
} from './types';

export const siteUrl = 'https://levintaps.vercel.app';

export const profile: Profile = {
  name: 'Jayson Levin Tapia',
  initials: 'JLT',
  title: 'Software Developer',
  headline: 'I build production systems end to end, from database and API to the interface people actually use.',
  summary:
    'Information Technology graduate and full-stack developer who has shipped web, mobile and IoT-integrated applications for real clients. Comfortable across the stack in React, TypeScript, Java and Firebase, and equally at home in the infrastructure underneath it after a corporate IT support internship covering systems administration, Active Directory and enterprise networking.',
  location: 'Antipolo City, Rizal, Philippines',
  email: 'levintapia.work@gmail.com',
  phone: '+63 921 480 5230',
  availability: 'Open to software developer roles',
  cvPath: '/cv/Jayson_Levin_Tapia_Resume.pdf',
  portrait: {
    avif: '/images/portrait.avif',
    webp: '/images/portrait.webp',
    fallback: '/images/portrait.jpg',
    width: 640,
    height: 800,
    alt: 'Jayson Levin Tapia',
  },
  socials: [
    { label: 'GitHub', href: 'https://github.com/Levintaps', icon: 'github' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/levintaps', icon: 'linkedin' },
    { label: 'Facebook', href: 'https://www.facebook.com/jaysonlevin.tapia', icon: 'facebook' },
    { label: 'Discord', href: 'https://discordapp.com/users/1301537425247703062', icon: 'discord' },
  ],
};

export const experience: ExperienceEntry[] = [
  {
    role: 'IT Support Intern',
    company: 'Concentrix',
    kind: 'Internship',
    start: 'Aug 2025',
    end: 'Nov 2025',
    highlights: [
      'Delivered technical support across a large-scale corporate IT environment, covering operating system installation, BIOS configuration, Group Policy setup and workstation imaging for employee onboarding.',
      'Resolved help-desk tickets while installing and configuring business applications and security tools on enterprise endpoints.',
      'Applied security patches and monitored endpoint compliance with company IT policy across managed workstations.',
      'Administered accounts, permissions and access rights through Active Directory, and diagnosed LAN and WAN connectivity faults.',
      'Supported cable management and physical network setup, working directly with enterprise network and hardware infrastructure.',
    ],
  },
];

export const projects: Project[] = [
  {
    id: 'illuminance-aesthetica',
    name: 'Illuminance Aesthetica',
    kind: 'Client project',
    period: 'Jul 2026 — Present',
    summary: 'A multi-role salon and spa management platform running a real business day to day.',
    stack: ['React 19', 'Firebase', 'Firestore Rules', 'Tailwind CSS', 'Vite', 'Recharts'],
    highlights: [
      'Separate owner, manager and staff workspaces governed by Firestore security rules and a role-aware routing layer.',
      'Booking management, point-of-sale checkout, service catalogue, client records, gift certificates, staff scheduling and QR-based attendance in one application.',
      'Owner analytics with financial reports, payroll computation and revenue trends backed by real-time Firestore listeners.',
      'Automated security-rule verification and seeding scripts on a Firebase emulator workflow, so access control is tested before every deployment.',
    ],
    featured: true,
  },
  {
    id: 'apartment-management',
    name: 'Apartment Management System',
    kind: 'Client project',
    period: 'Aug 2026',
    summary: 'A fully typed rental-property system for a multi-building portfolio.',
    stack: ['React 19', 'TypeScript', 'Firebase', 'Vercel Serverless', 'Cloudinary', 'Vitest', 'PWA'],
    highlights: [
      'Covers unit occupancy, tenant payments, expense tracking and owner reporting across several buildings.',
      'A strict owner and viewer role model enforced entirely in Firestore rules, with no client-writable role documents, covered by an automated rules test suite against the emulator.',
      'Signed Cloudinary uploads through Vercel serverless functions for receipts, plus PDF statement generation and installable offline support.',
    ],
    featured: true,
  },
  {
    id: 'recordlog',
    name: 'RecordLog',
    kind: 'Client project',
    period: 'Jun 2026',
    summary: 'An internal document-tracking system that replaced a paper and spreadsheet workflow.',
    stack: ['React', 'Firebase', 'Recharts', 'Vite', 'PWA'],
    highlights: [
      'Logs incoming and outgoing records with file attachments, an in-app viewer, autocomplete-assisted entry and an audit log of every change.',
      'Internal messaging between staff accounts, plus a dashboard with volume and trend charts, one-click print and export.',
      'Offline support with network-status awareness and light and dark theming, iterated across several production releases from direct user feedback.',
    ],
    featured: true,
  },
  {
    id: 'smart-parking',
    name: 'Smart Parking System',
    kind: 'Capstone project',
    period: 'Jan 2025 — Dec 2025',
    summary: 'An IoT-enabled parking platform with a web admin panel and a mobile-responsive client app.',
    stack: ['Java', 'Spring Boot', 'MySQL', 'REST API', 'IoT'],
    highlights: [
      'Led development end to end, from database and REST API design through to both front ends.',
      'Real-time sales and revenue dashboard, live vehicle-entry tracking and e-wallet balance management, with role-based access for admin and staff.',
      'Automatic fare computation from live parking duration against configurable rate rules.',
    ],
    featured: true,
  },
  {
    id: 'ojt-attendance',
    name: 'OJT Attendance Management System',
    kind: 'Personal project',
    period: 'Sep 2025 — Nov 2025',
    summary: 'A full-stack replacement for manual intern attendance tracking, now used by real interns and IT staff.',
    stack: ['Java', 'Spring Boot', 'MySQL', 'REST API'],
    highlights: [
      'Identified the gap during the Concentrix internship and built the system independently.',
      'Intern portal for badge-based time in and time out with account registration, plus a chatbot answering scheduling and badge questions.',
      'Admin dashboard with real-time attendance statistics and trend charts, with role-based separation of admin and intern permissions.',
    ],
    featured: false,
  },
  {
    id: 'vanima-atelier',
    name: 'Vanima Atelier',
    kind: 'Personal project',
    period: '2025',
    summary: 'An installable progressive web app running orders, inventory and sales analytics for a printing business.',
    stack: ['React', 'Firebase', 'Vite', 'PWA'],
    highlights: [
      'Order intake and fulfilment tracking with inventory levels kept in sync.',
      'Sales analytics for the owner, installable and usable on a phone in the shop.',
    ],
    demoUrl: 'https://vanima-atelier.vercel.app',
    featured: true,
  },
  {
    id: 'lookwhatchera',
    name: 'Lookwhatchera',
    kind: 'Personal project',
    period: '2025',
    summary: 'A tourist guide that answers questions with an AI chatbot and pins destinations on a map.',
    stack: ['Java', 'Spring Boot', 'Google Maps API', 'AI chatbot'],
    highlights: [
      'Conversational assistant answering location questions for travellers.',
      'Map pinning for destinations, served from a Spring Boot backend.',
    ],
    demoUrl: 'https://levi-lookwhatchera.vercel.app',
    screenshot: {
      avif: '/images/lookwhatchera.avif',
      webp: '/images/lookwhatchera.webp',
      fallback: '/images/lookwhatchera.jpg',
      width: 960,
      height: 600,
      alt: 'Lookwhatchera landing page showing a limestone-cliff cove in the Philippines with a "Discover the Philippines" headline and a Begin Your Journey button',
    },
    featured: true,
  },
  {
    id: 'harana-hub',
    name: 'Harana Hub',
    kind: 'Personal project',
    period: '2025',
    summary: 'An AI karaoke platform that scores a singing performance.',
    stack: ['React', 'Vercel Serverless', 'Google Gemini API'],
    highlights: [
      'Scores vocals through a Gemini-backed serverless API.',
      'Built as a serverless application with no infrastructure to maintain.',
    ],
    demoUrl: 'https://harana-hub.vercel.app',
    screenshot: {
      avif: '/images/harana-hub.avif',
      webp: '/images/harana-hub.webp',
      fallback: '/images/harana-hub.jpg',
      width: 960,
      height: 600,
      alt: 'Harana Hub karaoke screen with a YouTube video player, a backing track volume slider, a Start Singing panel and an empty playlist and leaderboard',
    },
    featured: true,
  },
];

export const skillGroups: SkillGroup[] = [
  {
    name: 'Languages and frameworks',
    items: ['Java', 'Spring Boot', 'TypeScript', 'JavaScript', 'React', 'Python', 'C#', 'REST API design'],
  },
  {
    name: 'Web, mobile and game',
    items: ['HTML5', 'CSS3', 'Tailwind CSS', 'Vite', 'Progressive Web Apps', 'Flutter', 'Android Studio', 'Unity'],
  },
  {
    name: 'Data and cloud',
    items: ['MySQL', 'Firebase Firestore', 'Firebase Auth and Security Rules', 'Cloudinary', 'Node.js serverless', 'Vercel', 'AWS Cloud Practitioner Essentials'],
  },
  {
    name: 'Infrastructure and delivery',
    items: ['Docker', 'Kubernetes', 'Cloudflare CDN', 'Jenkins', 'Git and GitHub', 'Vitest', 'Firestore Rules testing'],
  },
  {
    name: 'Systems, networking and security',
    items: ['Linux', 'Windows', 'VMware', 'Cisco networking', 'Active Directory', 'Web application security'],
  },
  {
    name: 'Practice and tooling',
    items: ['Prompt engineering', 'Google Gemini API', 'AI-assisted development', 'Figma', 'Wireframing', 'Technical writing'],
  },
];

export const education: EducationEntry[] = [
  {
    qualification: 'BS Information Technology',
    institution: 'ICCT Colleges Foundation, Inc.',
    period: 'Jan 2022 — Dec 2025',
  },
];

export const certifications: Certification[] = [
  { name: 'Java Programming NC III', issuer: 'TESDA Manila' },
  { name: 'Cloud Practitioner Essentials', issuer: 'AWS' },
];

export const achievements: Achievement[] = [
  {
    title: 'FIDE rated chess player',
    detail: 'Ranked 43rd in the Philippines in October 2020, peak rating 2155.',
  },
  {
    title: 'Multiple-time tournament champion',
    detail: 'Competitive chess, across several open tournaments.',
  },
  {
    title: 'UAAP award recipient',
    detail: 'Multiple awards in university athletic association competition.',
  },
];
