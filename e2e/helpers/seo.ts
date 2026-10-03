/**
 * Mirrors `courseHeading` in the client (Frontend/Client/lib/seo.ts): a course page's
 * H1 is the course title plus "Course", unless the title already says what it is.
 */
export function courseHeading(title: string): string {
  return /\b(course|training|program(me)?|package|workshop|bootcamp|masterclass|certification|diploma)\b/i.test(title)
    ? title
    : `${title} Course`;
}
