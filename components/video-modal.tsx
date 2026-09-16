'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { useLanguage } from '@/components/language-context';
import { EditorialArrow } from '@/components/editorial-arrow';
import { track } from '@/lib/analytics';
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock';

export function VideoModal({
  src,
  poster,
  label,
  preview = false,
}: {
  src: string;
  poster: string;
  label: string;
  preview?: boolean;
}) {
  const { copy } = useLanguage();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  useBodyScrollLock(open);
  useEffect(() => {
    if (!open) return;
    const triggerNode = trigger.current;
    const focusFrame = window.requestAnimationFrame(() =>
      dialog.current?.querySelector<HTMLButtonElement>('button')?.focus(),
    );
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const items = [
        ...(dialog.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled])',
        ) || []),
      ];
      if (!items.length) return;
      const first = items[0];
      const last = items.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener('keydown', onKey);
      triggerNode?.focus();
    };
  }, [open]);
  useEffect(() => {
    const node = trigger.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setMounted(true),
      { rootMargin: '240px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <button
        ref={trigger}
        className={
          preview ? 'video-trigger video-trigger-preview' : 'video-trigger'
        }
        onClick={() => {
          setMounted(true);
          setFailed(false);
          setOpen(true);
          track('video_play', { label });
        }}
        aria-label={`${copy.actions.play}: ${label}`}
      >
        {preview ? (
          <>
            <span className="video-preview-frame">
              <Image src={poster} alt="" fill sizes="420px" />
              <i aria-hidden="true">▶</i>
            </span>
            <span className="video-preview-action">
              <b>{copy.actions.play}</b>
              <EditorialArrow />
            </span>
          </>
        ) : (
          <>
            <span className="video-play-icon">▶</span>
            <b>{copy.actions.play}</b>
          </>
        )}
      </button>
      {typeof document !== 'undefined'
        ? createPortal(
            <AnimatePresence>
              {open && (
                <motion.dialog
                  ref={dialog}
                  open
                  className="video-modal"
                  aria-modal="true"
                  aria-label={label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <button
                    className="video-close"
                    onClick={() => setOpen(false)}
                  >
                    {copy.actions.close} ×
                  </button>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    {mounted && !failed && (
                      <video
                        ref={video}
                        src={src}
                        poster={poster}
                        autoPlay
                        muted={muted}
                        playsInline
                        preload="metadata"
                        onPlay={() => setPlaying(true)}
                        onPause={() => setPlaying(false)}
                        onEnded={() => {
                          setPlaying(false);
                          track('video_complete', { label });
                        }}
                        onError={() => {
                          setPlaying(false);
                          setFailed(true);
                        }}
                      >
                        <track
                          kind="captions"
                          src="/assets/captions/campaign-en.vtt"
                          srcLang="en"
                          label="English"
                        />
                      </video>
                    )}
                    {failed && (
                      <output className="video-fallback">
                        <Image src={poster} alt="" fill sizes="100vw" />
                        <p>{copy.actions.videoUnavailable}</p>
                      </output>
                    )}
                    <div className="video-controls">
                      <button
                        disabled={failed}
                        onClick={() => {
                          const node = video.current;
                          if (!node) return;
                          if (node.paused) void node.play();
                          else node.pause();
                        }}
                      >
                        {playing
                          ? copy.actions.pause || 'Pause'
                          : copy.actions.play}
                      </button>
                      <button
                        disabled={failed}
                        onClick={() => {
                          const node = video.current;
                          if (!node) return;
                          node.muted = !node.muted;
                          setMuted(node.muted);
                        }}
                      >
                        {muted
                          ? copy.actions.unmute || 'Unmute'
                          : copy.actions.mute || 'Mute'}
                      </button>
                      <button
                        disabled={failed}
                        onClick={() =>
                          void video.current?.requestFullscreen?.()
                        }
                      >
                        {copy.actions.fullscreen}
                      </button>
                    </div>
                  </motion.div>
                </motion.dialog>
              )}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}
