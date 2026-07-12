import { beforeEach, describe, expect, it, vi } from "vitest";

// Node's globalThis is not an EventTarget in this runtime, so we stub
// addEventListener BEFORE importing error-capture. The module reads
// globalThis.addEventListener at load time and registers listeners.

type Handler = (event: unknown) => void;
const handlers: Record<string, Handler> = {};

const addEventListenerSpy = vi.fn((type: string, handler: Handler) => {
  handlers[type] = handler;
});

Object.assign(globalThis, {
  addEventListener: addEventListenerSpy,
});

// Import after the stub is in place so the module registers on our spy.
const { consumeLastCapturedError } = await import("./error-capture");

function dispatchError(error: unknown): void {
  const handler = handlers["error"];
  if (!handler) throw new Error("no error handler registered");
  // The module reads (event as ErrorEvent).error ?? event.
  handler({ error });
}

function dispatchErrorNoProp(): void {
  const handler = handlers["error"];
  if (!handler) throw new Error("no error handler registered");
  handler({});
}

function dispatchRejection(reason: unknown): void {
  const handler = handlers["unhandledrejection"];
  if (!handler) throw new Error("no unhandledrejection handler registered");
  handler({ reason });
}

describe("error-capture module wiring", () => {
  it("registers error and unhandledrejection listeners on globalThis", () => {
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "error",
      expect.any(Function),
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "unhandledrejection",
      expect.any(Function),
    );
  });
});

describe("consumeLastCapturedError", () => {
  beforeEach(() => {
    // Drain any leftover captured error before each test.
    consumeLastCapturedError();
  });

  it("returns undefined when nothing has been captured", () => {
    expect(consumeLastCapturedError()).toBeUndefined();
  });

  it("returns the error captured via a global error event", () => {
    const err = new Error("boom");
    dispatchError(err);

    expect(consumeLastCapturedError()).toBe(err);
    // Consuming is destructive — second call returns undefined.
    expect(consumeLastCapturedError()).toBeUndefined();
  });

  it("falls back to the event itself when error property is missing", () => {
    dispatchErrorNoProp();

    // The fallback is the event object itself (?? event).
    const captured = consumeLastCapturedError();
    expect(captured).toEqual({});
  });

  it("returns the reason captured via an unhandledrejection event", () => {
    const reason = { custom: "rejection" };
    dispatchRejection(reason);

    expect(consumeLastCapturedError()).toEqual(reason);
  });

  it("returns the error when consumed within the TTL", () => {
    vi.useFakeTimers();
    try {
      const now = Date.now();
      vi.setSystemTime(now);

      const err = new Error("fresh");
      dispatchError(err);

      vi.setSystemTime(now + 4_000); // within 5s TTL
      expect(consumeLastCapturedError()).toBe(err);
    } finally {
      vi.useRealTimers();
    }
  });

  it("returns undefined once the captured error exceeds the TTL", () => {
    vi.useFakeTimers();
    try {
      const now = Date.now();
      vi.setSystemTime(now);

      const err = new Error("stale");
      dispatchError(err);

      vi.setSystemTime(now + 6_000); // past 5s TTL
      expect(consumeLastCapturedError()).toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });
});
