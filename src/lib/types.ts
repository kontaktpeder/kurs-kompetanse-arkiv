export interface MediaItem {
  type: "image" | "video";
  url: string;
  alt?: string;
}

export const courseTypeLabels: Record<string, string> = {
  certified: "Sertifisert",
  documented: "Dokumentert",
  other: "Annet",
};

export const languageLabels: Record<string, string> = {
  no: "Norsk",
  en: "Engelsk",
  sign: "Tegnspråk",
};

export const leadStatusLabels: Record<string, string> = {
  new: "Ny",
  contacted: "Kontaktet",
  offered: "Tilbudt",
  booked: "Booket",
  done: "Ferdig",
  lost: "Tapt",
};
