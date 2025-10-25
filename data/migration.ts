
// The current version of the data schema. Increment this when making breaking changes to the data structures.
export const CURRENT_DATA_VERSION = 1;

/**
 * A map of migration functions.
 * Each key is the version to migrate FROM. The function migrates it to the NEXT version (version + 1).
 * This provides a clear, sequential path for updating data structures over time.
 */
const MIGRATIONS: Record<number, (data: any) => any> = {
  // --- EXAMPLE FOR A FUTURE MIGRATION FROM v1 to v2 ---
  //
  // 1: (data) => {
  //   // Suppose we are adding a 'notes' field to all MasterProject objects.
  //   // This function would need to handle all three data keys: masterProjects, schedule, and templates.
  //   
  //   const migratedData = { ...data }; // Create a copy to avoid side effects
  //
  //   // For masterProjects, we iterate and add the new field.
  //   if (Array.isArray(migratedData.masterProjects)) {
  //     migratedData.masterProjects.forEach(p => {
  //       if (typeof p.notes === 'undefined') {
  //         p.notes = ''; // Add default empty string for notes
  //       }
  //     });
  //   }
  //
  //   // Similar logic would be needed for projects nested in 'schedule' and 'templates'.
  //   return migratedData;
  // },
};


/**
 * Migrates data from an old version to the current version by applying sequential migration functions.
 * @param data The data to migrate.
 * @param fromVersion The starting version of the data. Legacy (unversioned) data should be passed as version 0.
 * @returns The migrated data, now at CURRENT_DATA_VERSION.
 */
export function migrate<T>(data: any, fromVersion: number): T {
  let migratedData = data;
  
  if (fromVersion >= CURRENT_DATA_VERSION) {
    return migratedData as T;
  }

  console.log(`Starting migration for data from v${fromVersion} to v${CURRENT_DATA_VERSION}.`);

  for (let v = fromVersion; v < CURRENT_DATA_VERSION; v++) {
    const migrationFunc = MIGRATIONS[v];
    if (migrationFunc) {
      try {
        console.log(`Applying migration from v${v} to v${v + 1}...`);
        migratedData = migrationFunc(migratedData);
      } catch (error) {
        console.error(`Error applying migration from v${v} to v${v + 1}:`, error);
        // Depending on the desired behavior, you could throw the error,
        // or return the last known good state (migratedData before the error).
        // For now, we stop migration on error.
        return migratedData as T;
      }
    }
  }
  
  console.log(`Migration complete. Data is now at v${CURRENT_DATA_VERSION}.`);
  return migratedData as T;
}
