export default function Home() {
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
            <h1>Ideas, shaped into work people remember.</h1>
            <p className="lede">
              I&apos;m MF Navarro, a Digital Creative Manager leading multimedia
              design across brand, campaign, and product — from first concept
              to final cut.
            </p>
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
              <span className="chip">Adobe CC</span>
              <span className="chip">Figma</span>
              <span className="chip">After Effects</span>
              <span className="chip">Premiere Pro</span>
              <span className="chip">Webflow</span>
            </div>
            <div className="now">
              <b>Now:</b> leading a brand refresh and launch campaign for a
              retail client, based in London.
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
            <a className="work-item" href="#">
              <div className="name">Ledgerline Rebrand</div>
              <div className="desc">
                Full brand identity and motion system for a fintech relaunch.
              </div>
              <div className="tag">Brand · Motion</div>
            </a>
            <a className="work-item" href="#">
              <div className="name">Ferry &amp; Co. Campaign</div>
              <div className="desc">
                Multi-channel launch campaign, from concept through delivery.
              </div>
              <div className="tag">Campaign · Art Direction</div>
            </a>
            <a className="work-item" href="#">
              <div className="name">Northbound Content Hub</div>
              <div className="desc">
                Ongoing video and social content system for a logistics brand.
              </div>
              <div className="tag">Video · Content Strategy</div>
            </a>
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
            <div className="testi">
              <p>
                MF&apos;s creative direction is consistently sharp. She&apos;s
                become one of the people we rely on most, and we look forward
                to working together again.
              </p>
              <div className="who">
                <b>Matt Bland</b> — Managing Director, Ragged Edge
              </div>
            </div>
            <div className="testi">
              <p>
                Organized, communicative, and always pushing the work
                further — the kind of creative lead who raises the whole
                team&apos;s standard.
              </p>
              <div className="who">
                <b>Sarah Yoon</b> — Product Lead, Northbound
              </div>
            </div>
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
            <div className="client">Ragged Edge</div>
            <div className="client">Ditta</div>
            <div className="client">Foolproof</div>
            <div className="client">Greggs</div>
            <div className="client">Northbound</div>
            <div className="client">Ferry &amp; Co.</div>
          </div>
        </div>
      </section>

      <section id="about">
        <div className="wrap about">
          <div className="eyebrow">// about</div>
          <div>
            <p>
              I started as a Multimedia Designer and now work as a Digital
              Creative Manager, leading design and content across brand,
              campaign, and video for clients between London and remote
              teams. I care most about the parts of creative work that
              don&apos;t show up in a single frame: the strategy behind it,
              how it holds up across channels, and how easy it is for a team
              to carry forward.
            </p>
            <p>
              Outside client work, I mentor junior designers and keep a
              running archive of visual references, one scoped project at a
              time.
            </p>
          </div>
        </div>
      </section>

      <footer id="contact">
        <div className="wrap">
          <h2>Have a project in mind?</h2>
          <div className="row">
            <a className="email" href="mailto:hello@mfnavarro.dev">
              hello@mfnavarro.dev
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
