/**
 * Runs a database read and turns a failure into a message instead of a crash.
 *
 * The GitHub client returned a `Result<T>` from every call, so admin screens
 * could render "could not reach GitHub" instead of a 500. The database layer
 * throws instead — which is right for writes, where a failure must roll the
 * transaction back — but the screens still deserve to degrade rather than
 * break. A dashboard that 500s during a brief database blip tells the person
 * far less than one that says the database is unreachable.
 *
 * READS only. A write that fails must reach the action's own handler, which
 * knows how to turn a duplicate key into a field error.
 */
export type Attempt<T> = { ok: true; value: T } | { ok: false; error: string };

export async function attempt<T>(fn: () => Promise<T>): Promise<Attempt<T>> {
  try {
    return { ok: true, value: await fn() };
  } catch (error) {
    // Deliberately not the raw message: it can carry the query, the table
    // names and the host. Those belong in the server log, not on a page.
    console.error("admin: read failed —", error);
    return {
      ok: false,
      error:
        "Could not reach the database. The content is still there; this page cannot read it right now.",
    };
  }
}
