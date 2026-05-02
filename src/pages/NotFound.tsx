import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Seo from "@/components/Seo";

export default function NotFound() {
  const location = useLocation();

  if (import.meta.env.DEV) {
    // Only log in development; production should not surface this in console.
    // eslint-disable-next-line no-console
    console.warn("404 – ukjent rute:", location.pathname);
  }

  return (
    <>
      <Seo
        title="Siden finnes ikke"
        description="Denne siden finnes ikke. Gå tilbake til forsiden eller se kursoversikten."
      />
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-20">
        <div className="text-center max-w-md">
          <p className="text-primary text-sm uppercase tracking-[0.3em] font-semibold mb-4">404</p>
          <h1
            className="text-4xl sm:text-5xl font-bold mb-4"
            style={{ fontFamily: "Oswald, sans-serif" }}
          >
            Siden finnes ikke
          </h1>
          <p className="text-muted-foreground mb-8">
            Lenken kan være utdatert, eller siden er flyttet. Prøv å gå tilbake til forsiden eller se kursoversikten.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link to="/">Til forsiden</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/kurs">Se kurs</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
