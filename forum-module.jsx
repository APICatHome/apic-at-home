/* APIC at Home — full lab-module reader (renders FORUM_LABS guide content) */

/* ---- inline formatting: linkify URLs + `code` spans ---- */
function lmInline(text) {
  const nodes = [];
  const re = /(`[^`]+`|https?:\/\/[^\s)>\]]+)/g;
  let last = 0, m, k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("`")) {
      nodes.push(<code className="lm-icode" key={k++}>{tok.slice(1, -1)}</code>);
    } else {
      const clean = tok.replace(/[.,;:]+$/, "");
      const trail = tok.slice(clean.length);
      nodes.push(<a className="lm-link" href={clean} target="_blank" rel="noreferrer" key={k++}>{clean}</a>);
      if (trail) nodes.push(trail);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function lmGuessLang(s) {
  const h = s.slice(0, 400);
  if (/^\s*[{[]/.test(h) || /"\w+"\s*:/.test(h)) return "json";
  if (/^\s*[\w.-]+:\s/.test(h) && /\n\s+\w/.test(h)) return "yaml";
  if (/\b(kubectl|oc |apicup|sudo|docker|helm|curl|ssh|podman|export |apt|yum|grep|sed|openssl)\b/.test(h)) return "bash";
  if (/^(GET|POST|PUT|DELETE|HTTP)/.test(h)) return "http";
  if (/^\s*(var|const|let|function|context\.)/.test(h)) return "javascript";
  if (/\/ip |\/interface |routeros/i.test(h)) return "routeros";
  return "text";
}

function LmCode({ s }) {
  return (
    <div className="codeblock lm-code">
      <div className="codeblock-head">
        <span className="dot" /><span className="dot" /><span className="dot" />
        <span className="codeblock-lang">{lmGuessLang(s)}</span>
      </div>
      <pre><code>{s}</code></pre>
    </div>
  );
}

const LM_CALLOUT = {
  info: { icon: "book",  label: "Note" },
  tip:  { icon: "bolt",  label: "Tip" },
  warn: { icon: "pin",   label: "Important" },
  ok:   { icon: "check", label: "Lab-tested" },
  bad:  { icon: "pin",   label: "Caution" },
};

function LmBlock({ b }) {
  switch (b.t) {
    case "h2": return <h2 className="lm-h2">{lmInline(b.s)}</h2>;
    case "h3": return <h3 className="lm-h3">{lmInline(b.s)}</h3>;
    case "p":  return <p className="lm-p">{lmInline(b.s)}</p>;
    case "code": return <LmCode s={b.s} />;
    case "ul": return <ul className="lm-ul">{b.items.map((it, i) => <li key={i}>{lmInline(it)}</li>)}</ul>;
    case "callout": {
      const c = LM_CALLOUT[b.kind] || LM_CALLOUT.info;
      return (
        <div className={"lm-callout lm-" + b.kind}>
          <div className="lm-callout-tag"><Icon name={c.icon} size={13} /> {c.label}</div>
          <div className="lm-callout-body">{lmInline(b.s)}</div>
        </div>
      );
    }
    case "table":
      return (
        <div className="lm-table-wrap">
          <table className="lm-table">
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((cell, j) => (
                    <td key={j} className={j === 0 ? "lm-td-key" : "lm-td-val"}>{lmInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default: return null;
  }
}

function LabModule({ thread, cat, onBack }) {
  const c = ACCENTS[cat.accent];
  const guide = (window.FORUM_LABS || {})[thread.id];
  const blocks = guide ? guide.blocks : [];
  return (
    <div className="detail lab-module">
      <button className="back-btn" onClick={onBack}>
        <Icon name="arrowRight" size={16} style={{ transform: "rotate(180deg)" }} /> Back to discussion
      </button>

      <div className="lm-head" style={{ "--c": c }}>
        <div className="lm-badge"><Icon name="book" size={15} /> {thread.module} · Lab Module</div>
        <h1 className="lm-title">{thread.title}</h1>
        <div className="lm-meta">
          <span><b>{thread.level}</b> level</span>
          <span className="module-dot">·</span>
          <span><Icon name="clock" size={13} /> ~{thread.minutes} min</span>
          <span className="module-dot">·</span>
          <span>Self-contained &amp; repeatable</span>
        </div>
        {guide && <div className="lm-source">Source document: <span>{guide.source}</span></div>}
      </div>

      {blocks.length ? (
        <article className="lm-body">
          {blocks.map((b, i) => <LmBlock key={i} b={b} />)}
        </article>
      ) : (
        <div className="lm-empty">
          <Icon name="book" size={26} />
          <p>The full lab write-up for this module hasn't been attached yet. The discussion thread has the working notes.</p>
          <button className="btn-primary" onClick={onBack}><Icon name="reply" size={15} /> Back to discussion</button>
        </div>
      )}

      <div className="lm-foot">
        <button className="back-btn" onClick={onBack}>
          <Icon name="arrowRight" size={16} style={{ transform: "rotate(180deg)" }} /> Back to discussion
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { LabModule });
