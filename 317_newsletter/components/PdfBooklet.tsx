"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Newsletter } from "@/lib/newsletters";

interface Props {
  newsletter: Newsletter;
}

export default function PdfBooklet({ newsletter }: Props) {
  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const flipAnimRef = useRef<number | null>(null);

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [flipping, setFlipping] = useState<"left" | "right" | null>(null);
  const [flipProgress, setFlipProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        const doc = await pdfjsLib.getDocument({ url: newsletter.pdfPath }).promise;
        if (cancelled) return;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setLoading(false);
      } catch (e: any) {
        if (!cancelled) {
          setError("Failed to load PDF");
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [newsletter.pdfPath]);

  const renderPage = useCallback(async (num: number, canvas: HTMLCanvasElement) => {
    if (!pdfDoc) return;
    const page = await pdfDoc.getPage(num);
    const viewport = page.getViewport({ scale: 2.2 });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport }).promise;
  }, [pdfDoc]);

  const getVisiblePages = useCallback(() => {
    if (isMobile) return { left: null, right: currentPage };
    if (currentPage === 1) return { left: null, right: 1 };
    const left = currentPage % 2 === 0 ? currentPage : currentPage - 1;
    const right = left + 1;
    return {
      left: left <= totalPages ? left : null,
      right: right <= totalPages ? right : null
    };
  }, [isMobile, currentPage, totalPages]);

  useEffect(() => {
    if (!pdfDoc || loading) return;
    const { left, right } = getVisiblePages();
    if (left && leftCanvasRef.current) renderPage(left, leftCanvasRef.current);
    if (right && rightCanvasRef.current) renderPage(right, rightCanvasRef.current);
  }, [pdfDoc, currentPage, isMobile, loading, renderPage, getVisiblePages]);

  const animateFlip = useCallback((direction: "left" | "right", onComplete: () => void) => {
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
  }, []);

  const goNext = useCallback(() => {
    if (currentPage >= totalPages || flipping) return;
    animateFlip("right", () => {
      setCurrentPage(prev => {
        const step = isMobile ? 1 : (prev === 1 ? 1 : 2);
        return Math.min(prev + step, totalPages);
      });
    });
  }, [isMobile, totalPages, flipping, currentPage, animateFlip]);

  const goPrev = useCallback(() => {
    if (currentPage <= 1 || flipping) return;
    animateFlip("left", () => {
      setCurrentPage(prev => {
        const step = isMobile ? 1 : (prev <= 2 ? 1 : 2);
        return Math.max(prev - step, 1);
      });
    });
  }, [isMobile, flipping, currentPage, animateFlip]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "f") toggleFullscreen();
      if (e.key === "Escape" && isFullscreen) setIsFullscreen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, isFullscreen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(e => console.error(e));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const { left, right } = getVisiblePages();
  const flipDeg = flipping === "right" ? flipProgress * -180 : flipping === "left" ? -180 + flipProgress * 180 : 0;
  const shadeOpacity = Math.abs(Math.sin(flipProgress * Math.PI)) * 0.4;

  return (
    <section>
      {!isFullscreen && (
        <div className="text-center px-4 pt-10 pb-6 border-b-[3px] border-double border-[var(--rule)] bg-[var(--paper-dark)]">
          <p className="text-[0.65rem] tracking-[0.3em] uppercase text-[var(--accent)] mb-2">
            Issue #{newsletter.issue} · {newsletter.date}
          </p>
          <h2 className="text-[clamp(1.5rem,4vw,2.5rem)] font-bold m-0 mb-3 text-[var(--ink)]">
            {newsletter.title}
          </h2>
          <p className="max-w-[520px] mx-auto mb-5 text-[var(--muted)] text-[0.9rem] leading-relaxed italic">
            {newsletter.description}
          </p>
          
            <a href={newsletter.pdfPath}
              download
              className="inline-flex items-center gap-1.5 px-6 py-2 bg-[var(--ink)] text-[var(--paper)] no-underline text-[0.7rem] tracking-[0.15em] uppercase"
            >
            Download PDF
          </a>
        </div>
      )}

      <div
        ref={containerRef}
        className="flex flex-col items-center relative overflow-hidden box-border"
        style={{
          background: "#3a3530",
          padding: isFullscreen ? "1rem" : isMobile ? "1.5rem 1rem" : "3rem 2rem",
          height: isFullscreen ? "100vh" : "auto",
          minHeight: isFullscreen ? "unset" : "85vh",
        }}
      >
        <style>{`
          .page-turn-btn { background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); color: #fff; width: 48px; height: 48px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
          .page-turn-btn:hover:not(:disabled) { background: rgba(255,255,255,0.25); transform: scale(1.1); }
          .page-turn-btn:disabled { opacity: 0.2; }
          .fs-btn { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.18); color: rgba(255,255,255,0.7); padding: 0.35rem 0.85rem; border-radius: 4px; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; transition: 0.2s; }
          .fs-btn:hover { background: rgba(255,255,255,0.2); color: #fff; }
        `}</style>

        {/* Top Control Bar */}
        <div className="w-full max-w-[1200px] flex justify-end mb-4">
          <button className="fs-btn" onClick={toggleFullscreen}>
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
        </div>

        <div
          className="flex relative"
          style={{
            width: "100%",
            maxWidth: isMobile ? "450px" : "1200px",
            flex: isFullscreen ? "1" : "unset",
            aspectRatio: isFullscreen ? "unset" : isMobile ? "1 / 1.41" : "1.41 / 1",
            perspective: "2500px",
            boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
            marginBottom: isFullscreen ? "1rem" : "0",
          }}
        >
          {!isMobile && (
            <div
              className="flex-1 bg-white border-r border-black/10 relative"
              style={{
                transformOrigin: "right center",
                transform: flipping === "left" ? `rotateY(${flipDeg}deg)` : "none",
                zIndex: flipping === "left" ? 10 : 1,
                transformStyle: "preserve-3d",
              }}
            >
              {left
                ? <canvas ref={leftCanvasRef} className="w-full h-full object-contain" />
                : <div className="bg-[#f5f5f5] h-full" />
              }
              {flipping === "left" && (
                <div className="absolute inset-0 pointer-events-none" style={{ background: `rgba(0,0,0,${shadeOpacity})` }} />
              )}
            </div>
          )}

          <div
            className="flex-1 bg-white relative"
            style={{
              transformOrigin: "left center",
              transform: flipping === "right" ? `rotateY(${flipDeg}deg)` : "none",
              zIndex: flipping === "right" ? 10 : 1,
              transformStyle: "preserve-3d",
            }}
          >
            {right && <canvas ref={rightCanvasRef} className="w-full h-full object-contain" />}
            {flipping === "right" && (
              <div className="absolute inset-0 pointer-events-none" style={{ background: `rgba(0,0,0,${shadeOpacity})` }} />
            )}
          </div>

          <div onClick={goPrev} className="absolute left-0 w-1/4 h-full cursor-w-resize z-20" />
          <div onClick={goNext} className="absolute right-0 w-1/4 h-full cursor-e-resize z-20" />
        </div>

        <div
          className="flex items-center gap-6 text-white/60"
          style={{ marginTop: isFullscreen ? "auto" : "2.5rem", paddingBottom: isFullscreen ? "1rem" : "0" }}
        >
          <button className="page-turn-btn" onClick={goPrev} disabled={currentPage === 1 || !!flipping}>←</button>
          <span className="text-[0.7rem] tracking-[0.15em] min-w-[120px] text-center uppercase">
            {isMobile ? `PAGE ${currentPage}` : (currentPage === 1 ? "COVER" : `PAGES ${left}-${right}`)} / {totalPages}
          </span>
          <button className="page-turn-btn" onClick={goNext} disabled={currentPage >= totalPages || !!flipping}>→</button>
        </div>

        {!isFullscreen && (
          <p className="mt-6 text-white/20 text-[0.6rem] tracking-[0.2em] uppercase text-center">
            Arrow keys · Click page edges to flip · Press F for Fullscreen
          </p>
        )}
      </div>
    </section>
  );
}