import neo4j, { Driver, Session } from "neo4j-driver"

// NOTE: In a production app, do NOT expose credentials in the browser.
// These are provided by the user for direct browser connection.
const NEO4J_URI = (process.env.NEXT_PUBLIC_NEO4J_URI || "neo4j+s://8260863b.databases.neo4j.io").trim()
const NEO4J_USER = process.env.NEXT_PUBLIC_NEO4J_USER || "neo4j"
const NEO4J_PASSWORD = process.env.NEXT_PUBLIC_NEO4J_PASSWORD || "IJYDpas_0uO5jbjB6Upk7uiEn_Gs-nb9vyO3oUH6v5c"

let cachedDriver: Driver | null = null

function getDriver(): Driver {
  if (cachedDriver) return cachedDriver
  cachedDriver = neo4j.driver(
    NEO4J_URI,
    neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD),
    {
      // Make integers plain JS numbers for convenience in the UI
      disableLosslessIntegers: true,
    } as any
  )
  return cachedDriver
}

export type GraphNode = {
  id: string
  title: string
  type: "current" | "halakhic" | "aggadic" | "lexical" | "responsa" | "commentary" | "mishnah"
  snippet: string
  author?: string
  timePeriod?: string
  genre?: string
}

export type GraphLink = {
  source: string
  target: string
  type: "halakhic" | "aggadic" | "lexical" | "responsa"
  strength: number
  snippet?: string
}

export type GraphData = {
  nodes: GraphNode[]
  links: GraphLink[]
}

function toGraphNode(node: any): GraphNode {
  const props = (node && node.properties) || {}
  const title = props.title || props.id || "Unknown"
  const rawType = (props.type || "commentary").toString().toLowerCase()
  const allowedTypes = ["current","halakhic","aggadic","lexical","responsa","commentary","mishnah"] as const
  const normalizedType = (allowedTypes.includes(rawType as any) ? rawType : "commentary") as GraphNode["type"]
  return {
    id: props.id || title,
    title,
    type: normalizedType,
    snippet: props.snippet || props.summary || "",
    author: props.author || undefined,
    timePeriod: props.timePeriod || props.period || undefined,
    genre: props.genre || undefined,
  }
}

export async function fetchConnectionsForVerse(verseId: string): Promise<GraphData> {
  const driver = getDriver()
  const session: Session = driver.session()
  try {
    const result = await session.run(
      `MATCH (n {id: $id})-[r]-(connected)
       RETURN connected, type(r) AS relType,
              CASE WHEN startNode(r) = n THEN 'out' ELSE 'in' END AS dir`,
      { id: verseId }
    )

    // Create a center node representing the selected verse
    const centerNode: GraphNode = {
      id: verseId,
      title: verseId,
      type: "current",
      snippet: "Selected verse",
    }

    const nodes: GraphNode[] = [centerNode]
    const links: GraphLink[] = []
    const nodeById = new Map<string, GraphNode>()
    nodeById.set(centerNode.id, centerNode)

    for (const record of result.records) {
      const neoNode = record.get("connected")
      if (!neoNode) continue
      const connectedNode = toGraphNode(neoNode)
      if (!nodeById.has(connectedNode.id)) {
        nodeById.set(connectedNode.id, connectedNode)
        nodes.push(connectedNode)
      }

      const dir = (record.get("dir") || "out").toString()
      const relTypeRaw = (record.get("relType") || "").toString().toLowerCase()
      const allowedLinkTypes = new Set(["halakhic","aggadic","lexical","responsa"]) as Set<GraphLink["type"]>
      const mappedType = (allowedLinkTypes.has(relTypeRaw as any) ? relTypeRaw : "lexical") as GraphLink["type"]

      const link: GraphLink = dir === "out"
        ? { source: centerNode.id, target: connectedNode.id, type: mappedType, strength: 0.7, snippet: connectedNode.snippet }
        : { source: connectedNode.id, target: centerNode.id, type: mappedType, strength: 0.7, snippet: connectedNode.snippet }
      links.push(link)
    }

    return {
      nodes,
      links,
    }
  } finally {
    await session.close()
    // Keep driver open and cached for reuse
  }
}


