/**
 * Structured data for search engines, rendered as a plain `<script>` in the
 * server HTML (it is data, not code, so `next/script` is not involved).
 * `<` is escaped so text coming from the admin console can never close the tag.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
