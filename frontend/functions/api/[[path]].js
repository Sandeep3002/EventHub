export async function onRequest(context) {
  const url = new URL(context.request.url);
  const backendBase = context.env.BACKEND_URL || "https://eventhub-backend.onrender.com";
  
  // Construct the target URL pointing to your backend
  const targetUrl = new URL(url.pathname + url.search, backendBase);

  // Forward the request preserving method, headers, and body
  const newRequest = new Request(targetUrl.toString(), context.request);

  try {
    return await fetch(newRequest);
  } catch (error) {
    return new Response(JSON.stringify({ detail: "Backend service unreachable" }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
}
