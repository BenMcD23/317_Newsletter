"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Newsletter } from "@/lib/newsletters";

interface Props {
  newsletter: Newsletter;
}

export default function PdfBooklet({ newsletter }: Props) {
  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentSpread, setCurrentSpread] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [flipping, setFlipping] = useState<"left" | "right" | null>(null);
  const [flipProgress, setFlipProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const flipAnimRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalSpreads = totalPages > 0 ? Math.ceil((totalPages - 1) / 2) + 1 : 0;

  const getSpreadPages = useCallback(
    (spread: number) => {
      if (spread === 0) return { left: null, right: 1 };
      const base = (spread - 1) * 2 + 2;
      return {
        left: base <= totalPages ? base : null,
        right: base + 1 <= totalPages ? base + 1 : null,
      };
    },
    [totalPages]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPdfDoc(null);
    setTotalPages(0);
    setCurrentSpread(0);

    (async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

        const doc = await pdfjsLib.getDocument({
          url: newsletter.pdfPath,
          disableRange: true,
          disableStream: true,
        }).promise;

        if (cancelled) return;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setLoading(false);
      } catch (e: any) {
        console.error("PDF load error:", e);
        if (!cancelled) {
          setError(`Failed to load PDF: ${e?.message ?? "unknown error"}`);
          setLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [newsletter.pdfPath]);

  const renderPageToCanvas = useCallback(
    async (pageNum: number, canvas: HTMLCanvasElement, scale = 2.2) => {
      if (!pdfDoc) return;
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport }).promise;
    },
    [pdfDoc]
  );

  useEffect(() => {
    if (!pdfDoc || loading) return;
    const { left, right } = getSpreadPages(currentSpread);

    if (left && leftCanvasRef.current) {
      renderPageToCanvas(left, leftCanvasRef.current);
    } else if (leftCanvasRef.current) {
      const ctx = leftCanvasRef.current.getContext("2d");
      ctx?.clearRect(0, 0, leftCanvasRef.current.width, leftCanvasRef.current.height);
    }

    if (right && rightCanvasRef.current) {
      renderPageToCanvas(right, rightCanvasRef.current);
    }
  }, [pdfDoc, currentSpread, loading, renderPageToCanvas, getSpreadPages]);

  const animateFlip = useCallback(
    (direction: "left" | "right", onComplete: () => void) => {
      setFlipping(direction);
      const start = performance.now();
      const duration = 500;

      const tick = (now: number) => {
        const raw = Math.min((now - start) / duration, 1);
        const t = raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2;
        setFlipProgress(t);

        if (raw < 1) {
          flipAnimRef.current = requestAnimationFrame(tick);
        } else {
          setFlipProgress(0);
          setFlipping(null);
          onComplete();
        }
      };

      flipAnimRef.current = requestAnimationFrame(tick);
    },
    []
  );

  const goNext = useCallback(() => {
    if (currentSpread >= totalSpreads - 1 || flipping) return;
    animateFlip("right", () => setCurrentSpread((s) => s + 1));
  }, [currentSpread, totalSpreads, flipping, animateFlip]);

  const goPrev = useCallback(() => {
    if (currentSpread <= 0 || flipping) return;
    animateFlip("left", () => setCurrentSpread((s) => s - 1));
  }, [currentSpread, flipping, animateFlip]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape" && isFullscreen) setIsFullscreen(false);
      if (e.key === "f") setIsFullscreen((v) => !v);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, isFullscreen]);

  // Sync browser fullscreen API with our state
  useEffect(() => {
    if (isFullscreen) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    }
  }, [isFullscreen]);

  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) setIsFullscreen(false);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    return () => { if (flipAnimRef.current) cancelAnimationFrame(flipAnimRef.current); };
  }, []);

  const { left, right } = pdfDoc
    ? getSpreadPages(currentSpread)
    : { left: null, right: null };
  const isCover = currentSpread === 0;

  const flipDeg = flipping === "right"
    ? flipProgress * -180
    : flipping === "left"
    ? -180 + flipProgress * 180
    : 0;

  const shadeOpacity = Math.abs(Math.sin(flipProgress * Math.PI)) * 0.5;

  const pageLabel = isCover
    ? "Cover"
    : (() => {
        const { left: l, right: r } = getSpreadPages(currentSpread);
        if (l && r) return `Pages ${l} – ${r}`;
        if (r) return `Page ${r}`;
        if (l) return `Page ${l}`;
        return "";
      })();

  return (
    <section>
      {!isFullscreen && (
        <div
          style={{
            textAlign: "center",
            padding: "2.5rem 1rem 1.5rem",
            borderBottom: "3px double var(--rule)",
            background: "var(--paper-dark)",
          }}
        >
          <p
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: "0.5rem",
              fontFamily: "Helvetica Neue, sans-serif",
            }}
          >
            Issue #{newsletter.issue} · {newsletter.date}
          </p>

          <h2
            style={{
              fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
              fontFamily: "'Times New Roman', Times, serif",
              fontWeight: "700",
              margin: "0 0 0.75rem",
              color: "var(--ink)",
            }}
          >
            {newsletter.title}
          </h2>

          <p
            style={{
              maxWidth: "520px",
              margin: "0 auto 1.25rem",
              color: "var(--muted)",
              fontSize: "0.9rem",
              lineHeight: "1.6",
              fontStyle: "italic",
            }}
          >
            {newsletter.description}
          </p>

          <a
            href={newsletter.pdfPath}
            download
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.55rem 1.4rem",
              background: "var(--ink)",
              color: "var(--paper)",
              textDecoration: "none",
              fontSize: "0.7rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              fontFamily: "Helvetica Neue, sans-serif",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--ink)"; }}
          >
            Download PDF
          </a>
        </div>
      )}

      {/* Viewer */}
      <div
        ref={containerRef}
        style={{
          background: isFullscreen ? "#3a3530" : "#5a5550",
          // In fullscreen the browser gives us 100vh; we use flex column to
          // keep the nav bar always visible at the bottom.
          height: isFullscreen ? "100vh" : "auto",
          minHeight: isFullscreen ? "unset" : "85vh",
          padding: isFullscreen ? "1rem" : "2.5rem 1rem 3rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.75rem",
          position: "relative",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          .page-turn-btn {
            background: rgba(255,255,255,0.12);
            border: 1px solid rgba(255,255,255,0.2);
            color: rgba(255,255,255,0.85);
            width: 48px; height: 48px;
            border-radius: 50%;
            font-size: 1.3rem;
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            transition: background 0.15s, transform 0.1s;
            flex-shrink: 0;
            user-select: none;
          }
          .page-turn-btn:hover:not(:disabled) { background: rgba(255,255,255,0.25); transform: scale(1.1); }
          .page-turn-btn:disabled { opacity: 0.2; cursor: default; }
          .fs-btn {
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.18);
            color: rgba(255,255,255,0.7);
            padding: 0.35rem 0.85rem;
            border-radius: 4px;
            font-size: 0.65rem;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            cursor: pointer;
            font-family: Helvetica Neue, sans-serif;
            display: flex; align-items: center; gap: 0.4rem;
            transition: background 0.15s, color 0.15s;
            user-select: none;
          }
          .fs-btn:hover { background: rgba(255,255,255,0.2); color: #fff; }
        `}</style>

        {/* Top bar: page info + fullscreen toggle */}
        {!loading && !error && (
          <div style={{ width: "100%", maxWidth: "1300px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            {/* Left: issue info (fullscreen only) */}
            <div style={{ color: "rgba(255,255,255,0.45)", fontFamily: "Helvetica Neue, sans-serif", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              {isFullscreen && `${newsletter.title} · Issue #${newsletter.issue} · ${newsletter.date}`}
            </div>

            {/* Right: fullscreen button */}
            <button className="fs-btn" onClick={() => setIsFullscreen((v) => !v)}>
              {isFullscreen ? (
                <>{"\u26F6"} Exit Fullscreen</>
              ) : (
                <>{"\u26F6"} Fullscreen</>
              )}
            </button>
          </div>
        )}

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: "1rem", color: "rgba(255,255,255,0.6)" }}>
            <div style={{ width: "40px", height: "40px", border: "3px solid rgba(255,255,255,0.15)", borderTopColor: "rgba(255,255,255,0.7)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ fontSize: "0.8rem", letterSpacing: "0.1em", fontFamily: "sans-serif" }}>Loading newsletter...</p>
          </div>
        )}

        {error && (
          <div style={{ color: "#ffb3b3", fontFamily: "sans-serif", fontSize: "0.9rem", textAlign: "center", padding: "3rem", maxWidth: "480px", lineHeight: "1.6" }}>
            <p style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📄</p>
            <p>{error}</p>
            <p style={{ marginTop: "1rem", fontSize: "0.75rem", color: "rgba(255,200,200,0.6)" }}>Check the browser console for more details.</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Book spread — flex:1 so it fills available vertical space, with overflow hidden */}
            <div
              style={{
                display: "flex",
                width: "100%",
                maxWidth: isFullscreen ? "calc(100vw - 4rem)" : "1300px",
                // KEY FIX: use flex:1 + maxHeight to fill remaining space without overflowing nav
                flex: "1 1 0",
                minHeight: 0,
                maxHeight: isFullscreen ? "calc(100vh - 130px)" : "none",
                perspective: "2500px",
                boxShadow: "-10px 0 30px rgba(0,0,0,0.4), 10px 0 30px rgba(0,0,0,0.4), 0 16px 60px rgba(0,0,0,0.5)",
                position: "relative",
              }}
            >
              {/* LEFT PAGE */}
              <div
                style={{
                  flex: 1,
                  background: left ? "#fff" : "#ede8e0",
                  borderRight: "2px solid rgba(0,0,0,0.18)",
                  position: "relative",
                  overflow: "hidden",
                  transformOrigin: "right center",
                  transform: flipping === "left" ? `perspective(2500px) rotateY(${flipDeg}deg)` : "none",
                  transformStyle: "preserve-3d",
                  zIndex: flipping === "left" ? 10 : 1,
                }}
              >
                <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "16px", background: "linear-gradient(to left, rgba(0,0,0,0.1), transparent)", pointerEvents: "none", zIndex: 2 }} />
                {flipping === "left" && (
                  <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${shadeOpacity})`, pointerEvents: "none", zIndex: 3 }} />
                )}
                {left ? (
                  <canvas
                    ref={leftCanvasRef}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#b0a898", fontFamily: "'Times New Roman', serif", fontSize: "1rem", fontStyle: "italic" }}>
                    {!isCover && "End of issue"}
                  </div>
                )}
              </div>

              {/* RIGHT PAGE */}
              <div
                style={{
                  flex: 1,
                  background: "#fff",
                  position: "relative",
                  overflow: "hidden",
                  transformOrigin: "left center",
                  transform: flipping === "right" ? `perspective(2500px) rotateY(${flipDeg}deg)` : "none",
                  transformStyle: "preserve-3d",
                  zIndex: flipping === "right" ? 10 : 1,
                }}
              >
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "16px", background: "linear-gradient(to right, rgba(0,0,0,0.1), transparent)", pointerEvents: "none", zIndex: 2 }} />
                <div style={{ position: "absolute", top: 0, right: 0, width: "32px", height: "32px", background: "linear-gradient(225deg, #d4cfc8 45%, transparent 46%)", zIndex: 5, pointerEvents: "none" }} />
                {flipping === "right" && (
                  <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${shadeOpacity})`, pointerEvents: "none", zIndex: 3 }} />
                )}
                {right ? (
                  <canvas
                    ref={rightCanvasRef}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                ) : (
                  <div style={{ minHeight: "100%" }} />
                )}
              </div>

              {/* Click zones on edges for turning pages */}
              <div
                onClick={goPrev}
                style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "80px", cursor: currentSpread === 0 ? "default" : "w-resize", zIndex: 20, opacity: 0 }}
              />
              <div
                onClick={goNext}
                style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "80px", cursor: currentSpread >= totalSpreads - 1 ? "default" : "e-resize", zIndex: 20, opacity: 0 }}
              />
            </div>

            {/* Bottom nav bar — always visible, never pushed off screen */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1.5rem",
                color: "rgba(255,255,255,0.55)",
                fontFamily: "Helvetica Neue, sans-serif",
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                flexShrink: 0,
              }}
            >
              <button className="page-turn-btn" onClick={goPrev} disabled={currentSpread === 0 || !!flipping} aria-label="Previous spread">
                {"←"}
              </button>
              <span style={{ minWidth: "120px", textAlign: "center" }}>
                {pageLabel}{" / "}{totalPages}
              </span>
              <button className="page-turn-btn" onClick={goNext} disabled={currentSpread >= totalSpreads - 1 || !!flipping} aria-label="Next spread">
                {"→"}
              </button>
            </div>

            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.6rem", letterSpacing: "0.2em", fontFamily: "Helvetica Neue, sans-serif", textTransform: "uppercase", flexShrink: 0, margin: 0 }}>
              Arrow keys · click page edges · press F to toggle fullscreen
            </p>
          </>
        )}
      </div>
    </section>
  );
}