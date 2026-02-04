// eCy OS v1005.0 - KBar Command Palette
// CTRL+K keyboard shortcuts

import {
  KBarProvider,
  KBarPortal,
  KBarPositioner,
  KBarAnimator,
  KBarSearch,
  KBarResults,
  useMatches,
  type Action,
} from 'kbar';
import { useUIActions } from '../stores';
import type { ReactNode } from 'react';
import './CommandPalette.css';

interface CommandPaletteProps {
  children: ReactNode;
}

export function CommandPalette({ children }: CommandPaletteProps) {
  const { setActiveTab, toggleSidebar, setTheme } = useUIActions();

  const actions: Action[] = [
    {
      id: 'home',
      name: 'Go to Home',
      shortcut: ['h'],
      keywords: 'home dashboard',
      perform: () => setActiveTab('home'),
    },
    {
      id: 'calculator',
      name: 'Open Calculator',
      shortcut: ['c'],
      keywords: 'calculator math compute',
      perform: () => setActiveTab('calculator'),
    },
    {
      id: 'debate',
      name: 'Open Debate Console',
      shortcut: ['d'],
      keywords: 'debate council ai agents',
      perform: () => setActiveTab('debate'),
    },
    {
      id: 'workspace',
      name: 'Open Workspace',
      shortcut: ['w'],
      keywords: 'workspace neural swarm',
      perform: () => setActiveTab('workspace'),
    },
    {
      id: 'toggle-sidebar',
      name: 'Toggle Sidebar',
      shortcut: ['s'],
      keywords: 'sidebar toggle',
      perform: () => toggleSidebar(),
    },
    {
      id: 'theme-cyberpunk',
      name: 'Set Theme: Cyberpunk',
      keywords: 'theme dark cyberpunk',
      perform: () => setTheme('cyberpunk'),
    },
    {
      id: 'theme-minimal',
      name: 'Set Theme: Minimal',
      keywords: 'theme light minimal',
      perform: () => setTheme('minimal'),
    },
  ];

  return (
    <KBarProvider actions={actions}>
      <KBarPortal>
        <KBarPositioner className="kbar-positioner">
          <KBarAnimator className="kbar-animator">
            <KBarSearch className="kbar-search" placeholder="Type a command or search..." />
            <Results />
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </KBarProvider>
  );
}

function Results() {
  const { results } = useMatches();

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === 'string' ? (
          <div className="kbar-section">{item}</div>
        ) : (
          <div className={`kbar-result ${active ? 'active' : ''}`}>
            <div className="kbar-result-name">{item.name}</div>
            {item.shortcut && (
              <div className="kbar-result-shortcut">
                {item.shortcut.map((key) => (
                  <kbd key={key}>{key}</kbd>
                ))}
              </div>
            )}
          </div>
        )
      }
    />
  );
}
