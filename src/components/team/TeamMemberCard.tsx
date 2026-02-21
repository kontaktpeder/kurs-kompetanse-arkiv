import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";

interface TeamMemberCardProps {
  name: string;
  title?: string | null;
  bio?: string | null;
  skills?: string[];
  photo_url?: string | null;
}

export default function TeamMemberCard({ name, title, bio, skills, photo_url }: TeamMemberCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[4/3] bg-muted flex items-center justify-center overflow-hidden">
        {photo_url ? (
          <img src={photo_url} alt={name} className="w-full h-full object-cover" />
        ) : (
          <User className="h-16 w-16 text-muted-foreground/40" />
        )}
      </div>
      <CardContent className="p-5 space-y-2">
        <h3 className="text-lg font-semibold !normal-case !tracking-normal" style={{ fontFamily: 'Inter Tight, sans-serif' }}>
          {name}
        </h3>
        {title && (
          <p className="text-sm text-primary font-medium !normal-case !tracking-normal" style={{ fontFamily: 'Inter Tight, sans-serif' }}>
            {title}
          </p>
        )}
        {bio && (
          <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
        )}
        {skills && skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs font-normal">
                {skill}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
