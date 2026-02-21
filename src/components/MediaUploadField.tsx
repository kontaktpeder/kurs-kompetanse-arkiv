import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, X, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MediaUploadFieldProps {
  label: string;
  helperText?: string;
  value: string | null;
  onChange: (url: string | null) => void;
  folder: string;
  filePrefix: string;
  disabled?: boolean;
}

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export default function MediaUploadField({
  label,
  helperText,
  value,
  onChange,
  folder,
  filePrefix,
  disabled = false,
}: MediaUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE) {
      toast.error("Filen er for stor (maks 10 MB)");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Kun bildefiler er tillatt");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${folder}/${filePrefix}-${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("media")
        .upload(path, file, { upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("media")
        .getPublicUrl(path);

      onChange(urlData.publicUrl);
      toast.success("Bilde lastet opp");
    } catch (err: any) {
      toast.error(err.message || "Opplasting feilet");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <div>
      <label className="text-sm font-medium mb-1 block">{label}</label>
      {helperText && (
        <p className="text-xs text-muted-foreground mb-2">{helperText}</p>
      )}

      {disabled ? (
        <p className="text-xs text-muted-foreground bg-secondary p-3 border border-border">
          Lagre kurset først for å laste opp bilder.
        </p>
      ) : value ? (
        <div className="relative border border-primary/30 bg-card overflow-hidden">
          <img
            src={value}
            alt={label}
            className="w-full h-40 object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="h-7 w-7"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-7 w-7"
              onClick={handleRemove}
              disabled={uploading}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-32 border border-dashed border-border bg-secondary/50 hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground cursor-pointer disabled:cursor-wait"
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : (
            <>
              <Upload className="h-5 w-5" />
              <span className="text-xs">Klikk for å laste opp bilde</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
        disabled={uploading || disabled}
      />
    </div>
  );
}
