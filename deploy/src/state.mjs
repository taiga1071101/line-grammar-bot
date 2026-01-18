import fs from "node:fs";
import path from "node:path";

const DRY_RUN = process.env.DRY_RUN === "1";
const stateFilePath = path.resolve(".local-user-state.json");

// ===== DRY_RUN: file-based state =====
function loadAll() {
  if (!fs.existsSync(stateFilePath)) return {};
  return JSON.parse(fs.readFileSync(stateFilePath, "utf8"));
}

function saveAll(all) {
  fs.writeFileSync(stateFilePath, JSON.stringify(all, null, 2), "utf8");
}

// ===== PROD: DynamoDB (lazy import) =====
let ddb = null;
let GetCommand, PutCommand;

async function getDdb() {
  if (ddb) return ddb;

  const { DynamoDBClient } = await import("@aws-sdk/client-dynamodb");
  const lib = await import("@aws-sdk/lib-dynamodb");
  GetCommand = lib.GetCommand;
  PutCommand = lib.PutCommand;
  const { DynamoDBDocumentClient } = lib;

  ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
  return ddb;
}

export async function getUserState(tableName, userId) {
  if (DRY_RUN) {
    const all = loadAll();
    return all[userId] || { userId, mode: "idle" };
  }

  const client = await getDdb();
  const res = await client.send(
    new GetCommand({
      TableName: tableName,
      Key: { userId },
    })
  );
  return res.Item || { userId, mode: "idle" };
}

export async function putUserState(tableName, item) {
  if (DRY_RUN) {
    const all = loadAll();
    all[item.userId] = item;
    saveAll(all);
    return;
  }

  const client = await getDdb();
  await client.send(
    new PutCommand({
      TableName: tableName,
      Item: item,
    })
  );
}
