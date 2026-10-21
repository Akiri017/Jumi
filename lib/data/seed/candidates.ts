import type { CandidateProfile } from '../../types';
import { PLACES } from './places';

// Fictional people. Each one exercises a different matching edge case (noted per profile).
export const CANDIDATES: CandidateProfile[] = [
  {
    // Demo persona: strong evidence, little formal experience.
    id: 'c-maria',
    name: 'Maria Santos',
    headline: 'BS IT graduate · frontend-leaning',
    education: 'BS Information Technology, 2026',
    avatarHue: 50,
    skills: [
      { name: 'React', proficiency: 2 },
      { name: 'HTML/CSS', proficiency: 3 },
      { name: 'TypeScript', proficiency: 2 },
      { name: 'Git', proficiency: 2 },
    ],
    experience: [],
    evidence: [
      {
        id: 'e-maria-capstone',
        type: 'project',
        title: 'Capstone: barangay health queue app',
        skills: ['React', 'Node.js', 'SQL'],
      },
      {
        id: 'e-maria-intern',
        type: 'internship',
        title: 'Web dev intern, Lakbay Labs',
        skills: ['JavaScript', 'React'],
        months: 3,
      },
      {
        id: 'e-maria-cert',
        type: 'certification',
        title: 'Responsive Web Design certificate',
        skills: ['HTML/CSS'],
      },
      {
        id: 'e-maria-portfolio',
        type: 'portfolio',
        title: 'mariasantos.dev',
        skills: ['React', 'TypeScript'],
        url: 'https://example.com/maria',
      },
    ],
    preferences: {
      salary: { value: { min: 24000, max: 30000 }, priority: 'essential' },
      locations: { value: [PLACES.qc, PLACES.makati], priority: 'essential' },
      workSetups: { value: ['remote'], priority: 'preferred' },
      openToRelocate: false,
    },
  },
  {
    // Experienced junior dev: a high-scoring comparison for the employer view.
    id: 'c-mark',
    name: 'Mark Aquino',
    headline: 'Web developer · 1 year at a startup',
    education: 'BS Computer Science, 2025',
    avatarHue: 210,
    skills: [
      { name: 'React', proficiency: 3 },
      { name: 'JavaScript', proficiency: 3 },
      { name: 'HTML/CSS', proficiency: 2 },
      { name: 'Node.js', proficiency: 2 },
    ],
    experience: [{ role: 'Junior developer', org: 'Bitbit PH', months: 14 }],
    evidence: [],
    preferences: {
      salary: { value: { min: 28000, max: 35000 }, priority: 'essential' },
      locations: { value: [PLACES.qc, PLACES.makati, PLACES.bgc], priority: 'essential' },
      workSetups: { value: ['hybrid', 'onsite'], priority: 'preferred' },
      openToRelocate: false,
    },
  },
  {
    // Salary mismatch: expectations above every junior band.
    id: 'c-ana',
    name: 'Ana Cruz',
    headline: 'Full-stack developer · career shifter',
    education: 'BS Accountancy, 2022 · bootcamp, 2025',
    avatarHue: 330,
    skills: [
      { name: 'React', proficiency: 3 },
      { name: 'JavaScript', proficiency: 3 },
      { name: 'HTML/CSS', proficiency: 3 },
      { name: 'TypeScript', proficiency: 2 },
      { name: 'Node.js', proficiency: 2 },
    ],
    experience: [{ role: 'Accounting staff', org: 'Payroll firm', months: 24 }],
    evidence: [{ id: 'e-ana-bootcamp', type: 'certification', title: 'Full-stack bootcamp', skills: ['React', 'Node.js'] }],
    preferences: {
      salary: { value: { min: 45000, max: 55000 }, priority: 'essential' },
      locations: { value: [PLACES.makati, PLACES.bgc], priority: 'essential' },
      workSetups: { value: ['hybrid'], priority: 'preferred' },
      openToRelocate: false,
    },
  },
  {
    // Remote-only as an essential: clashes with on-site roles.
    id: 'c-paolo',
    name: 'Paolo Garcia',
    headline: 'QA tester · automation enthusiast',
    education: 'BS Computer Engineering, 2026',
    avatarHue: 20,
    skills: [
      { name: 'Manual testing', proficiency: 3 },
      { name: 'Test cases', proficiency: 3 },
      { name: 'Selenium', proficiency: 2 },
      { name: 'JavaScript', proficiency: 1 },
    ],
    experience: [],
    evidence: [{ id: 'e-paolo-intern', type: 'internship', title: 'QA intern, Bayani Systems', skills: ['Manual testing', 'Test cases'], months: 4 }],
    preferences: {
      salary: { value: { min: 22000, max: 28000 }, priority: 'essential' },
      locations: { value: [PLACES.qc], priority: 'preferred' },
      workSetups: { value: ['remote'], priority: 'essential' },
      openToRelocate: false,
    },
  },
  {
    // Missing one essential skill for dev roles (no JavaScript, no React).
    id: 'c-bea',
    name: 'Bea Lim',
    headline: 'Multimedia arts grad · UI designer',
    education: 'BA Multimedia Arts, 2026',
    avatarHue: 280,
    skills: [
      { name: 'Figma', proficiency: 3 },
      { name: 'HTML/CSS', proficiency: 2 },
      { name: 'Prototyping', proficiency: 3 },
    ],
    experience: [],
    evidence: [
      { id: 'e-bea-thesis', type: 'project', title: 'Thesis: museum wayfinding app', skills: ['Figma', 'User research', 'Prototyping'] },
      { id: 'e-bea-portfolio', type: 'portfolio', title: 'Online case-study portfolio', skills: ['Figma'] },
    ],
    preferences: {
      salary: { value: { min: 22000, max: 28000 }, priority: 'essential' },
      locations: { value: [PLACES.qc, PLACES.makati], priority: 'preferred' },
      workSetups: { value: ['remote', 'hybrid'], priority: 'preferred' },
      openToRelocate: false,
    },
  },
  {
    // Strong evidence, zero work experience: data track.
    id: 'c-jose',
    name: 'Jose Reyes',
    headline: 'Statistics grad · dashboards and SQL',
    education: 'BS Statistics, 2026',
    avatarHue: 45,
    skills: [
      { name: 'SQL', proficiency: 2 },
      { name: 'Excel', proficiency: 3 },
    ],
    experience: [],
    evidence: [
      { id: 'e-jose-capstone', type: 'project', title: 'Capstone: dengue cases dashboard', skills: ['Python', 'Power BI', 'SQL'] },
      { id: 'e-jose-cert', type: 'certification', title: 'Data analytics professional certificate', skills: ['SQL', 'Excel'] },
    ],
    preferences: {
      salary: { value: { min: 24000, max: 30000 }, priority: 'essential' },
      locations: { value: [PLACES.bgc, PLACES.makati], priority: 'essential' },
      workSetups: { value: ['hybrid', 'remote'], priority: 'preferred' },
      openToRelocate: false,
    },
  },
  {
    // Cebu-based, open to relocating: tests the relocate path.
    id: 'c-kenji',
    name: 'Kenji Tan',
    headline: 'CS student · graduating 2027',
    education: 'BS Computer Science (4th year)',
    avatarHue: 160,
    skills: [
      { name: 'JavaScript', proficiency: 2 },
      { name: 'HTML/CSS', proficiency: 2 },
      { name: 'React', proficiency: 1 },
    ],
    experience: [],
    evidence: [{ id: 'e-kenji-hack', type: 'project', title: 'Hackathon: jeepney route finder', skills: ['JavaScript', 'React'] }],
    preferences: {
      salary: { value: { min: 20000, max: 25000 }, priority: 'essential' },
      locations: { value: [PLACES.cebu], priority: 'essential' },
      workSetups: { value: ['hybrid', 'onsite'], priority: 'preferred' },
      openToRelocate: true,
    },
  },
  {
    id: 'c-liza',
    name: 'Liza Mendoza',
    headline: 'IT graduate · hardware and helpdesk',
    education: 'BS Information Technology, 2025',
    avatarHue: 175,
    skills: [
      { name: 'Troubleshooting', proficiency: 3 },
      { name: 'Networking', proficiency: 2 },
      { name: 'Customer service', proficiency: 2 },
    ],
    experience: [{ role: 'Computer shop technician', org: 'Family business', months: 8 }],
    evidence: [],
    preferences: {
      salary: { value: { min: 18000, max: 22000 }, priority: 'essential' },
      locations: { value: [PLACES.davao], priority: 'essential' },
      workSetups: { value: ['onsite'], priority: 'preferred' },
      openToRelocate: false,
    },
  },
  {
    id: 'c-rafael',
    name: 'Rafael Dizon',
    headline: 'Comm arts grad · social and SEO',
    education: 'AB Communication, 2026',
    avatarHue: 15,
    skills: [
      { name: 'Social media', proficiency: 3 },
      { name: 'Content writing', proficiency: 3 },
      { name: 'SEO', proficiency: 1 },
    ],
    experience: [],
    evidence: [{ id: 'e-rafael-org', type: 'project', title: 'Ran a student org page (12k followers)', skills: ['Social media', 'Graphic design'] }],
    preferences: {
      salary: { value: { min: 20000, max: 24000 }, priority: 'essential' },
      locations: { value: [PLACES.qc], priority: 'essential' },
      workSetups: { value: ['hybrid'], priority: 'preferred' },
      openToRelocate: false,
    },
  },
  {
    id: 'c-carmela',
    name: 'Carmela Villanueva',
    headline: 'Campus journalist · writer',
    education: 'AB English, 2026',
    avatarHue: 30,
    skills: [
      { name: 'Content writing', proficiency: 3 },
      { name: 'Communication', proficiency: 3 },
    ],
    experience: [],
    evidence: [{ id: 'e-carmela-paper', type: 'portfolio', title: 'Published features, campus paper', skills: ['Content writing', 'SEO'] }],
    preferences: {
      salary: { value: { min: 18000, max: 23000 }, priority: 'essential' },
      locations: { value: [PLACES.iloilo], priority: 'essential' },
      workSetups: { value: ['hybrid', 'remote'], priority: 'preferred' },
      openToRelocate: false,
    },
  },
];
