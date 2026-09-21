import Image from "next/image";
import { Eye, Target } from "lucide-react";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";

export function IntroSection() {
  return (
    <Section padding="lg" containerClassName="flex flex-col gap-12 xl:gap-16">
      <div className="flex flex-col items-center gap-10 lg:flex-row lg:gap-12">
        <div data-reveal-stagger="up" className="flex w-full min-w-0 flex-col items-start gap-6 lg:flex-1">
          <Badge>Our Identity</Badge>
          <h2 className="font-heading text-28 font-extrabold leading-native text-heading md:text-32 xl:text-36">
            World-Class Practical Training for Next-Gen Engineers
          </h2>
          <p className="font-sans text-16 leading-body text-muted">
            Founded to fill the extensive skill gaps present in standard technical education, BIM
            Career Academy stands as a highly practical training environment. Our labs are run
            modeled on modern, process-oriented architectural engineering consulting chambers.
          </p>
        </div>
        <div data-reveal="clip" data-reveal-delay="2" className="group relative h-[220px] w-full shrink-0 overflow-hidden rounded-md shadow-[var(--shadow-sheet-lifted)] sm:h-[300px] lg:flex-1">
          <Image
            src="/images/about-intro.png"
            alt="Engineer in a hard hat reviewing a BIM model on dual monitors"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-brand group-hover:scale-[1.04]"
          />
          <div aria-hidden className="viewer-frame pointer-events-none absolute inset-0 rounded-[inherit]" />
        </div>
      </div>

      <div data-reveal-stagger="up" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8 [--stagger-step:150ms]">
        <article data-spotlight="accent" data-tilt className="card-lift group flex flex-col items-start gap-5 rounded-md bg-surface p-8 md:p-10">
          <span className="flex size-10 items-center justify-center rounded-md bg-accent-soft text-accent transition-[scale,rotate] duration-400 ease-brand group-hover:-rotate-6 group-hover:scale-110">
            <Eye className="size-5" aria-hidden />
          </span>
          <h3 className="font-heading text-24 font-extrabold leading-native text-heading">Our Vision</h3>
          <p className="font-sans text-15 leading-body text-muted">
            To be India&apos;s leading BIM &amp; design technology training institute, empowering
            professionals with cutting-edge skills and engineering confidence.
          </p>
        </article>
        <article data-spotlight data-tilt className="card-lift group flex flex-col items-start gap-5 rounded-md bg-surface p-8 md:p-10">
          <span className="flex size-10 items-center justify-center rounded-md bg-primary-soft text-primary transition-[scale,rotate] duration-400 ease-brand group-hover:-rotate-6 group-hover:scale-110">
            <Target className="size-5" aria-hidden />
          </span>
          <h3 className="font-heading text-24 font-extrabold leading-native text-heading">Our Mission</h3>
          <p className="font-sans text-15 leading-body text-muted">
            To deliver practical, project-based training that bridges the gap between conceptual
            education and industry execution.
          </p>
        </article>
      </div>
    </Section>
  );
}
