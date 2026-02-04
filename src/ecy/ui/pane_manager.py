import urwid

class PaneManager:
    """Simple split‑pane manager using urwid.
    Creates two vertically stacked panes: a prompt area (top) and a log/output area (bottom).
    """
    def __init__(self, prompt_widget, log_widget):
        self.prompt = prompt_widget
        self.log = log_widget
        self.layout = urwid.Pile([
            ('weight', 1, self.prompt),
            ('weight', 3, self.log),
        ])
        self.loop = urwid.MainLoop(self.layout, unhandled_input=self.unhandled_input)

    def unhandled_input(self, key):
        if key in ('q', 'Q'):
            raise urwid.ExitMainLoop()

    def run(self):
        self.loop.run()

# Helper functions to create basic widgets
def create_prompt_widget():
    edit = urwid.Edit(('prompt', "[eCy] "))
    return urwid.Filler(edit, valign='top')

def create_log_widget():
    txt = urwid.Text('')
    return urwid.Filler(txt, valign='bottom')

if __name__ == '__main__':
    prompt = create_prompt_widget()
    log = create_log_widget()
    manager = PaneManager(prompt, log)
    manager.run()
