/**
 * shell.c
 * UART Admin Console (The Overseer)
 */

#include "os_kernel.h"
#include "drivers.h"

void handle_command(char cmd) {
    uart_send("\n[Overseer] > ");
    
    switch (cmd) {
        case 's':
            uart_send("STATUS: SYSTEM NOMINAL\n");
            uart_send(" - Brain:  [ACTIVE]\n");
            uart_send(" - Vision: [ACTIVE]\n");
            uart_send(" - Swarm:  [3 NODES]\n");
            break;
        case 'h':
            uart_send("HELP:\n s - Status\n r - Reset\n h - Help\n");
            break;
        case 'r':
            uart_send("SYSTEM RESET SCHEDULED...\n");
            break;
        default:
            uart_send("Unknown Command.\n");
            break;
    }
}

void task_cli(void) {
    uart_send("[CLI] Admin Console Ready.\n");
    uart_send("[CLI] Press 'h' for help.\n");

    while (1) {
        char c = uart_read_nonblocking();
        if (c) {
            /* Echo */
            char buf[2] = {c, 0};
            uart_send(buf);
            
            handle_command(c);
        }
        
        led_toggle(3); // Blue LED (Comms Heartbeat)
        
        os_yield();
    }
}
