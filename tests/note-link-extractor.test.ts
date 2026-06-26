import { describe, expect, it } from "vitest";
import { extractNoteGroupLinksFromCache } from "../src/services/note-link-extractor";

describe("extractNoteGroupLinksFromCache", () => {
  it("marks embeds as embedded and normal links as non-embedded", () => {
    const links = extractNoteGroupLinksFromCache({
      embeds: [{ link: "image.png" }],
      links: [{ link: "slides.pdf" }, { link: "other.md" }]
    });

    expect(links).toEqual([
      { linktext: "image.png", embedded: true },
      { linktext: "slides.pdf", embedded: false },
      { linktext: "other.md", embedded: false }
    ]);
  });

  it("ignores external urls", () => {
    const links = extractNoteGroupLinksFromCache({
      embeds: [{ link: "https://example.com/image.png" }],
      links: [{ link: "local.pdf" }]
    });

    expect(links).toEqual([{ linktext: "local.pdf", embedded: false }]);
  });
});

