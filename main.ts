Deno.serve((req: Request) => {
  const url = new URL(req.url);
  const target = "https://nikehub.pages.dev";
  const path = url.pathname + url.search;
  const targetUrl = new URL(path, target).toString();

  const headers = new Headers(req.headers);
  headers.delete("cf-connecting-ip"); // if any
  headers.set("referer", target);
  headers.set("origin", target);

  return fetch(targetUrl, {
    method: req.method,
    headers,
    redirect: "follow",
    body: req.body,
  }).then(async (res) => {
    let body = await res.text();

    // rewrite absolute urls to your deno domain
    const proxyOrigin = url.origin;
    const targetHost = new URL(target).host;
    body = body.replace(
      new RegExp(`https?://${targetHost.replace('.', '\\.')}`, 'gi'),
      proxyOrigin
    );
    body = body.replace(
      new RegExp(`//${targetHost.replace('.', '\\.')}`, 'gi'),
      `//${url.host}`
    );

    const newHeaders = new Headers(res.headers);
    newHeaders.set("Access-Control-Allow-Origin", "*");
    newHeaders.set("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS");
    newHeaders.delete("x-frame-options");
    newHeaders.delete("content-security-policy");
    newHeaders.set("x-frame-options", "ALLOW");
    newHeaders.set("cache-control", "no-store, no-cache");

    return new Response(body, {
      status: res.status,
      headers: newHeaders,
    });
  }).catch(() => new Response("pr0xy dead, report this to .gg/22mEef6mTB if this stays...", { status: 500 }));
});
