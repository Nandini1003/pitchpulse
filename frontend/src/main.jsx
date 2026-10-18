
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const names = [
  'Opening',
  'Purpose',
  'Permission',
  'Their Business',
  'Their Need',
  'Objection',
  'Next Step',
  'Close'
];

const purposes = [
  'Reach the right person and introduce yourself',
  'Explain why you called in one or two sentences',
  'Ask whether they can talk now',
  'Learn what their business does before pitching',
  'Capture their need in their exact words',
  'Understand the reason for hesitation or no',
  'Agree a concrete action, channel and time',
  'Record actual outcome without inventing commitment'
];

async function request(path, method = 'GET', body) {
  const response = await fetch(API + path, {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || 'Request failed');
  }

  return response.json();
}

function App() {
  const [view, V] = useState('live');
  const [prospect, P] = useState('');
  const [company, C] = useState('');
  const [call, S] = useState(null);

  const [stage, G] = useState(0);
  const [h, H] = useState('');
  const [words, W] = useState('');
  const [outcome, O] = useState('');

  const [ai, A] = useState(null);
  const [past, B] = useState([]);
  const [detail, D] = useState(null);

  const [error, E] = useState('');
  const [busy, U] = useState(false);

  async function run(fn) {
    U(true);
    E('');

    try {
      await fn();
    } catch (e) {
      E(e.message);
    } finally {
      U(false);
    }
  }

  async function refresh() {
    B(await request('/calls'));
  }

  useEffect(() => {
    refresh().catch(() => {});
  }, []);

  async function saveCurrentStage() {
    await request('/calls/' + call.id + '/stages', 'POST', {
      stage,
      happened: h.trim(),
      prospect_words: words.trim()
    });
  }

  async function saveAndNext() {
    await saveCurrentStage();

    H('');
    W('');
    A(null);

    if (stage < 7) {
      G(stage + 1);
    }
  }

  async function closeCall() {
    if (!outcome.trim()) {
      E('Please enter the actual outcome before closing the call.');
      return;
    }

    // Save current-stage notes before closing.
    // Do not create an empty stage record.
    if (h.trim() || words.trim()) {
      await saveCurrentStage();
    }

    // The backend closes the call even if we have not reached Stage 8.
    await request('/calls/' + call.id + '/close', 'POST', {
      outcome: outcome.trim()
    });

    // Reset the active call only after successful saving.
    S(null);
    G(0);
    H('');
    W('');
    O('');
    A(null);
    D(null);
    P('');
    C('');

    await refresh();
    V('past');
  }

  return (
    <main>
      <header>
        <h1>CallCompass</h1>
        <p>The screen a caller keeps open during a cold call</p>

        <nav>
          <button onClick={() => V('live')}>
            Live call
          </button>

          <button
            onClick={() =>
              run(async () => {
                await refresh();
                D(null);
                V('past');
              })
            }
          >
            Past calls
          </button>
        </nav>
      </header>

      {error && <p className="error">{error}</p>}

      {view === 'past' ? (
        <section>
          <h2>Past calls</h2>

          {past.length === 0 && <p>No calls saved yet.</p>}

          {past.map(x => (
            <article key={x.id}>
              <button
                className="link"
                onClick={() =>
                  run(async () => {
                    D(await request('/calls/' + x.id));
                  })
                }
              >
                {x.prospect} · {x.company}
              </button>

              <p>
                Furthest stage: {names[x.furthest_stage] || 'Not recorded'}
                {' · '}
                Outcome: {x.outcome || 'In progress'}
              </p>
            </article>
          ))}

          {detail && (
            <article>
              <h3>Saved call</h3>

              <p>
                {detail.call.prospect} ·{' '}
                {detail.call.outcome || 'In progress'}
              </p>

              {detail.stage_results.map(r => (
                <p key={r.id}>
                  <b>{names[r.stage]}:</b> {r.happened}
                  <br />
                  Prospect: “{r.prospect_words}”
                </p>
              ))}
            </article>
          )}
        </section>
      ) : !call ? (
        <section>
          <h2>Start a call</h2>

          <label>
            Prospect
            <input
              value={prospect}
              onChange={e => P(e.target.value)}
            />
          </label>

          <label>
            Company
            <input
              value={company}
              onChange={e => C(e.target.value)}
            />
          </label>

          <button
            disabled={busy || !prospect.trim() || !company.trim()}
            onClick={() =>
              run(async () => {
                const newCall = await request('/calls', 'POST', {
                  prospect: prospect.trim(),
                  company: company.trim()
                });

                S(newCall);
                G(0);
                H('');
                W('');
                O('');
                A(null);
              })
            }
          >
            Start call
          </button>
        </section>
      ) : (
        <section>
          <small>
            Call with {prospect} · {company}
          </small>

          <h2>
            {stage + 1}. {names[stage]}
          </h2>

          <p>{purposes[stage]}</p>

          <div className="stages">
            {names.map((n, i) => (
              <button
                key={n}
                disabled={busy}
                className={stage === i ? 'active' : ''}
                onClick={() => {
                  G(i);
                  H('');
                  W('');
                  A(null);
                }}
              >
                {i + 1}. {n}
              </button>
            ))}
          </div>

          <label>
            What happened?
            <textarea
              value={h}
              onChange={e => H(e.target.value)}
              placeholder="Brief notes about what happened"
            />
          </label>

          <label>
            Prospect's own words
            <textarea
              value={words}
              onChange={e => W(e.target.value)}
              placeholder="Write the prospect's words verbatim, especially at Their Need"
            />
          </label>

          <div>
            <button
              disabled={busy}
              onClick={() =>
                run(async () => {
                  A(
                    await request('/ai/suggest', 'POST', {
                      stage,
                      happened: h,
                      prospect_words: words
                    })
                  );
                })
              }
            >
              Ask AI
            </button>

            <button
              disabled={busy}
              onClick={() => run(saveAndNext)}
            >
              Save stage {stage < 7 ? '& next' : ''}
            </button>
          </div>

          {ai && (
            <article>
              <b>AI suggestion — verify before using</b>

              <p>{ai.guidance}</p>
              <p>Question: {ai.suggested_question}</p>
              <p>Signal: {ai.signal}</p>
              <p>Caution: {ai.caution}</p>
            </article>
          )}

          <hr />

          <h3>End this call</h3>

          <p className="hint">
            You can close the call at any stage. You do not need to
            complete all eight stages. Your current notes will be
            saved automatically before closing.
          </p>

          <label>
            Actual outcome
            <input
              value={outcome}
              onChange={e => O(e.target.value)}
              placeholder="e.g. wrong person; no follow-up agreed"
            />
          </label>

          <button
            disabled={busy || !outcome.trim()}
            onClick={() => run(closeCall)}
          >
            Close and save call
          </button>
        </section>
      )}
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
