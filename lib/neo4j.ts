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
  id: string // Uniquely identifies each GraphNode. Example: Node-1, Node-2, Node-3, ...
  title: string
  type: "current" | "halakhic" | "aggadic" | "lexical" | "responsa" | "commentary" | "mishnah" | "talmud" | "kabbalah"
    
  snippet: string
  content?: string // Full text content
  url?: string

  color?: string

  metadata: {
    genre?: string
    author?: string
    timePeriod?: string
  }

  simulation?: {
    x?: number
    y?: number
    vx?: number
    vy?: number
    fx?: number | null
    fy?: number | null
  }
}

export type GraphLink = {
  id: string // Uniquely identifies each GraphLink. Example: Link-1, Link-2, Link-3, ...
  source: string | GraphNode // ID of Source GraphNode or node object after D3 processes
  target: string | GraphNode // ID of Target GraphNode or node object after D3 processes
  type: "explicit"
  
  strength: number
  weight?: number

  simulation?: {
    index?: number
    distance?: number
  }
}

export type GraphData = {
  nodes: GraphNode[]
  links: GraphLink[]
}

function toGraphNode(node: any): GraphNode {
  const props = (node && node.properties) || {}
  const title = props.title || props.id || "Unknown"
  const rawType = (props.type || "commentary").toString().toLowerCase()
  const allowedTypes = ["current","halakhic","aggadic","lexical","responsa","commentary","mishnah","talmud","kabbalah"] as const
  const normalizedType = (allowedTypes.includes(rawType as any) ? rawType : "commentary") as GraphNode["type"]
  return {
    id: props.id || title,
    title,
    type: normalizedType,
    snippet: props.snippet || props.summary || "",
    content: props.content || props.fullText || undefined,
    url: props.url || undefined,
    color: props.color || undefined,
    metadata: {
      author: props.author || undefined,
      timePeriod: props.timePeriod || props.period || undefined,
      genre: props.genre || undefined,
    },
  }
}

export async function fetchConnectionsForVerse(verseId: string): Promise<GraphData> {
  const driver = getDriver()
  const session: Session = driver.session()
  try {
    const result = await session.run(
      `MATCH (n {id: $id})-[r]-(connected)
       RETURN connected, r AS rel, type(r) AS relType,
              CASE WHEN startNode(r) = n THEN 'out' ELSE 'in' END AS dir
       LIMIT 20`,
      { id: verseId }
    )

    console.log(result);

    // Create a center node representing the selected verse
    const centerNode: GraphNode = {
      id: verseId,
      title: verseId,
      type: "current",
      snippet: "Selected verse",
      metadata: {},
    }

    const nodes: GraphNode[] = [centerNode]
    const links: GraphLink[] = []
    const nodeById = new Map<string, GraphNode>()
    nodeById.set(centerNode.id, centerNode)

    let linkIdCounter = 0

    for (const record of result.records) {
      const neoNode = record.get("connected")
      if (!neoNode) continue
      const connectedNode = toGraphNode(neoNode)

      // Map relationship properties onto node metadata for filtering
      const rel: any = record.get("rel")
      const relProps = (rel && rel.properties) || {}
      if (relProps.category && !connectedNode.metadata.genre) {
        connectedNode.metadata.genre = relProps.category
      }
      if (relProps.author_en && !connectedNode.metadata.author) {
        connectedNode.metadata.author = relProps.author_en
      }
      if (relProps.timePeriod && !connectedNode.metadata.timePeriod) {
        connectedNode.metadata.timePeriod = relProps.timePeriod
      }
      if (!nodeById.has(connectedNode.id)) {
        nodeById.set(connectedNode.id, connectedNode)
        nodes.push(connectedNode)
      }

      const dir = (record.get("dir") || "out").toString()
      
      const link: GraphLink = dir === "out"
        ? { 
            id: `link-${linkIdCounter++}`, 
            source: centerNode.id, 
            target: connectedNode.id, 
            type: "explicit", 
            strength: 0.7 
          }
        : { 
            id: `link-${linkIdCounter++}`, 
            source: connectedNode.id, 
            target: centerNode.id, 
            type: "explicit", 
            strength: 0.7 
          }
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