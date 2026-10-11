"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Terminal.module.css";

const TYPE_MS = 16;
const LINE_PAUSE = 210;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function kindFor(text) {
  if (text.startsWith("✓") || text.startsWith("➜") || text.startsWith("→")) return "ok";
  return "out";
}

export default function Terminal({ data }) {
  const dataRef = useRef(data);
  dataRef.current = data;

  const [lines, setLines] = useState([]);
  const [typing, setTyping] = useState("");
  const [booted, setBooted] = useState(false);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState([]);
  const [histIndex, setHistIndex] = useState(-1);

  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    const boot = dataRef.current.boot || [];

    (async () => {
      await sleep(500);
      for (const raw of boot) {
        if (!aliveRef.current) return;
        const kind = raw.startsWith("mithrabyte") ? "cmd" : kindFor(raw);
        for (let c = 1; c <= raw.length; c += 1) {
          if (!aliveRef.current) return;
          setTyping(raw.slice(0, c));
          await sleep(TYPE_MS);
        }
        if (!aliveRef.current) return;
        setTyping("");
        setLines((prev) => [...prev, { kind, text: raw }]);
        await sleep(LINE_PAUSE);
      }
      if (!aliveRef.current) return;
      setBooted(true);
      inputRef.current?.focus({ preventScroll: true });
    })();

    return () => {
      aliveRef.current = false;
    };
  }, []);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, typing, booted]);

  function focusInput() {
    window.getSelection?.()?.removeAllRanges?.();
    inputRef.current?.focus({ preventScroll: true });
  }

  function runCommand(raw) {
    const cmd = String(raw || "").trim();
    if (!cmd) return;

    const d = dataRef.current;
    const key = cmd.toLowerCase();

    setLines((prev) => [...prev, { kind: "cmd", text: `${d.prompt} ${cmd}` }]);
    setHistory((prev) => [cmd, ...prev]);
    setHistIndex(-1);

    if (key === "clear") {
      setLines([]);
      return;
    }

    if (key === "help") {
      const help = d.help;
      setLines((prev) => [
        ...prev,
        { kind: "ok", text: help.header },
        ...help.lines.map((text) => ({ kind: "out", text })),
      ]);
      return;
    }

    const out = d.outputs?.[key];
    if (out) {
      setLines((prev) => [...prev, ...out.map((text) => ({ kind: kindFor(text), text }))]);
      return;
    }

    setLines((prev) => [...prev, { kind: "err", text: `${d.unknownPrefix} ${cmd}` }]);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const next = value;
    setValue("");
    runCommand(next);
  }

  function handleKeyDown(event) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!history.length) return;
      const next = Math.min(histIndex + 1, history.length - 1);
      setHistIndex(next);
      setValue(history[next]);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = histIndex - 1;
      if (next < 0) {
        setHistIndex(-1);
        setValue("");
      } else {
        setHistIndex(next);
        setValue(history[next]);
      }
    }
  }

  const suggestions = useMemo(() => data.suggestions || [], [data.suggestions]);

  return (
    <div className={styles.wrap}>
      <div className={styles.window} onClick={focusInput} role="presentation">
        <div className={styles.bar}>
          <span className={styles.dots} aria-hidden="true">
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </span>
          <span className={styles.title}>{data.windowTitle}</span>
          <span className={styles.live}>
            <span className={styles.liveDot} aria-hidden="true" />
            live
          </span>
        </div>

        <div className={styles.body} ref={bodyRef} aria-live="polite">
          {lines.map((line, index) => (
            <div key={index} className={`${styles.line} ${styles[line.kind]}`}>
              {line.text}
            </div>
          ))}

          {typing && <div className={`${styles.line} ${styles.cmd}`}>{typing}</div>}

          {booted && (
            <form className={styles.inputRow} onSubmit={handleSubmit}>
              <span className={styles.prompt}>{data.prompt}</span>
              <input
                ref={inputRef}
                className={styles.input}
                value={value}
                onChange={(event) => setValue(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={data.placeholder}
                aria-label={data.placeholder}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck="false"
              />
            </form>
          )}
        </div>
      </div>

      <div className={styles.footer}>
        <p className={styles.hint}>{data.hint}</p>
        <div className={styles.chips}>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className={styles.chip}
              onClick={(event) => {
                event.stopPropagation();
                runCommand(suggestion);
                inputRef.current?.focus({ preventScroll: true });
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
