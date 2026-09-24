import type {
  Achievement,
  Certification,
  Course,
  EducationEntry,
  ExperienceEntry,
  Profile,
  Project,
  SkillGroup,
} from './types';

export const siteUrl = 'https://levintapia.vercel.app';

// The four roles from the CV headline. The resume hero prints them on one
// line; the cyber hero rotates through them.
export const roles = [
  'Software Developer',
  'Information Technology',
  'System Administrator',
  'Cybersecurity Enthusiast',
];

export const projectsLead = 'Client platforms, a capstone project, and things I built on my own to learn.';

export const achievementsLead = 'Thirteen years of competitive chess, from a school league to the UAAP.';

// Two short paragraphs rather than one long one: who you are and what you
// have shipped, then how you work and the IT background behind it. No
// technology is named here; the skills section and project cards do that.
const intro = [
  'Information Technology graduate and full-stack developer who has shipped web, mobile and IoT-integrated applications for real clients.',
  'Works directly with clients from the first conversation to the fixes after launch, and brings a corporate IT support background that keeps the people and machines behind the software in view.',
];

export const profile: Profile = {
  name: 'Jayson Levin Tapia',
  initials: 'JLT',
  title: 'Software Developer',
  headline: 'I build production systems end to end, from database and API to the interface people actually use.',
  intro,
  // Edit these to change what a skimming reader sees in bold. Each one must
  // appear, spelled exactly, somewhere in the introduction above. Empty, so
  // the introduction reads as plain text.
  keyTerms: [],
  summary: intro.join(' '),
  location: 'Antipolo City, Rizal, Philippines',
  timezone: 'Philippine Standard Time, UTC+8',
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

export const projectLinkNotes = {
  clientDemo: 'This project is not ready for others to see yet.',
  demo: 'No public demo for this one yet.',
  repo: 'Oops, the code is not available at this time.',
};

export const confidentialNote =
  'Something new is in progress. Not public yet, and worth the wait.';

export const projects: Project[] = [
  {
    id: 'recordlog',
    name: 'RecordLog',
    kind: 'Client project',
    client: 'Haina Guiaber',
    clientEmail: 'haina.guiaber@gmail.com',
    period: 'Jun 2026',
    summary: 'An internal document-tracking system that replaced a paper and spreadsheet workflow.',
    stack: ['React', 'Firebase', 'Recharts', 'Vite', 'PWA', "Supabase"],
    highlights: [
      'Logs incoming and outgoing records with file attachments, an in-app viewer, autocomplete-assisted entry and an audit log of every change.',
      'Internal messaging between staff accounts, plus a dashboard with volume and trend charts, one-click print and export.',
      'Offline support with network-status awareness and light and dark theming, iterated across several production releases from direct user feedback.',
    ],
  },
  {
    id: 'illuminance-aesthetica',
    name: 'Illuminance Aesthetica',
    kind: 'Client project',
    client: 'Ruffa',
    period: 'Jul 2026',
    summary: 'A multi-role salon and spa management platform running a real business day to day.',
    stack: ['React 19', 'Firebase', 'Firestore Rules', 'Tailwind CSS', 'Vite', 'Recharts'],
    highlights: [
      'Separate owner, manager and staff workspaces governed by Firestore security rules and a role-aware routing layer.',
      'Booking management, point-of-sale checkout, service catalogue, client records, gift certificates, staff scheduling and QR-based attendance in one application.',
      'Owner analytics with financial reports, payroll computation and revenue trends backed by real-time Firestore listeners.',
      'Automated security-rule verification and seeding scripts on a Firebase emulator workflow, so access control is tested before every deployment.',
    ],
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
  },
  {
    id: 'vanima-atelier',
    name: 'Vanima Atelier',
    kind: 'Client project',
    client: 'Andre Antepuesto',
    period: '2025',
    summary: 'An installable progressive web app running orders, inventory and sales analytics for a printing business.',
    stack: ['React', 'Firebase', 'Vite', 'PWA'],
    highlights: [
      'Order intake and fulfilment tracking with inventory levels kept in sync.',
      'Sales analytics for the owner, installable and usable on a phone in the shop.',
    ],
  },
  {
    id: 'clientflow',
    name: 'ClientFlow',
    kind: 'Client project',
    period: 'Apr 2026 - May 2026',
    summary: 'A client and team workspace for an SEO agency, holding the deliverables, attendance and payroll of every account in one place.',
    stack: ['JavaScript', 'Firebase', 'Supabase', 'Groq API', 'PWA'],
    highlights: [
      'A workspace per client, with a deliverable catalogue spanning SEO, technical, development, link-building and content work, logged as dated entries with file attachments and tracked against each renewal date.',
      'A team side holding member records, attendance on a monthly calendar, a planner of task cards and an activity log of every change made.',
      'Semi-monthly pay worked out pro rata from that attendance, counting full days, half days and rest-day work against absences, down to a per-day rate and a payslip.',
      "An assistant that answers questions about the agency's own records, reading the same data the pages show, and moving to a second model when the first is rate limited.",
    ],
  },
  {
    id: 'ai-notes',
    name: 'AI Notes',
    kind: 'Personal project',
    period: 'Jul 2026 - Present',
    summary: 'A free planning app where notes, calendar, habits and trackers all sit under one AI companion.',
    stack: ['React 19', 'TypeScript', 'Firebase', 'Zustand', 'Tailwind CSS', 'Groq API', 'PWA', 'Cloudinary'],
    highlights: [
      "An AI companion grounded in the account's own notes: it answers questions about them, drafts and summarises, suggests tags, and creates notes and calendar events straight from the conversation.",
      'Notes, events, weekly tasks, goals, habits, itineraries, a focus timer and dated trackers in one workspace, where each tracker is read on its own terms, from cycle length and savings growth to spending anomalies and mood patterns.',
      'A mind map across every entity at once, shareable note links open to real-time collaborative editing without an account, plus voice input, deadline reminders, a thirty-day trash and installable offline support.',
    ],
    demoUrl: 'https://aistickynotes.vercel.app',
  },
  {
    id: 'streamcaption',
    name: 'StreamCaption',
    kind: 'Personal project',
    period: 'Sep 2026',
    summary: 'Lets a mobile game streamer talk to a TikTok live without being heard: hold a floating mic, speak, and the words appear on screen for viewers to read.',
    stack: ['Expo', 'React Native', 'TypeScript', 'Kotlin', 'Expo Modules API', 'Android SpeechRecognizer'],
    highlights: [
      'A floating mic bubble and a caption drawn over any game by a native foreground service, so captions keep working even when Android closes the app mid-match, and a tap on the caption still reaches the game beneath it.',
      'Speech recognition in Taglish or English that keeps listening for as long as the bubble is held, with whole-word fixes for the Mobile Legends heroes and items it mishears ("go shun" becomes Gusion).',
      "Recognises the phone maker's game mode, from Xiaomi's Game Turbo to Samsung's Game Booster, and shows the exact steps when it cuts the speech service off mid-game.",
      'Rebuilt from an earlier Flutter version in Expo, with the overlay written as a custom Kotlin module.',
    ],
    download: {
      url: 'https://github.com/Levintaps/levi-portfolio/releases/latest/download/StreamCaption.apk',
      label: 'Download APK',
      detail: 'Android 7.0 or newer, about 67 MB. Android asks once to allow installs from your browser.',
    },
  },
  {
    id: 'startup-stealth',
    name: 'In stealth',
    kind: 'Startup project',
    period: 'Ongoing',
    summary: '',
    stack: [],
    highlights: [],
    confidential: true,
  },
  {
    id: 'limestone-tracker',
    name: 'Limestone Tracker',
    kind: 'Client project',
    client: 'Limestone Construction Mngt. Services',
    period: 'Jul 2026 - Present',
    summary: 'An expense ledger for a construction management firm, with receivables, payables and reimbursements in one app.',
    stack: ['React 19', 'Firebase', 'Vercel Serverless', 'Google Drive API', 'Recharts', 'jsPDF', 'Groq API', 'PWA'],
    highlights: [
      'Every project expense carries its receipt, compressed in the browser and filed to Google Drive through a serverless function, so no one using the app ever handles Google credentials.',
      'Billing status and contract value for each project alongside receivables, payables and reimbursements, with completed projects lockable against further edits.',
      'Profit and loss, cash flow, project comparison and savings reports, each downloadable as a branded PDF, plus AI insights on where the money goes.',
    ],
  },
  {
    id: 'smart-parking',
    name: 'Smart Parking System',
    kind: 'Capstone project',
    period: 'Jan 2025 - Dec 2025',
    summary: 'An IoT-enabled parking platform with a web admin panel and a mobile-responsive client app.',
    stack: ['Java', 'Spring Boot', 'MySQL', 'REST API', 'IoT'],
    highlights: [
      'Led development end to end, from database and REST API design through to both front ends.',
      'Real-time sales and revenue dashboard, live vehicle-entry tracking and e-wallet balance management, with role-based access for admin and staff.',
      'Automatic fare computation from live parking duration against configurable rate rules.',
    ],
  },
  {
    id: 'ojt-attendance',
    name: 'OJT Attendance Management System',
    kind: 'Personal project',
    client: 'Concentrix',
    period: 'Aug 2025 - Nov 2025',
    summary: 'A full-stack replacement for manual intern attendance tracking, now used by real interns and IT staff.',
    stack: ['Java', 'Spring Boot', 'MySQL', 'REST API'],
    highlights: [
      'Identified the gap during the Concentrix internship and built the system independently.',
      'Intern portal for badge-based time in and time out with account registration, plus a chatbot answering scheduling and badge questions.',
      'Admin dashboard with real-time attendance statistics and trend charts, with role-based separation of admin and intern permissions.',
    ],
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
  },
];


export const skillGroups: SkillGroup[] = [
  {
    name: 'Languages and frameworks',
    items: ['Java', 'Spring Boot', 'TypeScript', 'JavaScript', 'React', 'Python', 'C#', 'REST API design'],
  },
  {
    name: 'Web, mobile and game',
    items: ['HTML5', 'CSS3', 'Tailwind CSS', 'Vite', 'Progressive Web Apps', 'SEO fundamentals', 'Flutter', 'Android Studio', 'Unity'],
  },
  {
    name: 'Data and cloud',
    items: ['MySQL', 'Firebase Firestore', 'Supabase', 'Firebase Auth and Security Rules', 'Cloudinary', 'Node.js serverless', 'Vercel', 'AWS Cloud Practitioner Essentials'],
  },
  {
    name: 'Infrastructure and delivery',
    items: ['Docker', 'Kubernetes', 'Cloudflare CDN', 'Jenkins', 'Git and GitHub', 'Vitest'],
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

// The handful of skills worth being hired for. Each one is promoted out of
// the groups below, so editing this list is all it takes to change what the
// section leads with.
export const coreSkills = [
  'React',
  'TypeScript',
  'Java',
  'Spring Boot',
  'Firebase Firestore',
  'MySQL',
  'Tailwind CSS',
];

export const supportingSkillGroups: SkillGroup[] = skillGroups
  .map((group) => ({ ...group, items: group.items.filter((item) => !coreSkills.includes(item)) }))
  .filter((group) => group.items.length > 0);

export const education: EducationEntry[] = [
  {
    qualification: 'BS Information Technology',
    institution: 'ICCT Colleges Foundation, Inc.',
    period: 'Jan 2022 - Dec 2025',
    detail: 'Capstone: Smart Parking System, an IoT-enabled parking platform I led end to end.',
  },
];

export const certifications: Certification[] = [
  { name: 'Java Programming NC III', issuer: 'TESDA Manila' },
];

// Kept apart from the certifications above: these are courses finished, and
// the certificate each one issues records attendance, not an exam passed.
export const courses: Course[] = [
  {
    name: 'AWS Cloud Practitioner Essentials',
    issuer: 'AWS Training and Certification',
    completed: 'Sep 2026',
    certificate: {
      thumbnail: {
        avif: '/certificates/aws-cloud-practitioner-essentials-thumb.avif',
        webp: '/certificates/aws-cloud-practitioner-essentials-thumb.webp',
        fallback: '/certificates/aws-cloud-practitioner-essentials-thumb.jpg',
        width: 480,
        height: 371,
      },
      preview: {
        avif: '/certificates/aws-cloud-practitioner-essentials.avif',
        webp: '/certificates/aws-cloud-practitioner-essentials.webp',
        fallback: '/certificates/aws-cloud-practitioner-essentials.jpg',
        width: 1600,
        height: 1237,
      },
      pdf: '/certificates/aws-cloud-practitioner-essentials.pdf',
      alt: 'AWS Training and Certification completion certificate for AWS Cloud Practitioner Essentials, awarded to Jayson Levin Tapia, completed September 24, 2026.',
    },
  },
  // These two issue no certificate, and the month they were finished is no
  // longer known, so they are listed plainly rather than dated by guesswork.
  {
    name: 'API Security Fundamentals',
    issuer: 'APIsec University',
  },
  {
    name: 'OWASP API Security Top 10 and Beyond!',
    issuer: 'APIsec University',
  },
];

// One card on the homepage. The tournament wins, the UAAP medal and the rest
// of the story are on the chess page (src/data/chess.ts), a click away.
export const achievements: Achievement[] = [
  {
    title: 'FIDE rated chess player',
    detail: 'Ranked 43rd in the Philippines in October 2020, peak rating 2197.',
  },
];
