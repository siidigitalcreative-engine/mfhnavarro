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
}: {
  layer: WorkLayer;
  projectName: string;
  gap: "none" | "small" | "large";
  isFirst?: boolean;
  isLast?: boolean;
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

  const marginBottom = gap === "none" ? 0 : gap === "large" ? 64 : 48;

  return (
    <section
      className={[
        "landing-media-layer",
        `landing-${layer.type}`,
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

  const layers = project.layers?.length
    ? project.layers
    : (project.media ?? []).map((media) => ({
        id: media.id,
        type: media.type,
        url: media.url,
        name: media.name,
      }));

  return (
    <main className="landing-page">
      <header className="landing-nav">
        <div className="wrap landing-nav-inner">
          <Link className="mark" href="/">
            MF / NAVARRO
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
          project.layerGap === "none" ? (
            <div className="landing-media-unified">
              {layers.map((layer, index) => {
                const isMedia =
                  layer.type === "image" ||
                  layer.type === "video";

                const previousIsMedia =
                  index > 0 &&
                  (layers[index - 1].type === "image" ||
                    layers[index - 1].type === "video");

                const nextIsMedia =
                  index < layers.length - 1 &&
                  (layers[index + 1].type === "image" ||
                    layers[index + 1].type === "video");

                return (
                  <Layer
                    key={layer.id}
                    layer={layer}
                    projectName={project.name}
                    gap="none"
                    isFirst={isMedia && !previousIsMedia}
                    isLast={isMedia && !nextIsMedia}
                  />
                );
              })}
            </div>
          ) : (
            layers.map((layer) => (
              <Layer
                key={layer.id}
                layer={layer}
                projectName={project.name}
                gap={project.layerGap ?? "small"}
              />
            ))
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
