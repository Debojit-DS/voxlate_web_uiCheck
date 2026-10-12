import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  // The API backend is a separate Next project with its own lint configuration.
  { ignores: ["Voxlate-waitlist-backend/**"] },
  ...nextVitals,
  ...nextTs,
];

export default config;
