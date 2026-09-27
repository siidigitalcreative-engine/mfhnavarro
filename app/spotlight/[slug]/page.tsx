import Link from "next/link";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/content";
import type { CreativeSpotlight } from "@/lib/types";
import ImageLightbox from "@/components/ImageLightbox";
import VideoWithFirstFrame from "@/components/VideoWithFirstFrame";

function SpotlightMedia({ spotlight, item }: { spotlight: CreativeSpotlight; item: CreativeSpotlight["media"][number] }) {
  if (item.type === "video") {
    return (
      <div className="spotlight-page-media-card">
        <div className="spotlight-page-media spotlight-page-video">
          <VideoWithFirstFrame src={item.url} poster={item.thumbnailUrl} label={spotlight.name} />
        </div>
        {item.description ? <p className="spotlight-media-description">{item.description}</p> : null}
      </div>
    );
  }

  const images = spotlight.media
    .filter((media) => media.type === "image")
    .map((media) => ({ src: media.url, alt: media.name || spotlight.name }));
  const imageIndex = images.findIndex((image) => image.src === item.url);

  return (
    <div className="spotlight-page-media-card">
      <div className="spotlight-page-media">
        <ImageLightbox
          src={item.url}
          alt={item.name || spotlight.name}
          images={images}
          initialIndex={Math.max(0, imageIndex)}
        />
      </div>
      {item.description ? <p className="spotlight-media-description">{item.description}</p> : null}
    </div>
  );
}

export default async function SpotlightPage({ params }: { params: { slug: string } }) {
  const content = await getContent();
  const spotlight = (content.spotlights ?? []).find(
    (item) => (item.slug || item.id) === params.slug || item.id === params.slug
  );

  if (!spotlight) notFound();

  return (
    <main className="spotlight-page">
      <header className="landing-nav">
        <div className="wrap landing-nav-inner">
          <Link className="mark nav-brand landing-nav-brand" href="/">
            {content.identity?.showLogo && content.identity.logoUrl ? (
              <img className="nav-logo" src={content.identity.logoUrl} alt="" />
            ) : null}
            <span>MF / NAVARRO</span>
          </Link>
          <Link className="landing-back" href="/#spotlights">Back to spotlights ↗</Link>
        </div>
      </header>

      <section className="landing-intro wrap spotlight-intro-page">
        <div className="eyebrow">SPOTLIGHTS</div>
        <div className="landing-intro-grid">
          <div>
            <div className="landing-number">{String((content.spotlights ?? []).findIndex((item) => item.id === spotlight.id) + 1).padStart(2, "0")}</div>
            <h1>{spotlight.name}</h1>
          </div>
          {spotlight.desc ? <p>{spotlight.desc}</p> : null}
        </div>
      </section>

      {spotlight.media.length ? (
        <section className="spotlight-page-gallery">
          {spotlight.media.map((item) => (
            <SpotlightMedia key={item.id} spotlight={spotlight} item={item} />
          ))}
        </section>
      ) : (
        <section className="spotlight-empty wrap">This spotlight does not have any media yet.</section>
      )}

      <footer className="landing-footer wrap">
        <Link href="/#spotlights">← Spotlights</Link>
        <span>{spotlight.name}</span>
      </footer>
    </main>
  );
}
