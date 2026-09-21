import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { careerJourney } from "@/data/site";

export function CareerJourney() {
  return (
    <Section rise containerClassName="flex flex-col gap-10 xl:gap-12">
      <SectionHeading
        badge="Strategic Workflow Roadmap"
        badgeTone="primary"
        title="Launch Your Career in BIM & Design"
        align="center"
      />
      <div className="relative">
        {/* Process line behind the steps (desktop), drawn in as the row reveals. */}
        <div aria-hidden data-reveal="fade" className="draw-in pointer-events-none absolute inset-x-8 top-12 hidden lg:block">
          <div className="dim-line" />
        </div>
      <ol data-reveal-stagger="up" className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {careerJourney.map((step) => (
          <li
            key={step.step}
            data-spotlight
            data-tilt
            className="card-lift group flex h-full flex-col items-start gap-4 rounded-md bg-surface p-8"
          >
            <span className="relative flex size-12 items-center justify-center rounded-full bg-primary-soft font-heading text-20 font-black leading-native text-primary shadow-[0_0_0_6px_rgb(255_90_31/0.06)] transition-[scale,color,background-color,box-shadow] duration-400 ease-brand group-hover:scale-110 group-hover:bg-accent-soft group-hover:text-accent group-hover:shadow-[0_0_0_8px_var(--color-accent-soft)]">
              {step.step}
            </span>
            <h3 className="font-heading text-18 font-extrabold leading-native text-heading">
              {step.title}
            </h3>
            <p className="font-sans text-13 leading-normal text-muted">{step.description}</p>
          </li>
        ))}
      </ol>
      </div>
      <p data-reveal="up" className="w-full rounded-md border border-line bg-surface-translucent p-5 text-center font-sans text-13 leading-native text-muted">
        💡 <strong className="font-bold text-heading">Please Note:</strong> We focus purely on
        engineering excellence, hands-on modeling skills, and realistic capability building. We do
        not provide hollow placement guarantees, but rather equip you to clear strict design-testing
        rounds.
      </p>
    </Section>
  );
}
