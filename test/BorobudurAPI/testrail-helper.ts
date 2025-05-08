// testrail-helper.ts
import TestRail from 'testrail-api';

const testrail = new TestRail({
  host: 'https://testcaselinkaja.testrail.io',
  username: 'refqi_hussein@linkaja.id',
  password: '0nq0k5Qkfac0kqQh8hxJ-c2/sQgZFOcaSvAcZ.wtg'
});

export async function reportToTestRail(caseId: number, statusId: number, comment: string) {
  // You can also create a run and reuse the run_id
  const runId = 13056; // Replace with your actual run ID

  await testrail.addResultForCase(runId, caseId, {
    status_id: statusId, // 1 = passed, 5 = failed
    comment: comment,
  });
}
