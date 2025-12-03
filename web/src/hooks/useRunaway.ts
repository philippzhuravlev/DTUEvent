import { useEffect } from "react";
import { gsap } from "gsap";

interface RunawayOptions {
  threshold?: number;    // distance before dodging
  dodgeAmount?: number;  // how far it slides away
  rotationSpeed?: number; // degrees per second
}

export function useRunawayCard(
  ref: React.RefObject<HTMLElement | null>,
  options: RunawayOptions = {}
) {
  const { threshold = 200, dodgeAmount = 400, rotationSpeed = 100000000 } = options; // 90 deg/sec default

  useEffect(() => {
    const el = ref.current!;
    if (!el) return;

    let rect = el.getBoundingClientRect();

    function updateRect() {
      rect = el.getBoundingClientRect();
    }

    // Start continuous rotation
    const rotationTween = gsap.to(el, {
      rotation: 360,
      duration: 360 / rotationSpeed, // full rotation duration in seconds
      ease: "linear",
      repeat: -1, // infinite loop
    });

    function handleMouseMove(e: MouseEvent) {
      if (!el) return;

      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      let dx = e.clientX - cx;
      let dy = e.clientY - cy;

      const scaleX = rect.width / Math.max(rect.width, rect.height);
      const scaleY = rect.height / Math.max(rect.width, rect.height);

      dx *= scaleX;
      dy *= scaleY;

      const dist = Math.hypot(dx, dy);

      if (dist < threshold) {
        const ux = -dx / dist;
        const uy = -dy / dist;

        gsap.to(el, {
          x: ux * dodgeAmount,
          y: uy * dodgeAmount,
          duration: 0.25,
          ease: "power2.out",
        });
      } else {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.35,
          ease: "power3.out",
        });
      }
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", updateRect);

    return () => {
      rotationTween.kill(); // stop rotation
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", updateRect);
    };
  }, [ref, threshold, dodgeAmount, rotationSpeed]);
}
