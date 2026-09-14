import { sendJson } from "../utils/http.js";

export async function fetchPreview(response, url, fetchImpl) {
  const target = url.searchParams.get("url");

  if (!target) {
    sendJson(response, 400, { error: "url is required" });
    return;
  }

  const upstream = await fetchImpl(target, {
    redirect: "follow",
    signal: AbortSignal.timeout(3000),
  });
  const body = (await upstream.text()).slice(0, 4000);

  sendJson(response, 200, {
    status: upstream.status,
    finalUrl: upstream.url,
    body,
  });
}

