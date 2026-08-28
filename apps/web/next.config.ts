// PROTECTED FILE — see constitution/protected-paths.json
import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";

const nextConfig: NextConfig = {};

export default withBotId(nextConfig);
