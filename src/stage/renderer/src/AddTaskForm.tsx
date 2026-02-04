import React, { useState } from 'react';

interface AddTaskFormProps {
    onAdd: (task: { name: string; command: string; icon: string }) => void;
    onCancel: () => void;
}

export function AddTaskForm({ onAdd, onCancel }: AddTaskFormProps) {
    const [name, setName] = useState('');
    const [command, setCommand] = useState('orchestra ');
    const [icon, setIcon] = useState('⚡');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({ name, command, icon });
    };

    return (
        <form onSubmit={handleSubmit} className="add-task-form" style={{ background: '#252526', padding: '15px', borderRadius: '8px', border: '1px solid #333' }}>
            <h3 style={{ marginTop: 0 }}>Add New Task</h3>
            
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Icon</label>
                <input 
                    value={icon} 
                    onChange={e => setIcon(e.target.value)} 
                    style={{ width: '50px', padding: '8px', background: '#333', border: 'none', color: 'white', borderRadius: '4px' }}
                />
            </div>

            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Name</label>
                <input 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="E.g., Deploy Prod"
                    required
                    style={{ width: '100%', padding: '8px', background: '#333', border: 'none', color: 'white', borderRadius: '4px', boxSizing: 'border-box' }}
                />
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Command</label>
                <input 
                    value={command} 
                    onChange={e => setCommand(e.target.value)} 
                    placeholder="orchestra atom run..."
                    required
                    style={{ width: '100%', padding: '8px', background: '#333', border: 'none', color: 'white', borderRadius: '4px', boxSizing: 'border-box', fontFamily: 'monospace' }}
                />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={onCancel} style={{ background: '#444' }}>Cancel</button>
                <button type="submit" style={{ background: '#0e639c' }}>Add Task</button>
            </div>
        </form>
    );
}
