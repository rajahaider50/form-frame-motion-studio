"use client";

import { useEffect, useRef, useState } from "react";
import { AudioLines, VolumeX } from "lucide-react";

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

function playTone(contextRef: React.MutableRefObject<AudioContext | null>, x = 0.65) {
  const AudioContextConstructor = window.AudioContext || (window as AudioWindow).webkitAudioContext;
  if (!AudioContextConstructor) return;
  const context = contextRef.current ?? new AudioContextConstructor();
  contextRef.current = context;
  if (context.state === "suspended") void context.resume();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const panner = context.createStereoPanner();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(440 + Math.round(x * 150), context.currentTime);
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.018, context.currentTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.11);
  panner.pan.setValueAtTime((x - 0.5) * 0.7, context.currentTime);
  oscillator.connect(gain).connect(panner).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.12);
}

export function SoundToggle() {
  const [enabled, setEnabled] = useState(false);
  const contextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest("[data-sonic='true']")) return;
      const x = Math.max(0, Math.min(1, event.clientX / window.innerWidth));
      playTone(contextRef, x);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [enabled]);

  return (
    <button
      type="button"
      className={`sound-toggle${enabled ? " sound-toggle--on" : ""}`}
      aria-pressed={enabled}
      aria-label={enabled ? "Turn spatial interface sounds off" : "Turn spatial interface sounds on"}
      title={enabled ? "Interface sound on" : "Interface sound off"}
      onClick={() => {
        const next = !enabled;
        setEnabled(next);
        if (next) playTone(contextRef, 0.7);
      }}
    >
      {enabled ? <AudioLines size={16} aria-hidden="true" /> : <VolumeX size={16} aria-hidden="true" />}
      <span className="sound-toggle__label">Sound {enabled ? "on" : "off"}</span>
    </button>
  );
}
