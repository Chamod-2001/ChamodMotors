// ============================================================
// MDMS — Language Dictionary
// Three modes: english | sinhala | mixed (default)
//
// Text lives in one file per feature under ./dictionary/*, merged
// below into a single `translations` object — everything else in
// the app keeps importing `translations`/`TranslationKey` from this
// file exactly as before, so splitting the source didn't change any
// other file. Add new keys to the relevant dictionary file (or
// dictionary/common.ts for anything shared across 2+ features).
// ============================================================

import { authText } from './dictionary/auth';
import { dashboardText } from './dictionary/dashboard';
import { vehiclesText } from './dictionary/vehicles';
import { customersText } from './dictionary/customers';
import { financeText } from './dictionary/finance';
import { documentsText } from './dictionary/documents';
import { reportsText } from './dictionary/reports';
import { profileText } from './dictionary/profile';
import { employeesText } from './dictionary/employees';
import { activityText } from './dictionary/activity';
import { searchText } from './dictionary/search';
import { calendarText } from './dictionary/calendar';
import { navText } from './dictionary/nav';
import { commonText } from './dictionary/common';

export type LanguageMode = 'english' | 'sinhala' | 'mixed';

export const translations = {
  ...authText,
  ...dashboardText,
  ...vehiclesText,
  ...customersText,
  ...financeText,
  ...documentsText,
  ...reportsText,
  ...profileText,
  ...employeesText,
  ...activityText,
  ...searchText,
  ...calendarText,
  ...navText,
  ...commonText,
} as const;

export type TranslationKey = keyof typeof translations;
