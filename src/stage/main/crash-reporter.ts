import { crashReporter, app } from 'electron';
import { join } from 'path';

export function initCrashReporter(): void {
  const crashDumpDir = join(app.getPath('userData'), 'crash-dumps');
  
  crashReporter.start({
    submitURL: '', // Local only, no upload
    uploadToServer: false,
    ignoreSystemCrashHandler: false,
    compress: true,
  });

  // console.log(`[Fortress] Crash Reporter initialized. Dumps at: ${crashDumpDir}`);
}
