import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, Target, Users, ArrowRight, Phone } from "lucide-react";
import gokartImg from "@/assets/event-gokart.png";
import paintballImg from "@/assets/event-paintball.png";

export default function EventTeambuilding() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Event og teambuilding i Kragerø | Kurs + opplevelser";
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement("meta");
      m.setAttribute("name", "description");
      document.head.appendChild(m);
      return m;
    })();
    const prevDesc = meta.getAttribute("content");
    meta.setAttribute(
      "content",
      "Kombiner kurs med gokart, paintball og teambuilding. Perfekt for bedrifter, grupper og firmadager i Kragerø."
    );
    return () => {
      document.title = prevTitle;
      if (prevDesc !== null) meta.setAttribute("content", prevDesc);
    };
  }, []);

  const activities = [
    { icon: Zap, title: "Gokart", desc: "Fart, konkurranse og moro." },
    { icon: Target, title: "Paintball", desc: "Action og samarbeid i praksis." },
    { icon: Users, title: "Firmadag / Teambuilding", desc: "Skreddersydd opplegg for grupper." },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-3 border-b border-border">
        <div className="lg:col-span-1 bg-background flex items-center px-6 sm:px-10 lg:px-12 py-16 lg:py-24">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary mb-6 font-semibold">
              Event &amp; Teambuilding
            </p>
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] mb-8 uppercase"
              style={{ fontFamily: "Oswald, sans-serif" }}
            >
              Kurs + opplevelser for bedrifter
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Kombiner kurs, faglig påfyll og sosiale aktiviteter. Sammen med{" "}
              <a
                href="https://www.kragero-actionpark.no"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4 hover:no-underline"
              >
                Kragerø Action Park
              </a>{" "}
              kan vi tilby opplegg for bedrifter, team og grupper.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/foresporsel">
                  Ta kontakt <ArrowRight className="ml-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="tel:+4795044749">
                  <Phone className="mr-1" /> Ring Lars Børre
                </a>
              </Button>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 grid grid-cols-2 min-h-[320px] lg:min-h-[640px]">
          <img src={gokartImg} alt="Gokart i Kragerø" className="w-full h-full object-cover" />
          <img src={paintballImg} alt="Paintball i Kragerø" className="w-full h-full object-cover" />
        </div>
      </section>

      {/* Activities */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-4xl sm:text-5xl font-bold uppercase mb-12"
            style={{ fontFamily: "Oswald, sans-serif" }}
          >
            Aktiviteter
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-border">
            {activities.map((a, i) => (
              <div
                key={a.title}
                className={`p-8 lg:p-10 bg-secondary ${
                  i < activities.length - 1 ? "md:border-r border-border" : ""
                } ${i < activities.length - 1 ? "border-b md:border-b-0 border-border" : ""}`}
              >
                <a.icon className="h-10 w-10 text-primary mb-6" strokeWidth={1.5} />
                <h3
                  className="text-2xl font-bold uppercase mb-3"
                  style={{ fontFamily: "Oswald, sans-serif" }}
                >
                  {a.title}
                </h3>
                <p className="text-muted-foreground">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-bold uppercase mb-6"
            style={{ fontFamily: "Oswald, sans-serif" }}
          >
            Ønsker du et opplegg for din bedrift?
          </h2>
          <p className="text-lg mb-10 opacity-90 max-w-2xl mx-auto">
            Ta kontakt med oss for en prat om kurs, aktiviteter og firmadag.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Link to="/foresporsel">
                Ta kontakt <ArrowRight className="ml-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <a href="tel:+4795044749">
                <Phone className="mr-1" /> Ring Lars Børre
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
