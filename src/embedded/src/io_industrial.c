/**
 * io_industrial.c
 * Industrial IO & PLC Interface
 * Handles 24V Inputs (Debounced) and Solder Bridge Configs
 */

#include "drivers.h"
#include "stm32f4_manual.h"
#include "os_kernel.h"

/* Port Usage:
 * PE0-PE7: PLC Inputs (24V -> 3V3 Opto)
 * PC0-PC3: Solder Bridges (Config Jumpers)
 */

#define GPIOE_BASE 0x40021000
#define GPIOC_BASE 0x40020800

#define GPIOE ((GPIO_TypeDef *) GPIOE_BASE)
#define GPIOC ((GPIO_TypeDef *) GPIOC_BASE)

void industrial_init(void) {
    // Enable Clocks
    RCC_AHB1ENR |= (1 << 4); // PE
    RCC_AHB1ENR |= (1 << 2); // PC
    
    // Inputs (Default State)
    GPIOE->MODER &= ~(0xFFFF); // PE0-7 Input
    GPIOC->MODER &= ~(0xFF);   // PC0-3 Input (Solder Bridges)
}

uint8_t read_plc_input(int pin) {
    // Software Debounce
    if (GPIOE->IDR & (1 << pin)) {
        volatile int d = 1000; while(d--); // Wait
        if (GPIOE->IDR & (1 << pin)) return 1;
    }
    return 0;
}

uint8_t read_solder_bridge(int bridge_id) {
    return (GPIOC->IDR & (1 << bridge_id)) ? 1 : 0;
}

/* PLC Monitor Task */
void task_plc_monitor(void) {
    uart_send("[PLC] Monitor Active.\n");
    
    uint8_t last_state = 0;
    
    while (1) {
        // Monitor Input 0 (Start Button?)
        uint8_t current_state = read_plc_input(0);
        
        if (current_state != last_state) {
            if (current_state) {
                uart_send("[PLC] Input 0 RISING - Machine Start\n");
                led_toggle(2); // Red LED alert
            }
            last_state = current_state;
        }
        
        os_yield();
    }
}
