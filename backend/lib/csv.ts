/** Quote CSV fields and prevent applicant-provided text from becoming a spreadsheet formula. */
export function toCsvValue(value: string | null | undefined): string {
  let text = value ?? "";
  if (/^\s*[=+\-@]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
