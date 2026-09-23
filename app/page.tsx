import { getContent } from "@/lib/content";
import type { MediaItem } from "@/lib/types";

function Media({ media, alt, className = "" }: { media: MediaItem; alt: string; className?: string }) {
  return media.type === "video" ? (
    <video className={className} src={media.url} muted loop playsInline autoPlay controls={false} aria-label={alt} />
  ) : (
    <img className={className} src={media.url} alt={alt} />
  );
}

export default async function Home() {
  const content = await getContent();

  return (
    <>
      <header>
        <div className="nav wrap">
          <a className="mark" href="#top">MF / NAVARRO</a>
          <div className="status"><span className="dot" /> Open to new projects</div>
          <div className="links"><a href="#work">Work</a><a href="#about">About</a><a href="#contact">Contact</a></div>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <div className="eyebrow">DIGITAL CREATIVE MANAGER / 09.26</div>
              <h1>{content.heroHeadline}</h1>
              <p className="lede">{content.heroLede}</p>
              <div className="cta-row"><a className="btn" href="#work">View selected work <span>↗</span></a><span className="socials"><a href="#">Instagram</a> · <a href="#">LinkedIn</a></span></div>
            </div>
            <div className="stack-card">
              <div className="k">// working with</div>
              <div className="tools">{content.tools.map((tool) => <span className="chip" key={tool}>{tool}</span>)}</div>
              <div className="now"><b>Now:</b> {content.nowNote.replace(/^Now:\s*/i, "")}</div>
            </div>
          </div>
        </section>

        <section id="work" className="work-section">
          <div className="wrap">
            <div className="head"><div><div className="eyebrow">SELECTED WORK</div><h2>Selected work</h2></div><span>2023 — 2026</span></div>
            <div className="work-grid">
              {content.work.map((item, index) => {
                const media = item.media ?? [];
                const primary = media[0];
                return (
                  <article className="work-card" key={item.id}>
                    <div className="work-visual">
                      {primary ? <Media media={primary} alt={item.name} className="work-primary" /> : <div className="work-placeholder"><span>MF</span></div>}
                      <div className="work-number">{String(index + 1).padStart(2, "0")}</div>
                      {media.length > 1 && <div className="work-count">{media.length} media</div>}
                    </div>
                    <div className="work-info">
                      <div><h3>{item.name}</h3><p>{item.desc}</p></div>
                      <span className="tag">{item.tag}</span>
                    </div>
                    {media.length > 1 && (
                      <div className="work-strip">
                        {media.slice(1, 5).map((m) => <Media key={m.id} media={m} alt={`${item.name} preview`} className="work-strip-media" />)}
                        {media.length > 5 && <span className="more-media">+{media.length - 5}</span>}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section>
          <div className="wrap">
            <div className="head"><div><div className="eyebrow">WORDS</div><h2>What people say</h2></div><span>testimonials</span></div>
            <div className="testi-grid">{content.testimonials.map((t) => <div className="testi" key={t.id}><div className="quote-mark">“</div><p>{t.quote}</p><div className="who">{t.who}</div></div>)}</div>
          </div>
        </section>

        <section>
          <div className="wrap">
            <div className="head"><div><div className="eyebrow">COLLABORATION</div><h2>Clients</h2></div><span>past &amp; present</span></div>
            <div className="clients">{content.clients.map((c) => <div className="client" key={c}>{c}</div>)}</div>
          </div>
        </section>

        <section id="about"><div className="wrap about"><div className="eyebrow">// ABOUT</div><div>{content.aboutParagraphs.map((p, i) => <p key={i}>{p}</p>)}</div></div></section>
      </main>

      <footer id="contact"><div className="wrap"><div className="eyebrow">START A CONVERSATION</div><h2>Have a project in mind?</h2><div className="row"><a className="email" href={`mailto:${content.email}`}>{content.email} <span>↗</span></a><span className="socials"><a href="#">Instagram</a> · <a href="#">LinkedIn</a></span></div><div className="meta"><span>MF Navarro — Digital Creative Manager</span><span>© 2026</span></div></div></footer>
    </>
  );
}
