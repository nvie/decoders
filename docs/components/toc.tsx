"use client";

import * as Primitive from "fumadocs-core/toc";
import { TOCScrollArea, useTOCItems } from "fumadocs-ui/components/toc";
import type { TOCProps } from "fumadocs-ui/layouts/docs/page/slots/toc";
import { Text } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

/** Vertical span of each item's link, keyed by its anchor URL. */
type Spans = Map<string, [top: number, bottom: number]>;

/**
 * Table of contents for the docs sidebar: a flat vertical rail with a sliding
 * indicator for the heading you're currently reading.
 *
 * The provider tracks every heading that's in view. Which one of those counts
 * as "current" is decided here -- the topmost one -- rather than by the
 * provider's `single` mode, which latches items it rules out and can leave them
 * stale until the next full reload.
 */
export function TOC({ container, header, footer }: TOCProps) {
  const items = useTOCItems();
  const activeUrl = Primitive.useItems().find((info) => info.active)?.original
    .url;

  if (items.length === 0 && !header && !footer) {
    return (
      <div
        id="nd-toc-placeholder"
        className="hidden xl:layout:[--fd-toc-width:268px]"
      />
    );
  }

  return (
    <div
      id="nd-toc"
      {...container}
      className="sticky top-(--fd-docs-row-1) h-[calc(var(--fd-docs-height)-var(--fd-docs-row-1))] flex flex-col [grid-area:toc] w-(--fd-toc-width) pt-12 pe-4 pb-2 xl:layout:[--fd-toc-width:268px] max-xl:hidden"
    >
      {header}
      <h3
        id="toc-title"
        className="inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground"
      >
        <Text className="size-4" />
        On this page
      </h3>
      <TOCScrollArea>
        <TOCItems activeUrl={activeUrl}>
          {items.map((item) => (
            <TOCItem
              key={item.url}
              item={item}
              active={item.url === activeUrl}
            />
          ))}
        </TOCItems>
      </TOCScrollArea>
      {footer}
    </div>
  );
}

function TOCItems({
  activeUrl,
  children,
}: {
  activeUrl: string | undefined;
  children: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const items = useTOCItems();
  const [spans, setSpans] = useState<Spans | null>(null);

  const onMeasure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const next: Spans = new Map();
    for (const item of items) {
      const element = container.querySelector<HTMLElement>(
        `a[href="${item.url}"]`,
      );
      if (!element) continue;

      const styles = getComputedStyle(element);
      next.set(item.url, [
        element.offsetTop + parseFloat(styles.paddingTop),
        element.offsetTop +
          element.clientHeight -
          parseFloat(styles.paddingBottom),
      ]);
    }

    setSpans(next.size > 0 ? next : null);
  }, [items]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(onMeasure);
    observer.observe(container);
    onMeasure();
    return () => observer.disconnect();
  }, [onMeasure]);

  const span = activeUrl ? spans?.get(activeUrl) : undefined;

  return (
    <div className="relative">
      <div
        className="absolute inset-y-0 inset-s-0 w-px bg-fd-primary transition-[clip-path]"
        style={{
          clipPath: `polygon(0 ${span?.[0] ?? 0}px, 100% ${span?.[0] ?? 0}px, 100% ${span?.[1] ?? 0}px, 0 ${span?.[1] ?? 0}px)`,
        }}
      />
      <div
        ref={containerRef}
        className="flex flex-col border-s border-fd-foreground/10"
      >
        {children}
      </div>
    </div>
  );
}

function TOCItem({
  item,
  active,
}: {
  item: Primitive.TOCItemType;
  active: boolean;
}) {
  return (
    <Primitive.TOCItem
      href={item.url}
      data-active={active}
      className={`prose py-1.5 text-sm text-fd-muted-foreground scroll-m-4 transition-colors wrap-anywhere first:pt-0 last:pb-0 data-[active=true]:text-fd-primary hover:text-fd-accent-foreground ${
        item.depth <= 2 ? "ps-3" : item.depth === 3 ? "ps-6" : "ps-8"
      }`}
    >
      {item.title}
    </Primitive.TOCItem>
  );
}
