"use client";

import { useCallback, useImperativeHandle, useRef } from "react";
import confetti from "canvas-confetti";

export interface ConfettiRef {
  fire: (options?: confetti.Options) => void;
}

interface ConfettiProps {
  options?: confetti.Options;
  globalOptions?: confetti.GlobalOptions;
  manualstart?: boolean;
  children?: React.ReactNode;
}

export default function Confetti({
  options,
  globalOptions = { resize: true, useWorker: true },
  manualstart = false,
  children,
  ...props
}: ConfettiProps & React.RefAttributes<ConfettiRef>) {
  const instanceRef = useRef<confetti.CreateTypes | null>(null);

  const canvasRef = useCallback(
    (node: HTMLCanvasElement) => {
      if (node !== null) {
        if (instanceRef.current) return; // if not already created

        instanceRef.current = confetti.create(node, {
          ...globalOptions,
          resize: true,
        });
      } else if (instanceRef.current) {
          instanceRef.current.reset();
          instanceRef.current = null;
        }
    },
    [globalOptions],
  );

  const fire = useCallback(
    (opts = {}) => {
      if (instanceRef.current) {
        instanceRef.current({
          ...options,
          ...opts,
        });
      }
    },
    [options],
  );

  const handleClick = useCallback(() => {
    fire();
  }, [fire]);

  useImperativeHandle(props.ref, () => ({
    fire,
  }));

  useEffect(() => {
    if (!manualstart) {
      fire();
    }
  }, [manualstart, fire]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      />
      {children && (
        <div onClick={handleClick} className="contents">
          {children}
        </div>
      )}
    </>
  );
}

export function ConfettiButton({
  options,
  children,
  ...props
}: {
  options?: confetti.Options & {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    flat?: boolean;
    ticks?: number;
    origin?: {
      x?: number;
      y?: number;
    };
    colors?: string[];
    shapes?: confetti.Shape[];
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
  };
  children?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x, y },
      ...options,
    });
    props.onClick?.(event);
  };

  return (
    <button {...props} onClick={handleClick}>
      {children}
    </button>
  );
}