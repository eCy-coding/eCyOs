/**
 * rs485.c
 * RS485 Industrial Bus Driver
 * UART + GPIO Direction Control
 */

#include "drivers.h"
#include "stm32f4_manual.h"

/* Config: PD4 as DE/RE Pin */
#define RS485_DE_PIN 4

void rs485_init(void) {
    /* 1. Init UART (Reuse USART2 logic or similar) */
    /* Assuming UART initialized in hardware_init() */
    
    /* 2. Init DE Pin (PD4 Output) */
    GPIOD->MODER |= (1 << (RS485_DE_PIN * 2)); // Output
    GPIOD->ODR &= ~(1 << RS485_DE_PIN); // Default Receive (Low)
}

void rs485_set_tx(void) {
    GPIOD->ODR |= (1 << RS485_DE_PIN); // HIGH
    /* Small delay for transceiver stabilization might be needed */
    volatile int d = 100; while(d--);
}

void rs485_set_rx(void) {
    /* Wait for TC (Transmission Complete) before switching! */
    while (!(USART2->SR & (1 << 6))); // TC bit
    
    GPIOD->ODR &= ~(1 << RS485_DE_PIN); // LOW
}

void rs485_send(char *str) {
    rs485_set_tx();
    uart_send(str); // Helper from drivers.c
    rs485_set_rx();
}
