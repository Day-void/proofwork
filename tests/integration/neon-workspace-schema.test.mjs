import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { Pool } from "@neondatabase/serverless";

const rawTestDatabaseUrl = process.env.TEST_DATABASE_URL_UNPOOLED?.trim();
const testDatabaseUrl = rawTestDatabaseUrl?.replace(/^(['"])(.*)\1$/, "$2") || undefined;

test("Neon workspace access and employer task schema supports the intended lifecycle", {
  skip: !testDatabaseUrl,
}, async () => {
  let pool;
  let client;
  const employerId = randomUUID();
  const learnerId = randomUUID();
  const requestId = randomUUID();
  const taskId = randomUUID();
  const approvalRequestId = randomUUID();

  try {
    try {
      pool = new Pool({ connectionString: testDatabaseUrl, max: 1 });
      client = await pool.connect();
    } catch {
      throw new Error("Could not connect to TEST_DATABASE_URL_UNPOOLED. Check that it is a valid, unquoted test-branch URL; connection details are suppressed.");
    }
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO "user" (id, name, email) VALUES ($1, 'Integration employer', $2), ($3, 'Integration learner', $4)`,
      [employerId, `${employerId}@proofwork-test.invalid`, learnerId, `${learnerId}@proofwork-test.invalid`],
    );

    const firstRequest = await client.query(
      `INSERT INTO workspace_access_request (id, user_id, requested_role, reason)
       VALUES ($1, $2, 'employer', 'Integration test request for employer workspace')
       ON CONFLICT DO NOTHING RETURNING id`,
      [requestId, learnerId],
    );
    assert.equal(firstRequest.rowCount, 1, "first pending request should be inserted");
    const wrongApplicantRequest = await client.query(
      `INSERT INTO workspace_access_request (id, user_id, requested_role, reason)
       VALUES ($1, $2, 'assessor', 'A separate test request from the wrong account')
       ON CONFLICT DO NOTHING RETURNING id`,
      [randomUUID(), employerId],
    );
    assert.equal(wrongApplicantRequest.rowCount, 1, "a different account may request its own workspace");
    const duplicateRequest = await client.query(
      `INSERT INTO workspace_access_request (id, user_id, requested_role, reason)
       VALUES ($1, $2, 'employer', 'Duplicate integration request for employer workspace')
       ON CONFLICT DO NOTHING RETURNING id`,
      [randomUUID(), learnerId],
    );
    assert.equal(duplicateRequest.rowCount, 0, "duplicate pending request should be ignored");

    await client.query(`UPDATE workspace_access_request SET status = 'declined' WHERE id = $1`, [requestId]);
    const resubmittedRequest = await client.query(
      `INSERT INTO workspace_access_request (id, user_id, requested_role, reason)
       VALUES ($1, $2, 'employer', 'A new integration request after decline') RETURNING id`,
      [randomUUID(), learnerId],
    );
    assert.equal(resubmittedRequest.rowCount, 1, "declined applicant should be able to request again");

    await client.query("SAVEPOINT invalid_role");
    await assert.rejects(client.query(
      `INSERT INTO workspace_access_request (id, user_id, requested_role, reason)
       VALUES ($1, $2, 'admin', 'Invalid integration role')`, [randomUUID(), learnerId],
    ), /workspace_access_request_role_check/, "database constraint should reject public admin requests");
    await client.query("ROLLBACK TO SAVEPOINT invalid_role");

    await client.query(
      `INSERT INTO employer_task (id, employer_id, learner_id, title, skill_area, instructions, criteria)
       VALUES ($1, $2, $3, 'Integration task', 'Testing', 'Describe a small test approach in at least a few sentences.', 'Explain correctness and edge cases.')`,
      [taskId, employerId, learnerId],
    );
    const accepted = await client.query(
      `UPDATE employer_task SET status = 'accepted' WHERE id = $1 AND learner_id = $2 AND status = 'invited' RETURNING id`,
      [taskId, learnerId],
    );
    assert.equal(accepted.rowCount, 1, "learner should accept an invitation");
    const wrongLearnerUpdate = await client.query(
      `UPDATE employer_task SET status = 'declined' WHERE id = $1 AND learner_id = $2 AND status = 'invited' RETURNING id`,
      [taskId, employerId],
    );
    assert.equal(wrongLearnerUpdate.rowCount, 0, "a different account cannot accept or decline the learner's task");
    const staleAccept = await client.query(
      `UPDATE employer_task SET status = 'accepted' WHERE id = $1 AND learner_id = $2 AND status = 'invited' RETURNING id`,
      [taskId, learnerId],
    );
    assert.equal(staleAccept.rowCount, 0, "a stale invitation update should not change the task");
    const submitted = await client.query(
      `UPDATE employer_task SET status = 'submitted', learner_response = 'Integration response with sufficient detail.'
       WHERE id = $1 AND learner_id = $2 AND status = 'accepted' RETURNING id`,
      [taskId, learnerId],
    );
    assert.equal(submitted.rowCount, 1, "accepted task should accept a learner response");
    const wrongEmployerReview = await client.query(
      `UPDATE employer_task SET status = 'reviewed', employer_feedback = 'Unauthorized feedback'
       WHERE id = $1 AND employer_id = $2 AND status = 'submitted' RETURNING id`,
      [taskId, learnerId],
    );
    assert.equal(wrongEmployerReview.rowCount, 0, "only the inviting employer can review a learner's response");
    const reviewed = await client.query(
      `UPDATE employer_task SET status = 'reviewed', employer_feedback = 'Clear and useful integration feedback.'
       WHERE id = $1 AND employer_id = $2 AND status = 'submitted' RETURNING id`,
      [taskId, employerId],
    );
    assert.equal(reviewed.rowCount, 1, "inviting employer should be able to review submitted work");

    await client.query(
      `INSERT INTO workspace_access_request (id, user_id, requested_role, reason)
       VALUES ($1, $2, 'assessor', 'Integration test request for assessor workspace')`,
      [approvalRequestId, learnerId],
    );
    await client.query(
      `INSERT INTO "session" (id, expires_at, token, user_id) VALUES ($1, $2, $3, $4)`,
      [randomUUID(), new Date(Date.now() + 60_000), randomUUID(), learnerId],
    );
    const approval = await client.query(`
      WITH approved AS (
        UPDATE workspace_access_request
        SET status = 'approved', reviewed_by = $2, reviewed_at = now()
        WHERE id = $1 AND status = 'pending'
        RETURNING id, user_id, requested_role
      ), promoted AS (
        UPDATE "user" AS account
        SET role = approved.requested_role, updated_at = now()
        FROM approved
        WHERE account.id = approved.user_id
        RETURNING account.id, approved.id AS request_id, approved.requested_role
      ), revoked AS (
        DELETE FROM "session" WHERE user_id = (SELECT id FROM promoted)
        RETURNING id
      ), logged AS (
        INSERT INTO audit_log (id, actor_id, action, target_type, target_id, details)
        SELECT $3, $2, 'workspace_access_approved', 'workspace_access_request', promoted.request_id,
          jsonb_build_object('requestedRole', promoted.requested_role, 'userId', promoted.id)
        FROM promoted
        RETURNING id
      )
      SELECT promoted.id FROM promoted JOIN logged ON true
    `, [approvalRequestId, employerId, randomUUID()]);
    assert.equal(approval.rowCount, 1, "approval should update the access request and grant the requested role");
    const [promotedLearner] = (await client.query(`SELECT role FROM "user" WHERE id = $1`, [learnerId])).rows;
    assert.equal(promotedLearner.role, "assessor", "approved role should be applied");
    const [remainingSessions] = (await client.query(`SELECT count(*)::int AS count FROM "session" WHERE user_id = $1`, [learnerId])).rows;
    assert.equal(remainingSessions.count, 0, "approval should revoke old sessions");
    const [approvalAudit] = (await client.query(
      `SELECT action FROM audit_log WHERE target_type = 'workspace_access_request' AND target_id = $1`,
      [approvalRequestId],
    )).rows;
    assert.equal(approvalAudit.action, "workspace_access_approved", "approval should leave an audit event");

    await client.query("SAVEPOINT invalid_status");
    await assert.rejects(client.query(
      `UPDATE employer_task SET status = 'unknown' WHERE id = $1`, [taskId],
    ), /employer_task_status_check/, "database constraint should reject invalid task status");
    await client.query("ROLLBACK TO SAVEPOINT invalid_status");
  } finally {
    try {
      if (client) {
        try {
          await client.query("ROLLBACK");
        } finally {
          client.release();
        }
      }
    } finally {
      await pool?.end();
    }
  }
});
