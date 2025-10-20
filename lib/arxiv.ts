export interface ArxivPaper {
  id: string
  title: string
  summary: string
  authors: Array<{ name: string; affiliation?: string }>
  published: string
  updated: string
  categories: string[]
  pdfLink: string
  htmlLink: string
  doi?: string
  journalRef?: string
  comment?: string
}

export function parseArxivXML(xmlText: string): ArxivPaper[] {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlText, "text/xml")
  const entries = xmlDoc.getElementsByTagName("entry")
  const papers: ArxivPaper[] = []

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]

    const id = entry.getElementsByTagName("id")[0]?.textContent || ""
    const title =
      entry.getElementsByTagName("title")[0]?.textContent?.trim() || ""
    const summary =
      entry.getElementsByTagName("summary")[0]?.textContent?.trim() || ""
    const published =
      entry.getElementsByTagName("published")[0]?.textContent || ""
    const updated = entry.getElementsByTagName("updated")[0]?.textContent || ""

    const authorElements = entry.getElementsByTagName("author")
    const authors: Array<{ name: string; affiliation?: string }> = []
    for (let j = 0; j < authorElements.length; j++) {
      const name =
        authorElements[j].getElementsByTagName("name")[0]?.textContent || ""
      const affiliationEl = authorElements[j].getElementsByTagNameNS(
        "http://arxiv.org/schemas/atom",
        "affiliation"
      )[0]
      const affiliation = affiliationEl?.textContent || undefined
      authors.push({ name, affiliation })
    }

    const categoryElements = entry.getElementsByTagName("category")
    const categories: string[] = []
    for (let j = 0; j < categoryElements.length; j++) {
      const term = categoryElements[j].getAttribute("term")
      if (term) categories.push(term)
    }

    const linkElements = entry.getElementsByTagName("link")
    let pdfLink = ""
    let htmlLink = ""
    for (let j = 0; j < linkElements.length; j++) {
      const title = linkElements[j].getAttribute("title")
      const href = linkElements[j].getAttribute("href") || ""
      if (title === "pdf") {
        pdfLink = href
      } else if (linkElements[j].getAttribute("rel") === "alternate") {
        htmlLink = href
      }
    }

    const doiEl = entry.getElementsByTagNameNS(
      "http://arxiv.org/schemas/atom",
      "doi"
    )[0]
    const doi = doiEl?.textContent || undefined

    const journalRefEl = entry.getElementsByTagNameNS(
      "http://arxiv.org/schemas/atom",
      "journal_ref"
    )[0]
    const journalRef = journalRefEl?.textContent || undefined

    const commentEl = entry.getElementsByTagNameNS(
      "http://arxiv.org/schemas/atom",
      "comment"
    )[0]
    const comment = commentEl?.textContent || undefined

    papers.push({
      id,
      title,
      summary,
      authors,
      published,
      updated,
      categories,
      pdfLink,
      htmlLink,
      doi,
      journalRef,
      comment,
    })
  }

  return papers
}

export async function fetchArxivPapers(query: string): Promise<ArxivPaper[]> {
  const response = await fetch(
    `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(
      query
    )}&start=0&max_results=7`
  )

  if (!response.ok) {
    throw new Error("Failed to search papers")
  }

  const xmlText = await response.text()
  return parseArxivXML(xmlText)
}
