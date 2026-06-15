/* APIC at Home — forum app root */

/* ================= NAV ================= */
function NavBar({ query, setQuery, onHome, onNew, onTag }) {
  return (
    <header className="nav">
      <div className="nav-inner">
        <button className="brand" onClick={onHome}>
          <img src="assets/apic-hex-mark.png" className="brand-mark" alt="APIC at Home" />
          <span className="brand-text">
            <span className="brand-name">APIC <span className="brand-at">at</span> Home</span>
            <span className="brand-sub">API Connect · DataPower lab forum</span>
          </span>
        </button>

        <div className="nav-search">
          <Icon name="search" size={17} />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); onHome(true); }}
            placeholder="Search threads, tags, error codes…"
            spellCheck={false}
          />
          {query && <button className="nav-search-clear" onClick={() => setQuery("")}>✕</button>}
        </div>

        <nav className="nav-links">
          <button className="nav-link" onClick={onHome}>Discussions</button>
          <button className="nav-link" onClick={() => onTag("lab")}>Labs</button>
          <button className="nav-icon" title="Notifications"><Icon name="bell" size={19} /><span className="nav-dot" /></button>
          <button className="btn-primary nav-new" onClick={onNew}><Icon name="plus" size={16} /> New post</button>
          <div className="nav-me">{initials("You Engineer")}</div>
        </nav>
      </div>
    </header>
  );
}

/* ================= HERO ================= */
function Hero({ stats, onNew }) {
  const chips = [
    { k: "online", label: "online now", v: stats.online, c: "#34d399" },
    { k: "members", label: "members", v: fmtNum(stats.members), c: "#4f9bff" },
    { k: "posts", label: "posts", v: fmtNum(stats.posts), c: "#a78bfa" },
    { k: "solved", label: "solved", v: fmtNum(stats.solved), c: "#22d3ee" },
  ];
  return (
    <section className="hero">
      <div className="hero-glow" />
      <div className="hero-content">
        <div className="hero-eyebrow"><span className="pulse" /> A hands-on lab series &amp; forum</div>
        <h1 className="hero-title">Build, break, and validate<br /><span className="hero-em">API Connect</span> &amp; <span className="hero-em2">DataPower</span> — at home.</h1>
        <p className="hero-desc">Self-contained modules for install, upgrade, day-2 ops and CI/CD. Repeatable for learning, validation, and pipeline experiments. Ask anything — engineers answer.</p>
        <div className="hero-actions">
          <button className="btn-primary lg" onClick={onNew}><Icon name="plus" size={17} /> Start a discussion</button>
          <button className="btn-ghost lg">Browse lab modules <Icon name="arrowRight" size={16} /></button>
        </div>
      </div>
      <div className="hero-stats">
        {chips.map((c) => (
          <div className="stat-chip" key={c.k}>
            <span className="stat-v" style={{ color: c.c }}>{c.v}</span>
            <span className="stat-l">{c.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ================= CATEGORY RAIL (left) ================= */
function CategoryRail({ cats, active, onPick }) {
  const total = cats.reduce((s, c) => s + c.threads, 0);
  return (
    <aside className="rail">
      <div className="rail-title">Categories</div>
      <button className="rail-item" data-active={active === "all" ? "1" : "0"} onClick={() => onPick("all")}>
        <span className="rail-glyph all"><Icon name="grid" size={18} /></span>
        <span className="rail-label"><span className="rail-name">All discussions</span></span>
        <span className="rail-count">{fmtNum(total)}</span>
      </button>
      {cats.map((c) => (
        <button key={c.id} className="rail-item" data-active={active === c.id ? "1" : "0"} onClick={() => onPick(c.id)}>
          <CatGlyph cat={c} size={34} />
          <span className="rail-label">
            <span className="rail-name">{c.name}</span>
            <span className="rail-blurb">{c.blurb}</span>
          </span>
          <span className="rail-count">{fmtNum(c.threads)}</span>
        </button>
      ))}
    </aside>
  );
}

/* ================= CATEGORY CARDS (top grid) ================= */
function CategoryCards({ cats, active, onPick }) {
  return (
    <div className="cat-cards">
      {cats.map((c) => {
        const col = ACCENTS[c.accent];
        return (
          <button key={c.id} className="cat-card" data-active={active === c.id ? "1" : "0"}
            style={{ "--c": col }} onClick={() => onPick(active === c.id ? "all" : c.id)}>
            <div className="cat-card-top">
              <CatGlyph cat={c} size={44} />
              <span className="cat-card-count">{fmtNum(c.threads)} <span>threads</span></span>
            </div>
            <div className="cat-card-name">{c.name}</div>
            <div className="cat-card-blurb">{c.blurb}</div>
            <div className="cat-card-cta">Browse <Icon name="arrowRight" size={14} /></div>
          </button>
        );
      })}
    </div>
  );
}

/* ================= FILTER BAR ================= */
const SORTS = [
  { id: "active", label: "Active" },
  { id: "latest", label: "Latest" },
  { id: "unanswered", label: "Unanswered" },
  { id: "solved", label: "Solved" },
];
function FilterBar({ sort, setSort, count, activeTag, clearTag, query, clearQuery }) {
  return (
    <div className="filterbar">
      <div className="sort-tabs">
        {SORTS.map((s) => (
          <button key={s.id} className="sort-tab" data-active={sort === s.id ? "1" : "0"} onClick={() => setSort(s.id)}>
            {s.label}
          </button>
        ))}
      </div>
      <div className="filter-right">
        {(activeTag || query) && (
          <div className="active-filters">
            {query && <span className="filter-pill">“{query}” <button onClick={clearQuery}>✕</button></span>}
            {activeTag && <span className="filter-pill" data-tag="1"><span className="tag-hash">#</span>{activeTag} <button onClick={clearTag}>✕</button></span>}
          </div>
        )}
        <span className="result-count">{count} {count === 1 ? "thread" : "threads"}</span>
      </div>
    </div>
  );
}

/* ================= THREAD ROW ================= */
function ThreadRow({ thread, cat, dense, onOpen, onTag }) {
  const c = ACCENTS[cat.accent];
  return (
    <article className={"trow" + (dense ? " dense" : "")} onClick={() => onOpen(thread)}>
      <Avatar user={thread.author} size={dense ? 30 : 42} />
      <div className="trow-main">
        <div className="trow-titleline">
          {thread.pinned && <span className="mini-pin" title="Pinned"><Icon name="pin" size={13} /></span>}
          {thread.module && <span className="mini-module">{thread.module}</span>}
          <span className="trow-title">{thread.title}</span>
          {thread.solved && <SolvedBadge />}
        </div>
        <div className="trow-sub">
          <button className="cat-chip" style={{ "--c": c }} onClick={(e) => { e.stopPropagation(); }}>
            <span className="cat-chip-dot" /> {cat.name}
          </button>
          {!dense && thread.tags.slice(0, 3).map((t) => (
            <button key={t} className="trow-tag" onClick={(e) => { e.stopPropagation(); onTag(t); }}>#{t}</button>
          ))}
          <span className="trow-by">by {thread.author.name}</span>
        </div>
      </div>
      <div className="trow-stats">
        <div className="trow-stat"><b>{thread.replies}</b><span><Icon name="reply" size={12} /> replies</span></div>
        <div className="trow-stat"><b>{fmtNum(thread.views)}</b><span><Icon name="eye" size={12} /> views</span></div>
        <div className="trow-stat last"><b>{timeAgo(thread.lastAt)}</b><span>ago</span></div>
      </div>
    </article>
  );
}

/* ================= RIGHT RAIL ================= */
function RightRail({ tags, onTag, threads, cats }) {
  const contributors = useMemo(() => {
    const map = {};
    threads.forEach((t) => t.posts.forEach((p) => {
      map[p.author.handle] = map[p.author.handle] || { u: p.author, n: 0 };
      map[p.author.handle].n++;
    }));
    return Object.values(map).sort((a, b) => b.n - a.n).slice(0, 5);
  }, [threads]);
  const featured = threads.find((t) => t.module);
  const fcat = featured && cats.find((c) => c.id === featured.cat);
  return (
    <aside className="rrail">
      {featured && (
        <div className="rcard featured" style={{ "--c": ACCENTS[fcat.accent] }}>
          <div className="rcard-eyebrow"><Icon name="book" size={13} /> Featured lab</div>
          <div className="rcard-title">{featured.title}</div>
          <div className="rcard-meta">{featured.module} · {featured.level} · ~{featured.minutes} min</div>
          <button className="rcard-btn">Open module <Icon name="arrowRight" size={14} /></button>
        </div>
      )}
      <div className="rcard">
        <div className="rcard-head"><Icon name="tag" size={14} /> Trending tags</div>
        <div className="tag-cloud">
          {tags.map((t) => <TagChip key={t} label={t} onClick={() => onTag(t)} />)}
        </div>
      </div>
      <div className="rcard">
        <div className="rcard-head"><Icon name="fire" size={14} /> Top answerers</div>
        <ul className="contrib">
          {contributors.map((c, i) => (
            <li key={c.u.handle}>
              <span className="contrib-rank">{i + 1}</span>
              <Avatar user={c.u} size={28} />
              <span className="contrib-name">{c.u.name}<span className="contrib-role">{c.u.role}</span></span>
              <span className="contrib-n">{c.n}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

/* ================= APP ROOT ================= */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "direction": "deck",
  "accent": "#4f9bff",
  "density": "regular",
  "glow": true,
  "heading": "'Space Grotesk'"
}/*EDITMODE-END*/;

function App() {
  const D = window.FORUM_DATA;
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [view, setView] = useState("home");      // home | thread
  const [openThread, setOpenThread] = useState(null);
  const [activeCat, setActiveCat] = useState("all");
  const [sort, setSort] = useState("active");
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState(null);
  const [composer, setComposer] = useState(false);
  const [extra, setExtra] = useState([]);         // user-created threads
  const scrollRef = useRef(null);

  const allThreads = useMemo(() => [...extra, ...D.THREADS], [extra]);
  const catById = (id) => D.CATEGORIES.find((c) => c.id === id);

  const filtered = useMemo(() => {
    let list = allThreads.slice();
    if (activeCat !== "all") list = list.filter((th) => th.cat === activeCat);
    if (activeTag) list = list.filter((th) => th.tags.includes(activeTag) || (activeTag === "lab" && th.module));
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((th) =>
        th.title.toLowerCase().includes(q) ||
        th.tags.some((tg) => tg.includes(q)) ||
        th.author.name.toLowerCase().includes(q));
    }
    if (sort === "unanswered") list = list.filter((th) => !th.solved);
    if (sort === "solved") list = list.filter((th) => th.solved);
    const pin = (th) => (th.pinned && (sort === "active" || sort === "latest") && !activeTag && !query ? 1 : 0);
    list.sort((a, b) => {
      if (pin(b) - pin(a)) return pin(b) - pin(a);
      if (sort === "latest") return new Date(b.created) - new Date(a.created);
      if (sort === "top") return b.views - a.views;
      return new Date(b.lastAt) - new Date(a.lastAt);
    });
    return list;
  }, [allThreads, activeCat, activeTag, query, sort]);

  function goHome(keep) {
    setView("home");
    setOpenThread(null);
    if (keep !== true) { /* keep filters */ }
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }
  function openThreadView(th) {
    setOpenThread(th); setView("thread");
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }
  function pickTag(tag) {
    setActiveTag(tag); setActiveCat("all"); setView("home"); setQuery("");
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }
  function createThread(data) {
    const th = {
      id: "u-" + Date.now(), cat: data.cat, title: data.title,
      author: { name: "You", handle: "you", color: "#4f9bff", role: "Member" },
      created: new Date().toISOString(), lastAt: new Date().toISOString(),
      tags: data.tags.length ? data.tags : ["question"], replies: 0, views: 1, solved: false,
      posts: [{ author: { name: "You", handle: "you", color: "#4f9bff", role: "Member" },
        at: new Date().toISOString(), body: [{ type: "p", body: data.body }] }],
    };
    setExtra((e) => [th, ...e]);
    setComposer(false);
    setActiveCat(data.cat); setSort("latest"); setActiveTag(null); setQuery("");
    openThreadView(th);
  }

  const dense = t.direction === "dense" || t.density === "compact";
  const cssVars = {
    "--accent": t.accent,
    "--font-head": t.heading,
    "--row-pad": dense ? "11px 16px" : "16px 18px",
  };

  return (
    <div className="app" data-dir={t.direction} data-glow={t.glow ? "1" : "0"} style={cssVars} ref={scrollRef}>
      <NavBar query={query} setQuery={setQuery} onHome={goHome} onNew={() => setComposer(true)} onTag={pickTag} />

      <main className="page">
        {view === "thread" && openThread ? (
          <ThreadDetail thread={openThread} cat={catById(openThread.cat)}
            onBack={() => goHome(true)} onTag={pickTag} />
        ) : (
          <>
            <Hero stats={D.STATS} onNew={() => setComposer(true)} />

            {t.direction === "cards" && (
              <CategoryCards cats={D.CATEGORIES} active={activeCat} onPick={setActiveCat} />
            )}

            <div className={"layout dir-" + t.direction}>
              {t.direction === "deck" && (
                <CategoryRail cats={D.CATEGORIES} active={activeCat} onPick={setActiveCat} />
              )}

              <section className="feed">
                <FilterBar sort={sort} setSort={setSort} count={filtered.length}
                  activeTag={activeTag} clearTag={() => setActiveTag(null)}
                  query={query} clearQuery={() => setQuery("")} />
                <div className="threads">
                  {filtered.length === 0 ? (
                    <div className="empty">
                      <Icon name="search" size={28} />
                      <p>No threads match. Try clearing a filter or start the discussion yourself.</p>
                      <button className="btn-primary" onClick={() => setComposer(true)}><Icon name="plus" size={15} /> New post</button>
                    </div>
                  ) : filtered.map((th) => (
                    <ThreadRow key={th.id} thread={th} cat={catById(th.cat)} dense={dense}
                      onOpen={openThreadView} onTag={pickTag} />
                  ))}
                </div>
              </section>

              {t.direction !== "dense" && (
                <RightRail tags={D.TRENDING_TAGS} onTag={pickTag} threads={D.THREADS} cats={D.CATEGORIES} />
              )}
            </div>
          </>
        )}
      </main>

      {composer && (
        <Composer categories={D.CATEGORIES} onClose={() => setComposer(false)} onCreate={createThread} />
      )}

      <TweaksPanel>
        <TweakSection label="Layout direction" />
        <TweakRadio label="Home layout" value={t.direction}
          options={["deck", "cards", "dense"]}
          onChange={(v) => setTweak("direction", v)} />
        <TweakRadio label="Density" value={t.density}
          options={["regular", "compact"]}
          onChange={(v) => setTweak("density", v)} />
        <TweakSection label="Theme" />
        <TweakColor label="Accent" value={t.accent}
          options={["#4f9bff", "#22d3ee", "#a78bfa", "#34d399"]}
          onChange={(v) => setTweak("accent", v)} />
        <TweakToggle label="Hero glow" value={t.glow}
          onChange={(v) => setTweak("glow", v)} />
        <TweakSection label="Typography" />
        <TweakSelect label="Headings" value={t.heading}
          options={["'Space Grotesk'", "'IBM Plex Sans'", "'Sora'", "'Chakra Petch'"]}
          onChange={(v) => setTweak("heading", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
