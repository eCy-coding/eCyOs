
import { EventEmitter } from 'events';

export interface Councilor {
  name: string;
  role: string; // e.g., "The Skeptic", "The Architect", "The Mathematician"
  model: string;
  adapter?: unknown; // [AUDITOR-FIX] Added optional adapter property
  
  /**
   * Generates a position paper on the topic.
   */
  contemplate(topic: string): Promise<string>;

  /**
   * Critiques another councilor's position.
   */
  critique(position: string, author: string): Promise<string>;

  /**
   * Votes or proposes a final solution based on all papers and critiques.
   */
  vote(context: string): Promise<string>;
}

export type DebateState = 'IDLE' | 'DIVERGENCE' | 'DELIBERATION' | 'CONVERGENCE' | 'ADJOURNED';

import { SetTheory } from './math/SetTheory';

export class Council extends EventEmitter {
  private _councilors: SetTheory<Councilor>;
  private state: DebateState = 'IDLE';
  private topic: string = '';
  private minutes: unknown[] = []; // Logs of the debate
  private _history: string[] = [];

  constructor() {
    super();
    this._councilors = new SetTheory<Councilor>();
  }

  register(adapter: unknown) {
    const member = adapter as Councilor;

    // Enforce Uniqueness via Set
    // Note: SetTheory uses strict equality by default. 
    // For objects, we check strictly if the *same instance* is added.
    // If we want logical uniqueness (by name), we would filter.
    // Here we assume distinct instances.
    if (this._councilors.has(member)) {
        console.warn(`[Council] Duplicate member rejected: ${member.name}`);
        return;
    }

    this._councilors.add(member);
    this.log('SYSTEM', `Councilor ${member.name} (${member.role}) has taken a seat.`);
  }

  get memberCount(): number {
    return this._councilors.cardinality;
  }

  async summon(topic: string) {
    if (this.memberCount < 2) {
        throw new Error("The Council requires at least 2 members to sit.");
    }
    
    this.topic = topic;
    this.state = 'DIVERGENCE';
    this.minutes = [];
    this.log('CHAIR', `The Council is summoned to debate: "${topic}"`);

    // Phase 1: Divergence
    const positions = await this.phaseDivergence();

    // Phase 2: Deliberation
    this.state = 'DELIBERATION';
    const critiques = await this.phaseDeliberation(positions);

    // Phase 3: Convergence
    this.state = 'CONVERGENCE';
    const consensus = await this.phaseConvergence(positions, critiques);

    this.state = 'ADJOURNED';
    this.log('CHAIR', 'The Council is adjourned.');
    
    return {
        topic,
        participants: this._councilors.toArray().map(c => c.name),
        result: consensus,
        minutes: this.minutes
    };
  }

  private async phaseDivergence() {
    this.log('CHAIR', 'Phase 1: Divergence. Councilors are contemplating...');
    const positions = new Map<string, string>();
    
    await Promise.all(this._councilors.toArray().map(async (c) => {
        try {
            const paper = await c.contemplate(this.topic);
            positions.set(c.name, paper);
            this.log(c.name, `Position paper submitted.`);
        } catch (e: any) {
            this.log(c.name, `Failed to submit position: ${e.message}`);
        }
    }));
    return positions;
  }

  private async phaseDeliberation(positions: Map<string, string>) {
    this.log('CHAIR', 'Phase 2: Deliberation. Peer review in progress...');
    const critiques = new Map<string, string[]>();

    // Round Robin Critique: Each councilor critiques the NEXT one in the ring (simplified graph)
    // Or full mesh? Let's do full mesh for "Deep" debate, but maybe simplified for now.
    // Let's do: Each councilor critiques the aggregate or specific others. 
    // Implementation: Review "The Previous" for now to save tokens, or "All Others".
    // Better: Everyone reads everyone (Parallel).
    
    await Promise.all(this._councilors.toArray().map(async (critic) => {
        const others = this._councilors.toArray().filter(c => c.name !== critic.name);
        const critiqueList: string[] = [];
        
        for (const target of others) {
            const paper = positions.get(target.name);
            if (paper) {
                const critique = await critic.critique(paper, target.name);
                critiqueList.push(`Critique of ${target.name}: ${critique}`);
                this.log(critic.name, `Critiqued ${target.name}'s position.`);
            }
        }
        critiques.set(critic.name, critiqueList);
    }));

    return critiques;
  }

  private async phaseConvergence(positions: Map<string, string>, critiques: Map<string, string[]>) {
    this.log('CHAIR', 'Phase 3: Convergence. Calling for final votes and synthesis...');
    
    // Construct the full context for the decision
    let context = `Topic: ${this.topic}\n\n`;
    positions.forEach((paper, author) => {
        context += `## Position by ${author}\n${paper}\n\n`;
    });
    
    // Simple Consensus for V1: The Chair (System) or a Leader Agent synthesizes?
    // The Protocol says "The Chair asks each Councilor to vote".
    
    const votes: string[] = [];
    await Promise.all(this._councilors.toArray().map(async (c) => {
        const vote = await c.vote(context);
        votes.push(`${c.name} concludes:\n${vote}`);
        this.log(c.name, `Cast final vote.`);
    }));

    return votes.join('\n\n---\n\n');
  }

  private log(actor: string, message: string) {
    const entry = { timestamp: new Date(), actor, message };
    this.minutes.push(entry);
    this.emit('update', entry);
    // console.log(`[COUNCIL] ${actor}: ${message}`);
  }
}
