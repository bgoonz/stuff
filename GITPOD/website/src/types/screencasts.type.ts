type RelatedDocs = {
  path: string;
  title: string;
};

export type Screencast = {
  description: string;
  duration: number;
  nextScreencast?: number;
  relatedDocs: RelatedDocs[];
  tile: string;
  title: string;
  youtubeId: string;
};
