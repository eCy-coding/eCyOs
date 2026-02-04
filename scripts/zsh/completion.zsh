#compdef orchestra atom

# Antigravity Native Zsh Completion
# Place this in your FPATH or source it in .zshrc
# Usage: atom [TAB] -> lists available atoms

_antigravity_atoms() {
    local -a atoms
    # Dynamic Atom Discovery: List files in scripts/atoms/ without extension
    # We use a fast, pure shell approach (no node overhead) for speed.
    local atom_dir="$HOME/Desktop/sistem/scripts/atoms"
    
    if [[ -d "$atom_dir" ]]; then
        # List .sh and .js files, strip extensions, valid format for zsh completion
        atoms=($(ls "$atom_dir" | sed -E 's/\.(sh|js)$//'))
    fi

    # Zsh helper to describe the list
    _describe 'atoms' atoms
}

_orchestra() {
    local -a commands
    commands=(
        'atom:Execute an atomic unit'
        'check:Run system diagnostics'
    )
    
    _arguments -C \
        "1: :_describe 'commands' commands" \
        "*::arg:->args"

    case $state in
        args)
            case $line[1] in
                atom)
                    _arguments \
                        "1: :('run' 'list')" \
                        "*::arg:->atom_args"
                    ;;
            esac
            case $line[2] in
                run)
                     _antigravity_atoms
                     ;;
            esac
            ;;
    esac
}

compdef _orchestra orchestra
compdef _orchestra sistem
