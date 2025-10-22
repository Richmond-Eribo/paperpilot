import { NextRequest } from "next/server"
import {
  BedrockAgentCoreClient,
  InvokeAgentRuntimeCommand,
} from "@aws-sdk/client-bedrock-agentcore"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// AgentCore HTTP proxy: forwards prompt to your AgentCore endpoint and streams back the response
export async function POST(req: NextRequest) {
  try {
    const { prompt, sessionId, qualifier } = await req.json().catch(() => ({}))
    if (!prompt || typeof prompt !== "string") {
      return new Response("Missing prompt", { status: 400 })
    }

    const region = process.env.AWS_REGION
    const agentRuntimeArn = process.env.AGENTCORE_RUNTIME_ARN
    const runtimeQualifier =
      qualifier || process.env.AGENTCORE_QUALIFIER || "DEFAULT"

    if (!region || !agentRuntimeArn) {
      return new Response(
        "Missing AWS config (AWS_REGION, AGENTCORE_RUNTIME_ARN)",
        { status: 500 }
      )
    }

    const client = new BedrockAgentCoreClient({ region })
    const payload = new TextEncoder().encode(`{ "prompt": "${prompt}" }`)
    // Ensure runtimeSessionId meets AgentCore min length (>= 33)
    const runtimeSessionId =
      typeof sessionId === "string" && sessionId.length >= 33
        ? sessionId
        : globalThis.crypto?.randomUUID?.() ??
          `session-${Date.now()}-xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`

    const command = new InvokeAgentRuntimeCommand({
      agentRuntimeArn,
      runtimeSessionId,
      qualifier: runtimeQualifier,
      payload,
    })

    const resp = await client.send(command)
    // console.log(resp)
    const body: any = (resp as any).response

    const extractMarkdown = (raw: string): string => {
      try {
        const data = JSON.parse(raw)
        if (typeof data === "string") return data
        if (typeof data?.response === "string") return data.response
        if (typeof data?.output === "string") return data.output
        if (typeof data?.message === "string") return data.message
        // If it's an object, pretty print as markdown code block
        return "```json\n" + JSON.stringify(data, null, 2) + "\n```"
      } catch {
        return raw
      }
    }

    if (body?.transformToString) {
      const text = await body.transformToString()
      const content = extractMarkdown(text)
      return new Response(content, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      })
    }

    if (body?.getReader) {
      return new Response(body as ReadableStream, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      })
    }

    if (body?.transformToByteArray) {
      const bytes = await body.transformToByteArray()
      const text = new TextDecoder().decode(bytes)
      const content = extractMarkdown(text)
      return new Response(content, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      })
    }

    return new Response(JSON.stringify(resp), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (e: any) {
    return new Response(e?.message ?? "Agent request failed", { status: 500 })
  }
}
