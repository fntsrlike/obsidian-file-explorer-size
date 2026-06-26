export interface CacheLinkLike {
  link: string;
}

export interface NoteCacheLike {
  embeds?: CacheLinkLike[];
  links?: CacheLinkLike[];
}

export interface ExtractedNoteLink {
  linktext: string;
  embedded: boolean;
}

function isExternalLink(link: string): boolean {
  return /^[a-z][a-z\d+.-]*:/i.test(link);
}

export function extractNoteGroupLinksFromCache(
  cache: NoteCacheLike | null | undefined
): ExtractedNoteLink[] {
  const links: ExtractedNoteLink[] = [];
  for (const embed of cache?.embeds ?? []) {
    if (!isExternalLink(embed.link)) {
      links.push({ linktext: embed.link, embedded: true });
    }
  }
  for (const link of cache?.links ?? []) {
    if (!isExternalLink(link.link)) {
      links.push({ linktext: link.link, embedded: false });
    }
  }
  return links;
}

