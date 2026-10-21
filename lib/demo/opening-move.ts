import type { CandidateProfile, Company, Role, Vacancy } from '../types';

/** A suggested first message, grounded in the strongest piece of evidence for this role. */
export function openingMove(from: Role, candidate: CandidateProfile, vacancy: Vacancy, company: Company): string {
  const skills = new Set([...vacancy.requiredSkills, ...vacancy.preferredSkills]);
  const evidence = candidate.evidence.find((e) => e.skills.some((s) => skills.has(s))) ?? candidate.evidence[0];
  // "Capstone: barangay health queue app" → "capstone project"
  const what = evidence
    ? evidence.type === 'project' && evidence.title.toLowerCase().startsWith('capstone')
      ? 'capstone project'
      : evidence.type === 'internship'
        ? 'internship'
        : evidence.title.split(':')[0].toLowerCase()
    : 'profile';

  if (from === 'employer') {
    return `Hi ${candidate.name.split(' ')[0]}! Your ${what} caught our eye. Free for a quick chat this week?`;
  }
  return `Hi ${company.name} team! I'm excited about the ${vacancy.title} role. Happy to walk you through my ${what}. When works for a short call?`;
}
