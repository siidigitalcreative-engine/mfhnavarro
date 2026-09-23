import { getContent } from "@/lib/content";

export default async function Home() {
  const content = await getContent();

  return (
    <>
      <header>
        <div className="nav wrap">
          <div className="mark">MF Navarro</div>
          <div className="status">
            <span className="dot" />
            Open to new projects
          </div>
          <div className="links">
            <a href="#work">Work</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <h1>{content.heroHeadline}</h1>
            <p className="lede">{content.heroLede}</p>
            <div className="cta-row">
              <a className="btn" href="#contact">
                Say hello
              </a>
              <span className="socials">
                <a href="#">Instagram</a> · <a href="#">LinkedIn</a>
              </span>
            </div>
          </div>
          <div className="stack-card">
            <div className="k">// working with</div>
            <div className="tools">
              {content.tools.map((tool) => (
                <span className="chip" key={tool}>
                  {tool}
                </span>
              ))}
            </div>
            <div className="now">
              <b>Now:</b> {content.nowNote.replace(/^Now:\s*/i, "")}
            </div>
          </div>
        </div>
      </section>

      <section id="work">
        <div className="wrap">
          <div className="head">
            <h2>Selected work</h2>
            <span>2023 — 2026</span>
          </div>
          <div className="work-list">
            {content.work.map((item) => (
              <a className="work-item" href="#" key={item.id}>
                <div className="work-namewrap">
                  {item.mediaUrl &&
                    (item.mediaType === "video" ? (
                      <video src={item.mediaUrl} className="work-thumb" muted loop playsInline autoPlay />
                    ) : (
                      <img src={item.mediaUrl} alt="" className="work-thumb" />
                    ))}
                  <div className="name">{item.name}</div>
                </div>
                <div className="desc">{item.desc}</div>
                <div className="tag">{item.tag}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="head">
            <h2>What people say</h2>
            <span>testimonials</span>
          </div>
          <div className="testi-grid">
            {content.testimonials.map((t) => (
              <div className="testi" key={t.id}>
                <p>{t.quote}</p>
                <div className="who">{t.who}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="head">
            <h2>Clients</h2>
            <span>past &amp; present</span>
          </div>
          <div className="clients">
            {content.clients.map((c) => (
              <div className="client" key={c}>
                {c}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about">
        <div className="wrap about">
          <div className="eyebrow">// about</div>
          <div>
            {content.aboutParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <footer id="contact">
        <div className="wrap">
          <h2>Have a project in mind?</h2>
          <div className="row">
            <a className="email" href={`mailto:${content.email}`}>
              {content.email}
            </a>
            <span className="socials">
              <a href="#">Instagram</a> · <a href="#">LinkedIn</a>
            </span>
          </div>
          <div className="meta">
            <span>MF Navarro — Digital Creative Manager</span>
            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </>
  );
}
