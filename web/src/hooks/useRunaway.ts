import { useEffect } from "react";
import { gsap } from "gsap";

export function useRunawayCard(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current!;
    if (!el) return;

    // cache dimensions
    let rect = el.getBoundingClientRect();

    function updateRect() {
      rect = el.getBoundingClientRect();
    }

    // keep rect updated on resize
    window.addEventListener("resize", updateRect);

    const threshold = 200; // distance before dodging
    const dodgeAmount = 400; // how far it slides away

    function handleMouseMove(e: MouseEvent) {
      if (!el) return;

      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      const dist = Math.hypot(dx, dy);

      if (dist < threshold) {
        // normalized "away" vector
        const ux = -dx / dist;
        const uy = -dy / dist;

        const slideX = ux * dodgeAmount;
        const slideY = uy * dodgeAmount;

        gsap.to(el, {
          x: slideX,
          y: slideY,
          duration: 0.25,
          ease: "power2.out",
        });
      } else {
        // glide back to center when cursor leaves the zone
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.35,
          ease: "power3.out",
        });
      }
    }

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", updateRect);
    };
  }, [ref]);
}
