// testrail-helper.ts
import TestRail from 'testrail-api';

const testrail = new TestRail({
  host: 'https://testcaselinkaja.testrail.io',
  user: 'refqi_hussein@linkaja.id',
  password: 'Mysecret9892'
});

export async function reportToTestRail(caseId: number, statusId: number, comment: string) {
  // You can also create a run and reuse the run_id
  const runId = 13055; // Replace with your actual run ID

  await testrail.addResultForCase(runId, caseId, {
    status_id: statusId, // 1 = passed, 5 = failed
    comment: comment,
  });
}
