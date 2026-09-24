import Link from "next/link";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/content";
import type { WorkLayer } from "@/lib/types";
import VideoWithFirstFrame from "@/components/VideoWithFirstFrame";

type MediaLayout = "full" | "two";

function MediaLayer({
  layer,
  projectName,
  unified = false,
}: {
  layer: WorkLayer;
  projectName: string;
  unified?: boolean;
}) {
  if (!layer.url) return null;

  return (
    <section
      className={[
        "landing-media-layer",
        `landing-${layer.type}`,
        unified ? "landing-media-unified-item" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {layer.type === "video" ? (
        <VideoWithFirstFrame
          src={layer.url}
          poster={layer.thumbnailUrl}
          label={projectName}
        />
      ) : (
        <img src={layer.url} alt={layer.name || projectName} />
      )}
    </section>
  );
}

function TextLayer({ layer }: { layer: WorkLayer }) {
  return (
    <section className="landing-text-divider">
      <div className="landing-text-divider-inner">
        <span className="landing-divider-mark">/</span>
        <h2>{layer.text || ""}</h2>
      </div>
    </section>
  );
}

function MediaRows({
  layers,
  projectName,
  gap,
  unified,
}: {
  layers: WorkLayer[];
  projectName: string;
  gap: "none" | "small" | "large";
  unified: boolean;
}) {
  const rows: React.ReactNode[] = [];
  let index = 0;

  while (index < layers.length) {
    const layer = layers[index];
    const layout: MediaLayout = layer.layout ?? "full";

    if (layout === "two") {
      const next = layers[index + 1];
      if (next && (next.layout ?? "full") === "two") {
        rows.push(
          <div
            className={[
              "landing-media-grid",
              unified ? "landing-media-unified-grid" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            key={`${layer.id}-${next.id}`}
          >
            <MediaLayer layer={layer} projectName={projectName} unified={unified} />
            <MediaLayer layer={next} projectName={projectName} unified={unified} />
          </div>
        );
        index += 2;
        continue;
      }

      rows.push(
        <div
          className={[
            "landing-media-grid",
            "landing-media-grid-single",
            unified ? "landing-media-unified-grid" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          key={layer.id}
        >
          <MediaLayer layer={layer} projectName={projectName} unified={unified} />
        </div>
      );
      index += 1;
      continue;
    }

    rows.push(
      <MediaLayer
        key={layer.id}
        layer={layer}
        projectName={projectName}
        unified={unified}
      />
    );
    index += 1;
  }

  return rows;
}

function MediaSection({
  layers,
  projectName,
  gap,
}: {
  layers: WorkLayer[];
  projectName: string;
  gap: "none" | "small" | "large";
}) {
  const unified = gap === "none";
  const gapClass = `landing-gap-${gap}`;

  return (
    <div
      className={[
        "landing-media-section",
        gapClass,
        unified ? "landing-media-unified" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="landing-media-section-inner">
        <div className="landing-media-rows">
          {MediaRows({ layers, projectName, gap, unified })}
        </div>
      </div>
    </div>
  );
}

export default async function WorkLandingPage({
  params,
}: {
  params: { slug: string };
}) {
  const content = await getContent();
  const project = content.work.find(
    (item) =>
      (item.slug || item.id) === params.slug ||
      item.id === params.slug
  );

  if (!project) notFound();

  const layers: WorkLayer[] = project.layers?.length
    ? project.layers
    : (project.media ?? []).map((media) => ({
        id: media.id,
        type: media.type,
        url: media.url,
        name: media.name,
        layout: "full" as const,
      }));

  const gap = project.layerGap ?? "small";
  const contentGroups: Array<{ type: "media" | "text"; layers: WorkLayer[] }> = [];

  for (const layer of layers) {
    const isMedia = layer.type === "image" || layer.type === "video";
    if (isMedia) {
      const last = contentGroups[contentGroups.length - 1];
      if (last?.type === "media") last.layers.push(layer);
      else contentGroups.push({ type: "media", layers: [layer] });
    } else {
      contentGroups.push({ type: "text", layers: [layer] });
    }
  }

  return (
    <main className="landing-page">
      <header className="landing-nav">
        <div className="wrap landing-nav-inner">
          <Link className="mark" href="/">MF / NAVARRO</Link>
          <Link className="landing-back" href="/#work">Back to work ↗</Link>
        </div>
      </header>

      <section className="landing-intro wrap">
        <div className="eyebrow">{project.tag || "SELECTED WORK"}</div>
        <div className="landing-intro-grid">
          <div>
            <div className="landing-number">
              {String(
                content.work.findIndex((item) => item.id === project.id) + 1
              ).padStart(2, "0")}
            </div>
            <h1>{project.name}</h1>
          </div>
          <p>{project.desc}</p>
        </div>
      </section>

      <div className="landing-layers-public">
        {layers.length ? (
          contentGroups.map((group, groupIndex) =>
            group.type === "text" ? (
              <TextLayer key={`text-${group.layers[0].id}`} layer={group.layers[0]} />
            ) : (
              <MediaSection
                key={`media-${groupIndex}-${group.layers[0].id}`}
                layers={group.layers}
                projectName={project.name}
                gap={gap}
              />
            )
          )
        ) : (
          <section className="landing-empty wrap">
            This project does not have a custom page yet.
          </section>
        )}
      </div>

      <footer className="landing-footer wrap">
        <Link href="/#work">← Selected work</Link>
        <span>{project.name}</span>
      </footer>
    </main>
  );
}
