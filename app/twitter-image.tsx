// Twitter card reuses the Open Graph image. Statically re-declaring the
// route exports (rather than `export { ... } from`) so Next.js's static
// analyzer picks up `runtime = "edge"`.
import OpengraphImage from "./opengraph-image";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "supersonicimpact: explore the real-world impact of supersonic commercial flight";

export default OpengraphImage;
