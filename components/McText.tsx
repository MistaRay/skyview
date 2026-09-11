// Renders a string containing Minecraft § formatting codes as colored spans.

import { Fragment } from "react";

const MC_COLORS: Record<string, string> = {
  "0": "#000000",
  "1": "#0000AA",
  "2": "#00AA00",
  "3": "#00AAAA",
  "4": "#AA0000",
  "5": "#AA00AA",
  "6": "#FFAA00",
  "7": "#AAAAAA",
  "8": "#555555",
  "9": "#5555FF",
  a: "#55FF55",
  b: "#55FFFF",
  c: "#FF5555",
  d: "#FF55FF",
  e: "#FFFF55",
  f: "#FFFFFF",
};

export default function McText({ text, className = "" }: { text: string; className?: string }) {
  const parts = text.split(/(§.)/);
  let color = "#AAAAAA";
  let bold = false;
  let italic = false;
  let underline = false;
  let strike = false;

  const rendered = parts.map((part, i) => {
    if (part.startsWith("§") && part.length === 2) {
      const code = part[1].toLowerCase();
      if (MC_COLORS[code]) {
        color = MC_COLORS[code];
        bold = italic = underline = strike = false;
      } else if (code === "l") bold = true;
      else if (code === "o") italic = true;
      else if (code === "n") underline = true;
      else if (code === "m") strike = true;
      else if (code === "r") {
        color = "#AAAAAA";
        bold = italic = underline = strike = false;
      }
      return null;
    }
    if (!part) return null;
    return (
      <span
        key={i}
        style={{
          color,
          fontWeight: bold ? 700 : undefined,
          fontStyle: italic ? "italic" : undefined,
          textDecoration:
            [underline && "underline", strike && "line-through"].filter(Boolean).join(" ") || undefined,
        }}
      >
        {part}
      </span>
    );
  });

  return <span className={className}>{rendered.map((r, i) => <Fragment key={i}>{r}</Fragment>)}</span>;
}
