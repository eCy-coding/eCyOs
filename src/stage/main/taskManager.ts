import { app } from 'electron';
import { join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { randomUUID } from 'crypto';
import { fuzzySearch } from '../../orchestra/algorithms';

export interface Task {
  id: string;
  name: string;
  command: string;
  icon: string;
  dependencies?: string[]; // IDs of tasks that must complete before this one
}

export class TaskManager {
  private path: string;
  private tasks: Task[] = [];

  constructor() {
    this.path = join(app.getPath('userData'), 'tasks.json');
    this.load();
    
    // Seed default tasks if empty
    if (this.tasks.length === 0) {
        this.seed();
    }
  }

  private load() {
    try {
      if (existsSync(this.path)) {
        const data = readFileSync(this.path, 'utf-8');
        this.tasks = JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      this.tasks = [];
    }
  }

  private save() {
    try {
      writeFileSync(this.path, JSON.stringify(this.tasks, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  }

  private seed() {
      // Define IDs for dependency linking
      const morningId = randomUUID();
      const coffeeId = randomUUID();
      
      this.tasks = [
          { id: coffeeId, name: 'Make Coffee', command: 'echo "Making Coffee..."', icon: '☕' },
          { id: morningId, name: 'Morning Routine', command: 'orchestra conduct "morning routine"', icon: '🌅', dependencies: [coffeeId] },
          { id: randomUUID(), name: 'Focus Mode', command: 'orchestra focus', icon: '🎯' },
          { id: randomUUID(), name: 'Clean Desktop', command: 'orchestra clean desktop', icon: '🧹' },
          { id: randomUUID(), name: 'System Check', command: 'orchestra check system', icon: '🏥' },
          { id: randomUUID(), name: 'Lock Down', command: 'orchestra atom run system-lock', icon: '🔒' }
      ];
      this.save();
  }

  public getTasks(): Task[] {
    return this.tasks;
  }

  public addTask(task: Omit<Task, 'id'>): Task {
    const newTask = { ...task, id: randomUUID(), dependencies: task.dependencies || [] };
    this.tasks.push(newTask);
    this.save();
    return newTask;
  }

  public deleteTask(id: string): boolean {
    const initialLength = this.tasks.length;
    // Remove task and remove it from other tasks' dependencies
    this.tasks = this.tasks.filter(t => t.id !== id).map(t => ({
        ...t,
        dependencies: t.dependencies?.filter(depId => depId !== id)
    }));
    
    if (this.tasks.length !== initialLength) {
        this.save();
        return true;
    }
    return false;
  }

  // --- Dependency Graph Algorithms (Phase 1 Efficiency Protocol) ---

  /**
   * Adds a dependency: 'dependentId' depends on 'dependencyId'.
   * Checks for cycles before adding.
   */
  public addDependency(dependentId: string, dependencyId: string): { success: boolean, error?: string } {
    const dependent = this.tasks.find(t => t.id === dependentId);
    if (!dependent) return { success: false, error: 'Dependent task not found' };
    if (!this.tasks.find(t => t.id === dependencyId)) return { success: false, error: 'Dependency task not found' };
    
    // Prevent self-dependency
    if (dependentId === dependencyId) return { success: false, error: 'Task cannot depend on itself' };

    // Check if edge already exists
    if (!dependent.dependencies) dependent.dependencies = [];
    if (dependent.dependencies.includes(dependencyId)) return { success: true }; // Already exists

    // Cycle Detection (DFS)
    // We strictly check if keeping this new edge allows a cycle
    // Construct hypothetical graph
    const tempGraph = new Map<string, string[]>();
    this.tasks.forEach(t => tempGraph.set(t.id, [...(t.dependencies || [])]));
    
    const currentDeps = tempGraph.get(dependentId) || [];
    currentDeps.push(dependencyId);
    tempGraph.set(dependentId, currentDeps);

    if (this.hasCycle(tempGraph)) {
        return { success: false, error: 'Cycle detected: This dependency would create an infinite loop.' };
    }

    // Apply change
    dependent.dependencies.push(dependencyId);
    this.save();
    return { success: true };
  }

  /**
   * Kahn's Algorithm for Topological Sort.
   * Returns tasks in a valid execution order (independent tasks first).
   * Returns null if graph has a cycle (should be prevented by addDependency, but safe-guard).
   */
  public getExecutionOrder(): Task[] | null {
    const graph = new Map<string, string[]>(); // adjacency list: dependency -> [dependents]
    const inDegree = new Map<string, number>();

    // Initialize
    this.tasks.forEach(t => {
        graph.set(t.id, []);
        inDegree.set(t.id, 0);
    });

    // Build Graph
    this.tasks.forEach(task => {
        const parentIds = task.dependencies || [];
        // Edge direction: Parent -> Child (Child depends on Parent)
        // Parent must execute BEFORE Child.
        
        parentIds.forEach(parentId => {
            if (graph.has(parentId)) {
                graph.get(parentId)!.push(task.id);
                inDegree.set(task.id, (inDegree.get(task.id) || 0) + 1);
            }
        });
    });

    // Queue for Start Nodes (in-degree 0)
    const queue: string[] = [];
    inDegree.forEach((degree, id) => {
        if (degree === 0) queue.push(id);
    });

    const result: Task[] = [];
    
    while (queue.length > 0) {
        const currentId = queue.shift()!;
        const task = this.tasks.find(t => t.id === currentId);
        if (task) result.push(task);

        const children = graph.get(currentId) || [];
        children.forEach(childId => {
            inDegree.set(childId, (inDegree.get(childId) || 0) - 1);
            if (inDegree.get(childId) === 0) {
                queue.push(childId);
            }
        });
    }

    // If result length != total tasks, there's a cycle
    if (result.length !== this.tasks.length) return null;

    return result;
  }

  /**
   * Helper: Detects cycles in a graph adjacency map (Task -> Dependencies).
   * Uses DFS.
   */
  private hasCycle(graph: Map<string, string[]>): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
        visited.add(nodeId);
        recursionStack.add(nodeId);

        // graph contains mapping: TaskID -> [ParentIDs]
        // This represents edges: Parent -> Task
        // Wait, 'dependencies' list is Parent IDs.
        // So graph.get(nodeId) gives parents of nodeID.
        // Edge is Parent -> Child.
        // If we traverse Child -> Parent, we are going upstream against the execution flow.
        // A cycle in "Child -> Parent" graph implies a cycle in "Parent -> Child" graph too.
        
        const parents = graph.get(nodeId) || [];
        for (const parentId of parents) {
            // Check if parent exists in our map (might depend on deleted task)
            if (!graph.has(parentId)) continue;

            if (!visited.has(parentId)) {
                if (dfs(parentId)) return true;
            } else if (recursionStack.has(parentId)) {
                return true; // Cycle found
            }
        }

        recursionStack.delete(nodeId);
        return false;
    };

    for (const [taskId] of graph) {
        if (!visited.has(taskId)) {
            if (dfs(taskId)) return true;
        }
    }


    return false;
  }

  /**
   * Search for tasks using fuzzy matching on the name.
   */
  public searchTasks(query: string): Task[] {
      const results = fuzzySearch(query, this.tasks, (t) => t.name);
      return results.map(r => r.item);
  }
}
