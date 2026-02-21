import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  id: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  cta_primary_label: string | null;
  cta_primary_href: string | null;
  cta_secondary_label: string | null;
  cta_secondary_href: string | null;
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

  const slide = slides[current];
  if (!slide) return null;

  const microLabel = microLabels[current % microLabels.length];

  return (
    <section
      className="relative min-h-[50vh] lg:min-h-[70vh] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background images – all preloaded, only active visible */}
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
            alt={s.title || ""}
            className="w-full h-full object-cover"
            style={{ objectPosition: "50% 15%" }}
          />
        </div>
      ))}

      {/* Overlays – hard industrial gradient */}
      <div className="absolute inset-0 z-[2]" style={{
        background: "linear-gradient(to right, hsl(var(--background)) 0%, hsl(var(--background) / 0.85) 35%, hsl(var(--background) / 0.4) 65%, transparent 100%)",
      }} />
      <div className="absolute inset-0 z-[2]" style={{
        background: "linear-gradient(to top, hsl(var(--background)) 0%, transparent 40%)",
      }} />

      {/* Content */}
      <div className="relative z-10 h-full min-h-[50vh] lg:min-h-[70vh] flex items-end">
        <div className="w-full px-6 sm:px-12 lg:px-20 pb-16 lg:pb-20 pt-32">
          <div className="max-w-[720px]">
            {/* Micro label */}
            <p className="text-primary text-xs uppercase tracking-[0.3em] font-semibold mb-4">
              {microLabel}
            </p>

            {/* Title */}
            {slide.title && (
              <h1
                className="font-bold leading-[0.92] mb-3"
                style={{
                  fontFamily: "Oswald, sans-serif",
                  fontSize: "clamp(40px, 5vw, 80px)",
                }}
              >
                {slide.title}
              </h1>
            )}

            {/* Yellow accent line */}
            <div className="h-[3px] w-20 bg-primary mb-5" />

            {/* Subtitle */}
            {slide.subtitle && (
              <p className="text-muted-foreground text-lg sm:text-xl max-w-lg mb-8 leading-relaxed">
                {slide.subtitle}
              </p>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              {slide.cta_primary_label && slide.cta_primary_href && (
                <Button asChild size="lg" className="h-14 px-10 text-base">
                  <Link to={slide.cta_primary_href}>{slide.cta_primary_label}</Link>
                </Button>
              )}
              {slide.cta_secondary_label && slide.cta_secondary_href && (
                <Button asChild size="lg" variant="outline" className="h-14 px-10 text-base">
                  <Link to={slide.cta_secondary_href}>{slide.cta_secondary_label}</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Facts plate – bottom right */}
      <div className="absolute bottom-0 right-0 z-10 hidden lg:block">
        <div className="bg-primary text-primary-foreground px-8 py-5 flex gap-8">
          {[
            { num: "2006", label: "Siden" },
            { num: totalRuns ?? "—", label: "Gjennomf." },
            { num: "3", label: "Språk" },
            { num: "98%", label: "Bestått" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-xl font-bold" style={{ fontFamily: "Oswald, sans-serif" }}>
                {stat.num}
              </div>
              <div className="text-[10px] uppercase tracking-wider opacity-80">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows – square, industrial */}
      {count > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 border border-primary/50 bg-background/40 backdrop-blur-sm flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
            aria-label="Forrige slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 border border-primary/50 bg-background/40 backdrop-blur-sm flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
            aria-label="Neste slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Progress bar + indicators – bottom */}
      {count > 1 && (
        <div className="absolute bottom-0 left-0 right-0 lg:right-auto lg:max-w-[50%] z-10">
          {/* Slide indicators */}
          <div className="flex gap-1 px-6 sm:px-12 lg:px-20 mb-2">
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
          {/* Progress line */}
          <div className="h-[2px] bg-border/20">
            <div
              className="h-full bg-primary transition-[width] duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
