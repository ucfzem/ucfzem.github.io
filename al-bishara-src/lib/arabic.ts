/**
 * تطبيع عربي بسيط للبحث: إزالة التشكيل والتطويل وتوحيد الحروف المتشابهة.
 */
export const normalizeArabic = (s: string): string =>
  (s || '')
    .replace(/[\u064B-\u065F\u0670]/g, '') // tashkeel
    .replace(/[إأآٱا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[ؤئ]/g, 'ء')
    .replace(/ـ/g, '')
    .toLowerCase();

/** عدد مرات ظهور النص في نص مطبَّع. */
export function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  let count = 0;
  let i = haystack.indexOf(needle);
  while (i !== -1) {
    count++;
    i = haystack.indexOf(needle, i + needle.length);
  }
  return count;
}
