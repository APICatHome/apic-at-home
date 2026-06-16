/* APIC at Home — thread detail, post rendering, composer */

/* ---------- render a single post body block ---------- */
function PostBody({ blocks }) {
  return (
    <div className="post-body">
      {blocks.map((b, i) =>
        b.type === "code" ? (
          <div className="codeblock" key={i}>
            <div className="codeblock-head">
              <span className="dot" /><span className="dot" /><span className="dot" />
              <span className="codeblock-lang">{b.lang}</span>
            </div>
            <pre><code>{b.body}</code></pre>
          </div>
        ) : (
          <p key={i}>{b.body}</p>
        )
      )}
    </div>
  );
}

/* ---------- one post (original or reply) ---------- */
function Post({ post, isOP }) {
  return (
    <article className={"post" + (post.solution ? " post-solution" : "")}>
      <div className="post-rail">
        <Avatar user={post.author} size={44} />
        <div className="post-rail-line" />
      </div>
      <div className="post-main">
        <header className="post-head">
          <div className="post-author">
            <span className="post-name">{post.author.name}</span>
            <span className="post-role" data-role={post.author.role}>{post.author.role}</span>
          </div>
          <span className="post-meta">@{post.author.handle} · {timeAgo(post.at)} ago</span>
        </header>
        {post.solution && (
          <div className="solution-flag"><Icon name="check" size={13} stroke={2.6} /> Accepted solution</div>
        )}
        <PostBody blocks={post.body} />
        <footer className="post-foot">
          <button className="post-act"><Icon name="bolt" size={15} /> Helpful</button>
          <button className="post-act"><Icon name="reply" size={15} /> Reply</button>
          {isOP && <span className="post-op-tag">Original post</span>}
        </footer>
      </div>
    </article>
  );
}

/* ---------- thread detail view ---------- */
function ThreadDetail({ thread, cat, onBack, onTag, onOpenModule }) {
  const c = ACCENTS[cat.accent];
  const [reply, setReply] = useState("");
  const replyRef = useRef(null);
  return (
    <div className="detail">
      <button className="back-btn" onClick={onBack}>
        <Icon name="arrowRight" size={16} style={{ transform: "rotate(180deg)" }} /> All discussions
      </button>

      <div className="detail-head">
        <div className="detail-crumbs">
          <span className="crumb" style={{ color: c }}>
            <CatGlyph cat={cat} size={22} /> {cat.name}
          </span>
          {thread.pinned && <span className="crumb-pin"><Icon name="pin" size={13} /> Pinned</span>}
          {thread.solved && <SolvedBadge />}
        </div>
        <h1 className="detail-title">{thread.title}</h1>
        <div className="detail-sub">
          <span className="detail-stat"><Icon name="reply" size={15} /> {thread.replies} replies</span>
          <span className="detail-stat"><Icon name="eye" size={15} /> {fmtNum(thread.views)} views</span>
          <span className="detail-stat"><Icon name="clock" size={15} /> opened {timeAgo(thread.created)} ago</span>
        </div>
        <div className="detail-tags">
          {thread.tags.map((t) => <TagChip key={t} label={t} onClick={() => onTag(t)} />)}
        </div>
      </div>

      {thread.module && (
        <div className="module-card" style={{ "--c": c }}>
          <div className="module-badge"><Icon name="book" size={15} /> {thread.module}</div>
          <div className="module-meta">
            <span><b>{thread.level}</b> level</span>
            <span className="module-dot">·</span>
            <span><Icon name="clock" size={13} /> ~{thread.minutes} min</span>
            <span className="module-dot">·</span>
            <span>Self-contained &amp; repeatable</span>
          </div>
          <button className="module-start" style={{ "--c": c }} onClick={onOpenModule}>Open lab module <Icon name="arrowRight" size={15} /></button>
        </div>
      )}

      <div className="posts">
        {thread.posts.map((p, i) => <Post key={i} post={p} isOP={i === 0} />)}
      </div>

      <div className="reply-box">
        <div className="reply-box-head">
          <Icon name="reply" size={16} /> Add your reply
        </div>
        <textarea
          ref={replyRef}
          className="reply-input"
          placeholder="Share a fix, a config snippet, or a follow-up question…"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
        />
        <div className="reply-actions">
          <span className="reply-hint">Markdown &amp; ```code``` supported</span>
          <button className="btn-primary" disabled={!reply.trim()}
            onClick={() => setReply("")}>Post reply</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- new-thread composer modal ---------- */
function Composer({ categories, onClose, onCreate }) {
  const [cat, setCat] = useState(categories[0].id);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [body, setBody] = useState("");
  const canPost = title.trim().length > 6 && body.trim().length > 0;
  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="composer" onMouseDown={(e) => e.stopPropagation()}>
        <header className="composer-head">
          <h2><Icon name="plus" size={18} /> Start a discussion</h2>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </header>
        <div className="composer-body">
          <label className="field">
            <span className="field-label">Category</span>
            <div className="cat-pills">
              {categories.map((k) => (
                <button key={k.id} className="cat-pill" data-active={cat === k.id ? "1" : "0"}
                  style={{ "--c": ACCENTS[k.accent] }} onClick={() => setCat(k.id)}>
                  <Icon name={k.icon} size={14} /> {k.name}
                </button>
              ))}
            </div>
          </label>
          <label className="field">
            <span className="field-label">Title</span>
            <input className="text-input" placeholder="Be specific — e.g. 'Gateway peering stuck pending on 10.0.8'"
              value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">Tags <span className="field-hint">comma separated</span></span>
            <input className="text-input mono" placeholder="datapower, tls, upgrade"
              value={tags} onChange={(e) => setTags(e.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">Details</span>
            <textarea className="text-input area" placeholder="What did you try? Paste logs or config inside ```triple backticks```."
              value={body} onChange={(e) => setBody(e.target.value)} />
          </label>
        </div>
        <footer className="composer-foot">
          <span className="composer-hint">Posting to <b>{categories.find((k) => k.id === cat).name}</b></span>
          <div className="composer-btns">
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn-primary" disabled={!canPost}
              onClick={() => onCreate({ cat, title: title.trim(), tags: tags.split(",").map((s) => s.trim()).filter(Boolean), body: body.trim() })}>
              Publish discussion
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

Object.assign(window, { PostBody, Post, ThreadDetail, Composer });
