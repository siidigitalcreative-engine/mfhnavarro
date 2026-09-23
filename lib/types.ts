export type MediaItem = {
  id: string;
  url: string;
  type: "image" | "video";
  name?: string;
};

export type WorkLayer = {
  id: string;
  type: "image" | "video" | "text";
  url?: string;
  text?: string;
  name?: string;
  thumbnailUrl?: string;
};

export type WorkItem = {
  id: string;
  name: string;
  desc: string;
  tag: string;
  slug?: string;
  media?: MediaItem[];
  layers?: WorkLayer[];
  layerGap?: "none" | "small" | "large";
  mediaUrl?: string;
  mediaType?: "image" | "video";
};

export type Testimonial = {
  id: string;
  quote: string;
  who: string;
};

export type ClientItem = {
  id: string;
  name: string;
  logoUrl?: string;
};

export type SiteContent = {
  heroHeadline: string;
  heroLede: string;
  nowNote: string;
  tools: string[];
  work: WorkItem[];
  testimonials: Testimonial[];
  clients: ClientItem[];
  aboutParagraphs: string[];
  email: string;
};

export const DEFAULT_CONTENT: SiteContent = {
  heroHeadline: "Ideas, shaped into work people remember.",
  heroLede:
    "I'm MF Navarro, a Digital Creative Manager leading multimedia design across brand, campaign, and product, from first concept to final cut.",
  nowNote:
    "Now: leading a brand refresh and launch campaign for a retail client, based in London.",
  tools: ["Adobe CC", "Figma", "After Effects", "Premiere Pro", "Webflow"],
  work: [
    {
      id: "w1",
      name: "Ledgerline Rebrand",
      desc: "Full brand identity and motion system for a fintech relaunch.",
      tag: "Brand · Motion",
      slug: "ledgerline-rebrand",
      layers: [],
    },
    {
      id: "w2",
      name: "Ferry & Co. Campaign",
      desc: "Multi-channel launch campaign, from concept through delivery.",
      tag: "Campaign · Art Direction",
      slug: "ferry-co-campaign",
      layers: [],
    },
    {
      id: "w3",
      name: "Northbound Content Hub",
      desc: "Ongoing video and social content system for a logistics brand.",
      tag: "Video · Content Strategy",
      slug: "northbound-content-hub",
      layers: [],
    },
  ],
  testimonials: [
    {
      id: "t1",
      quote:
        "MF's creative direction is consistently sharp. She's become one of the people we rely on most, and we look forward to working together again.",
      who: "Matt Bland — Managing Director, Ragged Edge",
    },
    {
      id: "t2",
      quote:
        "Organized, communicative, and always pushing the work further — the kind of creative lead who raises the whole team's standard.",
      who: "Sarah Yoon — Product Lead, Northbound",
    },
  ],
  clients: [
    { id: "c1", name: "Ragged Edge" },
    { id: "c2", name: "Ditta" },
    { id: "c3", name: "Foolproof" },
    { id: "c4", name: "Greggs" },
    { id: "c5", name: "Northbound" },
    { id: "c6", name: "Ferry & Co." },
  ],
  aboutParagraphs: [
    "I started as a Multimedia Designer and now work as a Digital Creative Manager, leading design and content across brand, campaign, and video for clients between London and remote teams. I care most about the parts of creative work that don't show up in a single frame: the strategy behind it, how it holds up across channels, and how easy it is for a team to carry forward.",
    "Outside client work, I mentor junior designers and keep a running archive of visual references, one scoped project at a time.",
  ],
  email: "hello@mfnavarro.dev",
};
