import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  id: string;
  image_url: string;
}

interface HeroCarouselProps {
  slides: Slide[];
  totalRuns: number | undefined;
}

const AUTOPLAY_MS = 7000;

const microLabels = [
  "SERTIFISERT OPPLÆRING",
  "DOKUMENTERT OPPLÆRING",
  "TEGNSPRÅK TILGJENGELIG",
  "INDUSTRIKOMPETANSE",
];

export default function HeroCarousel({ slides, totalRuns }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const progressRef = useRef<ReturnType<typeof setInterval>>();

  const count = slides.length;

  const goTo = useCallback(
    (idx: number) => {
      setCurrent(((idx % count) + count) % count);
      setProgress(0);
    },
    [count]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Autoplay
  useEffect(() => {
    if (paused || count <= 1) return;
    timerRef.current = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(timerRef.current);
  }, [next, paused, count]);

  // Progress bar
  useEffect(() => {
    if (paused || count <= 1) {
      setProgress(0);
      return;
    }
    const step = 50; // ms
    setProgress(0);
    progressRef.current = setInterval(() => {
      setProgress((p) => Math.min(p + (step / AUTOPLAY_MS) * 100, 100));
    }, step);
    return () => clearInterval(progressRef.current);
  }, [current, paused, count]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next]);

  if (!slides[current]) return null;

  const microLabel = microLabels[current % microLabels.length];

  return (
    <section
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[60vh] lg:min-h-[80vh]">
        {/* LEFT: Text column – solid background, no image behind */}
        <div className="relative z-10 bg-background flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-20 py-16 lg:py-24">
          <div className="max-w-[540px]">
            {/* Micro label */}
            <p className="text-primary text-xs uppercase tracking-[0.3em] font-semibold mb-5">
              {microLabel}
            </p>

            {/* Title */}
            <h1
              className="font-bold leading-[0.92] mb-4"
              style={{
                fontFamily: "Oswald, sans-serif",
                fontSize: "clamp(36px, 4.5vw, 72px)",
              }}
            >
              Kurs som gir<br />kompetanse
            </h1>

            {/* Yellow accent line */}
            <div className="h-[3px] w-20 bg-primary mb-6" />

            {/* Subtitle */}
            <p className="text-muted-foreground text-lg sm:text-xl max-w-md mb-10 leading-relaxed">
              Sertifisert og dokumentert opplæring – på norsk, engelsk og tegnspråk.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Button asChild size="lg" className="h-14 px-10 text-base">
                <Link to="/kurs">Se kurs</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-10 text-base">
                <Link to="/foresporsel">Send forespørsel</Link>
              </Button>
            </div>

            {/* Slide indicators – inside text column */}
            {count > 1 && (
              <div className="flex gap-1.5 items-center">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`h-1 transition-all duration-300 ${
                      i === current ? "w-10 bg-primary" : "w-5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Image column – full bleed image */}
        <div className="relative min-h-[40vh] lg:min-h-0 lg:col-span-2">
          {slides.map((s, i) => (
            <div
              key={s.id}
              className="absolute inset-0 transition-opacity duration-700 ease-in-out"
              style={{
                opacity: i === current ? 1 : 0,
                zIndex: i === current ? 1 : 0,
              }}
            >
              <img
                src={s.image_url}
                alt=""
                className="w-full h-full object-cover"
                style={{ objectPosition: "center 20%" }}
              />
            </div>
          ))}

          {/* Subtle left edge blend on desktop */}
          <div className="hidden lg:block absolute inset-y-0 left-0 w-16 z-[2]" />

          {/* Bottom gradient on mobile for text readability */}
          <div className="lg:hidden absolute inset-x-0 bottom-0 h-16 z-[2]" style={{
            background: "linear-gradient(to top, hsl(var(--background)), transparent)",
          }} />

          {/* Facts plate – bottom right on desktop */}
          <div className="absolute bottom-0 left-0 right-0 z-10 hidden lg:block">
            <div className="bg-primary text-primary-foreground px-8 py-6 flex justify-around">
              {[
                { num: "2006", label: "Etablert" },
                { num: totalRuns ?? "—", label: "Gjennomføringer" },
                { num: "3", label: "Språk" },
                { num: "98%", label: "Bestått" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold" style={{ fontFamily: "Oswald, sans-serif" }}>
                    {stat.num}
                  </div>
                  <div className="text-xs uppercase tracking-wider opacity-80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation arrows – on the image */}
          {count > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 border border-white/30 bg-background/40 backdrop-blur-sm flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Forrige slide"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 border border-white/30 bg-background/40 backdrop-blur-sm flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Neste slide"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progress bar – full width bottom */}
      {count > 1 && (
        <div className="h-[2px] bg-border/20">
          <div
            className="h-full bg-primary transition-[width] duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </section>
  );
}
