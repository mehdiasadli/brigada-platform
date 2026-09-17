export type OpenLibrarySearchHit = {
  olibKey: string;
  title: string;
  author: string | null;
  pageCount: number | null;
  firstPublishYear: number | null;
  subtitle: string | null;
  coverId: number | null;
};

export type OpenLibrarySearch = {
  search(query: string): Promise<OpenLibrarySearchHit[]>;
};

type OpenLibraryDoc = {
  key?: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  number_of_pages_median?: number;
  cover_i?: number;
  subtitle?: string;
};

type OpenLibrarySearchResponse = {
  docs?: OpenLibraryDoc[];
};

export class OpenLibraryClient implements OpenLibrarySearch {
  async search(query: string): Promise<OpenLibrarySearchHit[]> {
    const url = new URL("https://openlibrary.org/search.json");
    url.searchParams.set("q", query);
    url.searchParams.set("limit", "10");
    url.searchParams.set(
      "fields",
      "key,title,author_name,first_publish_year,number_of_pages_median,cover_i,subtitle",
    );

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("OpenLibrary search failed");
    }

    const body = (await response.json()) as OpenLibrarySearchResponse;
    return (body.docs ?? []).flatMap((doc) => {
      if (!doc.key || !doc.title) {
        return [];
      }

      return [
        {
          olibKey: doc.key,
          title: doc.title,
          author: doc.author_name?.[0] ?? null,
          pageCount: doc.number_of_pages_median ?? null,
          firstPublishYear: doc.first_publish_year ?? null,
          subtitle: doc.subtitle ?? null,
          coverId: doc.cover_i ?? null,
        },
      ];
    });
  }
}
