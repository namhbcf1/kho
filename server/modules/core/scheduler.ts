// Module scheduler
export function scheduleJob(name: string, cron: string, task: () => void) {
  // TODO: Lên lịch cron job
  return { success: true, name, cron };
}

export function listJobs() {
  // TODO: Liệt kê các job đã lên lịch
  return [
    { name: 'backup', cron: '0 2 * * *' },
    { name: 'sync', cron: '*/10 * * * *' }
  ];
} 