import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  // The API backend and speech service are separate projects with their own configurations.
  { ignores: ["backend/**", "speech-service/**", "Voxlate-waitlist-backend/**"] },
  ...nextVitals,
  ...nextTs,
];

export default config;
