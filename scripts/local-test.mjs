import fs from "node:fs";
import { handler } from "../src/index.mjs";

const file = process.argv[2] || "./events/line-message.json";
const event = JSON.parse(fs.readFileSync(file, "utf8"));

const res = await handler(event);
console.log("handler response:", res);
