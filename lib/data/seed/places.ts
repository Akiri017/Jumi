import type { Place } from '../../types';

// City strings must match exactly between vacancies and candidate preferences.
export const PLACES = {
  makati: { city: 'Makati', metro: 'Metro Manila' },
  bgc: { city: 'BGC, Taguig', metro: 'Metro Manila' },
  ortigas: { city: 'Ortigas, Pasig', metro: 'Metro Manila' },
  qc: { city: 'Quezon City', metro: 'Metro Manila' },
  cebu: { city: 'Cebu City', metro: 'Metro Cebu' },
  davao: { city: 'Davao City', metro: 'Metro Davao' },
  iloilo: { city: 'Iloilo City', metro: 'Metro Iloilo' },
} satisfies Record<string, Place>;
