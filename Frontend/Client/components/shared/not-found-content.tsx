import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants";

/** Body of the 404 screen, shared by the root and marketing not-found pages. */
export function NotFoundContent() {
  return (
    <Section
      padding="lg"
      stagger="up"
      containerClassName="flex flex-col items-center gap-6 py-24 text-center [--stagger-step:120ms]"
    >
      <Badge tone="primary">Error 404</Badge>
      <h1 className="font-heading text-32 font-black leading-native text-white md:text-40 xl:text-48">
        Page not found
      </h1>
      <p className="max-w-[560px] font-sans text-16 leading-body text-muted">
        The page you are looking for doesn&apos;t exist or has been moved. Explore our training
        programs or head back to the home page.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Button href={routes.courses}>Explore Courses</Button>
        <Button href={routes.home} variant="outline">
          Back to Home
        </Button>
      </div>
    </Section>
  );
}
