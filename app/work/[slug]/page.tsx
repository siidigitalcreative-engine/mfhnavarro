import Link from "next/link";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/content";
import type { WorkLayer } from "@/lib/types";
import VideoWithFirstFrame from "@/components/VideoWithFirstFrame";

function Layer({
  layer,
  projectName,
  gap,
  isFirst = false,
  isLast = false,
  grouped = false,
}: {
  layer: WorkLayer;
  projectName: string;
  gap: "none" | "small" | "large";
  isFirst?: boolean;
  isLast?: boolean;
  grouped?: boolean;
}) {
  if (layer.type === "text") {
    return (
      <section className="landing-text-divider">
        <div className="landing-text-divider-inner">
          <span className="landing-divider-mark">/</span>
          <h2>{layer.text || ""}</h2>
        </div>
      </section>
    );
  }

  if (!layer.url) return null;

  const marginBottom = grouped
    ? 0
    : gap === "none"
      ? 0
      : gap === "large"
        ? 64
        : 48;

  return (
    <section
      className={[
        "landing-media-layer",
        `landing-${layer.type}`,
        grouped ? "landing-media-group-item" : "",
        gap === "none" ? "landing-media-unified-item" : "",
        gap === "none" && isFirst ? "landing-media-first" : "",
        gap === "none" && isLast ? "landing-media-last" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ marginBottom }}
    >
      {layer.type === "video" ? (
        <VideoWithFirstFrame
          src={layer.url}
          poster={layer.thumbnailUrl}
          label={projectName}
        />
      ) : (
        <img
          src={layer.url}
          alt={layer.name || projectName}
        />
      )}
    </section>
  );
}

function MediaGroup({
  layers,
  projectName,
  gap,
}: {
  layers: WorkLayer[];
  projectName: string;
  gap: "none" | "small" | "large";
}) {
  const isUnified = gap === "none";
  const groupClass = [
    isUnified ? "landing-media-unified" : "landing-media-group",
    !isUnified ? `landing-media-group-${gap}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const rows: WorkLayer[][] = [];

  let index = 0;

  while (index < layers.length) {
    const current = layers[index];
    const next = layers[index + 1];

    if (
      current.layout === "two" &&
      next &&
      next.layout === "two"
    ) {
      rows.push([current, next]);
      index += 2;
    } else {
      rows.push([current]);
      index += 1;
    }
  }

  return (
    <div className={groupClass}>
      {rows.map((row, rowIndex) => {
        const isTwoColumnRow = row.length === 2;

        if (isTwoColumnRow) {
          return (
            <div
              className="landing-media-grid-row"
              key={`${row[0].id}-${row[1].id}`}
            >
              {row.map((layer) => (
                <Layer
                  key={layer.id}
                  layer={layer}
                  projectName={projectName}
                  gap={gap}
                  grouped
                  isFirst={isUnified && rowIndex === 0}
                  isLast={
                    isUnified &&
                    rowIndex === rows.length - 1
                  }
                />
              ))}
            </div>
          );
        }

        const layer = row[0];

        return (
          <Layer
            key={layer.id}
            layer={layer}
            projectName={projectName}
            gap={gap}
            grouped
            isFirst={isUnified && rowIndex === 0}
            isLast={
              isUnified &&
              rowIndex === rows.length - 1
            }
          />
        );
      })}
    </div>
  );
}

function RenderLayers({
  layers,
  projectName,
  gap,
}: {
  layers: WorkLayer[];
  projectName: string;
  gap: "none" | "small" | "large";
}) {
  const sections: Array<
    | { type: "media"; layers: WorkLayer[] }
    | { type: "text"; layer: WorkLayer }
  > = [];

  let mediaGroup: WorkLayer[] = [];

  for (const layer of layers) {
    const isMedia =
      layer.type === "image" || layer.type === "video";

    if (isMedia) {
      mediaGroup.push(layer);
      continue;
    }

    if (mediaGroup.length) {
      sections.push({
        type: "media",
        layers: mediaGroup,
      });
      mediaGroup = [];
    }

    sections.push({
      type: "text",
      layer,
    });
  }

  if (mediaGroup.length) {
    sections.push({
      type: "media",
      layers: mediaGroup,
    });
  }

  return (
    <>
      {sections.map((section, index) => {
        if (section.type === "text") {
          return (
            <Layer
              key={section.layer.id}
              layer={section.layer}
              projectName={projectName}
              gap={gap}
            />
          );
        }

        return (
          <MediaGroup
            key={`media-group-${index}-${section.layers[0]?.id ?? index}`}
            layers={section.layers}
            projectName={projectName}
            gap={gap}
          />
        );
      })}
    </>
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
        layout: "full",
      }));

  const gap = project.layerGap ?? "small";

  return (
    <main className="landing-page">
      <header className="landing-nav">
        <div className="wrap landing-nav-inner">
          <Link className="mark nav-brand landing-nav-brand" href="/">
            {content.identity?.showLogo && content.identity.logoUrl ? (
              <img
                className="nav-logo"
                src={content.identity.logoUrl}
                alt=""
              />
            ) : null}
            <span>MF / NAVARRO</span>
          </Link>

          <Link className="landing-back" href="/#work">
            Back to work ↗
          </Link>
        </div>
      </header>

      <section className="landing-intro wrap">
        <div className="eyebrow">
          {project.tag || "SELECTED WORK"}
        </div>

        <div className="landing-intro-grid">
          <div>
            <div className="landing-number">
              {String(
                content.work.findIndex(
                  (item) => item.id === project.id
                ) + 1
              ).padStart(2, "0")}
            </div>

            <h1>{project.name}</h1>
          </div>

          <p>{project.desc}</p>
        </div>
      </section>

      <div className="landing-layers-public">
        {layers.length ? (
          <RenderLayers
            layers={layers}
            projectName={project.name}
            gap={gap}
          />
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
