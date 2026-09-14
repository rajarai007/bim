import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { careerJourney } from "@/data/site";

export function CareerJourney() {
  return (
    <Section containerClassName="flex flex-col gap-10 xl:gap-12">
      <SectionHeading
        badge="Strategic Workflow Roadmap"
        badgeTone="primary"
        title="Launch Your Career in BIM & Design"
        align="center"
      />
      <ol data-reveal-stagger="up" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {careerJourney.map((step) => (
          <li
            key={step.step}
            data-spotlight
            className="card-lift group flex h-full flex-col items-start gap-4 rounded-md bg-surface p-8"
          >
            <span className="origin-left font-heading text-28 font-black leading-native text-primary transition-[scale,color] duration-400 ease-brand group-hover:scale-125 group-hover:text-accent">
              {step.step}
            </span>
            <h3 className="font-heading text-18 font-extrabold leading-native text-heading">
              {step.title}
            </h3>
            <p className="font-sans text-13 leading-normal text-muted">{step.description}</p>
          </li>
        ))}
      </ol>
      <p data-reveal="up" className="w-full rounded-md border border-line bg-surface-translucent p-5 text-center font-sans text-13 leading-native text-muted">
        💡 <strong className="font-bold text-heading">Please Note:</strong> We focus purely on
        engineering excellence, hands-on modeling skills, and realistic capability building. We do
        not provide hollow placement guarantees, but rather equip you to clear strict design-testing
        rounds.
      </p>
    </Section>
  );
}
