import Dexie, { type Table } from "dexie";
import { initialData, type Data } from "./core";
interface StateRow {
  id: string;
  data: Data;
  revision?: number;
}
export class FitDB extends Dexie {
  state!: Table<StateRow, string>;
  constructor(name = "fittrack-ai") {
    super(name);
    this.version(1).stores({ state: "id" });
    // v2 preserves all v1 personal data and introduces optimistic concurrency.
    this.version(2)
      .stores({ state: "id" })
      .upgrade((tx) =>
        tx
          .table("state")
          .toCollection()
          .modify((row) => {
            row.revision = 0;
          }),
      );
  }
}
export const db = new FitDB();
let revision = 0;
export class StorageConflictError extends Error {
  constructor() {
    super(
      "Another tab changed your data. Export unsaved changes, then reload this tab.",
    );
  }
}
export async function load() {
  const row = await db.state.get("personal");
  revision = row?.revision ?? 0;
  return row?.data || initialData();
}
export async function save(data: Data) {
  await db.transaction("rw", db.state, async () => {
    const row = await db.state.get("personal");
    if ((row?.revision ?? 0) !== revision) throw new StorageConflictError();
    const nextRevision = revision + 1;
    await db.state.put({
      id: "personal",
      data: structuredClone(data),
      revision: nextRevision,
    });
    revision = nextRevision;
  });
}
