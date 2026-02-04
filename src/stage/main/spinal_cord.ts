
import { 
    app, 
    globalShortcut, 
    powerMonitor, 
    clipboard, 
    Tray, 
    Menu, 
    nativeImage 
} from 'electron';
import { Logger } from './logger';

/**
 * The Spinal Cord
 * ---------------
 * Manages Native System Integrations (The 15 APIs).
 * Connects the Body (OS) to the Brain.
 */
export class SpinalCord {
    private tray: Tray | null = null;
    private logger: Logger;
    private isQuitting: boolean = false;

    constructor() {
        this.logger = new Logger('spinal-cord');
    }

    /**
     * Initialize all Nervous System connections
     */
    public initialize(mainWindow: Electron.BrowserWindow): void {
        this.setupGlobalShortcuts(mainWindow);
        this.setupPowerMonitor();
        // this.setupTray(mainWindow); // Deferred: Needs icon asset
        this.logger.info('Spinal Cord Initialized.');
    }

    public readClipboard(): string {
        return clipboard.readText();
    }

    private setupGlobalShortcuts(window: Electron.BrowserWindow): void {
        // Toggle Window Visibility with Command+Choice+Space (Alternative to Spotlight)
        // Using 'CommandOrControl+Shift+Space' for safety/less conflicts
        const ret = globalShortcut.register('CommandOrControl+Shift+Space', () => {
            this.logger.info('Global Shortcut Triggered');
            if (window.isVisible()) {
                window.hide();
            } else {
                window.show();
                window.focus();
            }
        });

        if (!ret) {
            this.logger.warn('Global Shortcut Registration Failed');
        }
    }

    private setupPowerMonitor(): void {
        powerMonitor.on('suspend', () => {
            this.logger.info('System Sustainability: Suspending (Power Save)');
            // Here we could pause heavy Brain tasks
        });

        powerMonitor.on('resume', () => {
            this.logger.info('System Sustainability: Resumed');
        });

        powerMonitor.on('lock-screen', () => {
            this.logger.info('System Security: Screen Locked');
        });
    }
    
    // Example of future expansion
    public async openExternal(url: string): Promise<void> {
        const { shell } = require('electron');
        await shell.openExternal(url);
    }
}
