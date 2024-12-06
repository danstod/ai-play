import { NextResponse } from "next/server";

const PERPLEXITY_API_KEY =
  "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";
const token = PERPLEXITY_API_KEY; //process.env.PERPLEXITY_API_KEY;

export const runtime = "edge";

export async function POST(req, res) {
  const {
    systemPrompt = "Be precise and concise.",
    userPrompt,
    model = "llama-3.1-sonar-small-128k-online",
  } = await req.json();

  /*
      The search_domain_filter option is in closed beta
      "search_domain_filter":["https://www.bbc.com/news"]}
     */
  const body = `{"model":"${model}","messages":[{"content":"${systemPrompt}","role":"system"},{"content": "${userPrompt}","role":"user"}]}`;
  console.log("PerplexityRequest.body", JSON.parse(body));

  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body,
    signal: AbortSignal.timeout(60 * 3 * 1000),
  };

  const requestStart = new Date();
  let response;

  try {
    response = await fetch(
      "https://api.perplexity.ai/chat/completions",
      options,
    );
  } catch (err) {
    console.log("fetch.err", err);
    // throw new Error('Internal Server Error');
    return NextResponse.json(
      {
        success: false,
        error: {
          message: err.message,
          code: "INTERNAL_SERVER_ERROR",
        },
      },
      { status: 500 }, // HTTP status code for server error
      // { error: "Perplexity API request failed" + err?.message },
      // { status: response.status },
    );
  }

  // if (!response.ok) {
  //   return NextResponse.json(
  //     { error: "Perplexity API request failed" },
  //     { status: response.status },
  //   );
  // }

  const result = await response.json();

  result.requestStart = requestStart;
  result.requestEnd = new Date();
  console.log("PerplexityResponse", result);
  // // return res.status(200).json(result);
  // return result;
  return NextResponse.json(result);
}
