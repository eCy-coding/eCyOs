
# Keybindings for eCy OS UI
# This would be integrated with prompt_toolkit or urwid key handlers

KEYBINDINGS = {
    'C-b': 'prefix',  # Prefix key like tmux
    'C-b n': 'new_pane',
    'C-b c': 'close_pane',
    'C-b p': 'switch_profile',
    'C-b d': 'detach_session',
}

def get_action(key_sequence):
    return KEYBINDINGS.get(key_sequence)
