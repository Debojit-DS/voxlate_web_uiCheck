import { proxyApiRequest } from "@/lib/server/apiProxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Next passes a route context as the second argument; it is not proxy configuration.
const handler = (request: Request) => proxyApiRequest(request);
export { handler as GET, handler as POST, handler as PATCH, handler as PUT,
  handler as DELETE, handler as HEAD, handler as OPTIONS };
