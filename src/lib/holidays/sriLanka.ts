/**
 * Sri Lanka public/bank holidays, keyed by "YYYY-MM-DD".
 *
 * Fixed-date holidays (New Year, Independence Day, Christmas) are the same
 * every year. Poya days and other religious holidays (Eid, Deepavali, Good
 * Friday, Mahasivarathri...) follow the lunar/religious calendar and shift
 * every year — add a new year's entry below once the following year's
 * official dates are published.
 *
 * 2026 dates sourced from the Central Bank of Sri Lanka's official bank
 * holiday circular: https://www.cbsl.gov.lk/en/about/about-the-bank/bank-holidays-2026
 */
const HOLIDAYS_BY_YEAR: Record<number, Record<string, string>> = {
  2026: {
    '2026-01-01': "New Year's Day",
    '2026-01-03': 'Duruthu Full Moon Poya Day',
    '2026-01-15': 'Tamil Thai Pongal Day',
    '2026-02-01': 'Navam Full Moon Poya Day',
    '2026-02-04': 'Independence Day',
    '2026-02-15': 'Mahasivarathri Day',
    '2026-03-02': 'Medin Full Moon Poya Day',
    '2026-03-21': 'Id-Ul-Fitr',
    '2026-04-01': 'Bak Full Moon Poya Day',
    '2026-04-03': 'Good Friday',
    '2026-04-13': 'Day Prior to Sinhala & Tamil New Year',
    '2026-04-14': 'Sinhala & Tamil New Year Day',
    '2026-05-01': 'Vesak Full Moon Poya Day / May Day',
    '2026-05-02': 'Day Following Vesak Full Moon Poya Day',
    '2026-05-28': 'Id-Ul-Alha',
    '2026-05-30': 'Adhi Poson Full Moon Poya Day',
    '2026-06-29': 'Poson Full Moon Poya Day',
    '2026-07-29': 'Esala Full Moon Poya Day',
    '2026-08-26': 'Milad-Un-Nabi',
    '2026-08-27': 'Nikini Full Moon Poya Day',
    '2026-09-26': 'Binara Full Moon Poya Day',
    '2026-10-25': 'Vap Full Moon Poya Day',
    '2026-11-08': 'Deepavali Festival Day',
    '2026-11-24': 'Il Full Moon Poya Day',
    '2026-12-23': 'Unduvap Full Moon Poya Day',
    '2026-12-25': 'Christmas Day',
  },
};

/** All holidays for a given year, or an empty object if that year hasn't been added yet. */
export function getHolidaysForYear(year: number): Record<string, string> {
  return HOLIDAYS_BY_YEAR[year] ?? {};
}
