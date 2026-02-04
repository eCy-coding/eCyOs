
import { Logger } from './logger';
import { ImmuneSystem } from '../../orchestra/immune_system';

/**
 * The Conductor (Antigravity's Avatar)
 * ------------------------------------
 * Orchestrates the "Supervisor-Worker" workflow.
 * Takes a Goal -> Plans -> Executes using Tools.
 */
export class Conductor {
    private logger: Logger;

    constructor() {
        this.logger = new Logger('conductor');
    }

    /**
     * Execute a high-level goal using available tools.
     * @param goal The user's request.
     * @param tools The toolset (Brain, Eye, etc.)
     */
    public async execute(
        goal: string,
        tools: {
            askBrain: (prompt: string, mode: string, options?: { format?: string }) => Promise<string>,
            useEye: (action: string, payload: unknown) => Promise<any>
        }
    ): Promise<string> {
        this.logger.info(`Conductor received goal: "${goal}"`);

        try {
            // Step 1: Planning (Decomposition)
            const planPrompt = `
            You are the Supervisor. The User wants: "${goal}".
            Available Tools:
            1. BROWSE(url): Returns title and text of a webpage. Payload: { url: "..." }
            2. CLICK(selector): Clicks an element. Payload: { selector: "..." }
            3. TYPE(selector, text): Types into element. Payload: { selector: "...", text: "..." }
            4. SCROLL(): Scrolls down. Payload: {}
            
            Return a JSON object with a plan. ONLY ONE step.
            { "tool": "BROWSE", "args": { "url": "https://..." } }
            { "tool": "CLICK", "args": { "selector": "#btn" } }
            { "tool": "ANSWER", "args": "final answer" }
            `;

            this.logger.info('Conductor: Planning (Structured)...');
            
            // IMMUNE SYSTEM: Retry Brain Logic 3 times
            // We request JSON format strictly from the Brain
            const planRaw = await ImmuneSystem.retry(
                async () => tools.askBrain(planPrompt, 'local', { format: 'json' }),
                3, 500
            ); 
            
            // With format: 'json', we expect pure JSON. 
            // However, robustly parsing just in case.
            let plan: any;
            try {
                plan = JSON.parse(planRaw);
            } catch (e) {
                // Fallback for markdown blocks if any
                const jsonMatch = planRaw.match(/\{[\s\S]*\}/);
                if (!jsonMatch) throw new Error(`Brain did not return a plan structure. RAW: ${planRaw}`);
                plan = JSON.parse(jsonMatch[0]);
            }
            
            this.logger.info(`Conductor Plan: ${JSON.stringify(plan)}`);

            // Step 2: Execution
            if (plan.tool === 'BROWSE') {
                // Support both array (legacy) and object args
                const url = Array.isArray(plan.args) ? plan.args[0] : plan.args.url;
                this.logger.info(`Conductor: Eye -> BROWSE ${url}`);
                
                const result = await ImmuneSystem.retry(
                    async () => tools.useEye('browse', { url }), 
                    3, 2000
                );
                return `Browsed ${url}. Title: ${result.title}`;
            } 
            else if (plan.tool === 'CLICK') {
                const selector = plan.args.selector;
                this.logger.info(`Conductor: Eye -> CLICK ${selector}`);
                await tools.useEye('click', { selector });
                return `Clicked ${selector}`;
            }
            else if (plan.tool === 'TYPE') {
                const { selector, text } = plan.args;
                this.logger.info(`Conductor: Eye -> TYPE "${text}" into ${selector}`);
                await tools.useEye('type', { selector, text });
                return `Typed into ${selector}`;
            }
            else if (plan.tool === 'ANSWER') {
                return Array.isArray(plan.args) ? plan.args[0] : plan.args;
            } else {
                return `Unknown tool: ${plan.tool}`;
            }

        } catch (error: any) {
            this.logger.error(`Conductor Failed: ${error.message}`);
            return `Workflow Error: ${error.message}`;
        }
    }
}
