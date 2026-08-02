import assert from "node:assert/strict";
import test, { describe } from "node:test";
import { loginSchema, registerSchema } from "../validators/auth.schema.js";
import { createTaskSchema, updateTaskSchema } from "../validators/task.schema.js";

describe("Auth Validators", () => {
  test("validates correct registration payload", () => {
    const result = registerSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "password123",
    });
    assert.equal(result.success, true);
  });

  test("rejects invalid email in registration", () => {
    const result = registerSchema.safeParse({
      name: "Jane Doe",
      email: "invalid-email",
      password: "password123",
    });
    assert.equal(result.success, false);
  });

  test("rejects short password in registration", () => {
    const result = registerSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "123",
    });
    assert.equal(result.success, false);
  });

  test("validates login payload", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "secretpassword",
    });
    assert.equal(result.success, true);
  });
});

describe("Task Validators", () => {
  test("validates task creation defaults", () => {
    const result = createTaskSchema.parse({
      title: "Design new homepage",
    });
    assert.equal(result.title, "Design new homepage");
    assert.equal(result.priority, "medium");
    assert.equal(result.status, "todo");
  });

  test("validates task update payload", () => {
    const result = updateTaskSchema.parse({
      status: "done",
      priority: "urgent",
    });
    assert.equal(result.status, "done");
    assert.equal(result.priority, "urgent");
  });

  test("rejects empty title on task creation", () => {
    const result = createTaskSchema.safeParse({
      title: "",
    });
    assert.equal(result.success, false);
  });
});
