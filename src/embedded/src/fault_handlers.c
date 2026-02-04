/**
 * fault_handlers.c
 * Hard Fault & Error Traps
 */

#include "drivers.h"

/* Assembly wrapper to extract Stack Pointer */
__attribute__((naked)) void HardFault_Handler(void) {
    __asm volatile (
        "tst lr, #4 \n"
        "ite eq \n"
        "mrseq r0, msp \n"
        "mrsne r0, psp \n"
        "b HardFault_Handler_C \n"
    );
}

void HardFault_Handler_C(unsigned long *hardfault_args) {
    /* Stack Frame: R0, R1, R2, R3, R12, LR, PC, PSR */
    uart_send("\n!!! HARD FAULT !!!\n");
    uart_send("PC: [CRASH]\n");
    /* Real implementation would print hex values of hardfault_args[6] (PC) */
    
    led_toggle(2); // RED LED ON FOREVER
    while(1);
}

void BusFault_Handler(void) {
    uart_send("\n!!! BUS FAULT !!!\n");
    while(1);
}
