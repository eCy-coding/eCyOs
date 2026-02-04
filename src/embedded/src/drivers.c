/**
 * drivers.c
 * Low-Level Hardware Drivers (STM32F4)
 * RCC, GPIO, USART, DCMI
 */

#include "drivers.h"
#include "stm32f4_manual.h"

void hardware_init(void) {
    /* 1. Clocks */
    // Enable GPIOA (USART), GPIOD (LEDs)
    RCC_AHB1ENR |= (RCC_AHB1ENR_GPIOAEN | RCC_AHB1ENR_GPIODEN);
    // Enable USART2
    RCC_APB1ENR |= RCC_APB1ENR_USART2EN;
    // Enable DCMI (Mock Power)
    RCC_AHB2ENR |= RCC_AHB2ENR_DCMIEN;

    /* 2. LEDs (GPIOD Pin 12-15) - Output Mode */
    GPIOD->MODER |= (1 << (12*2)) | (1 << (13*2)) | (1 << (14*2)) | (1 << (15*2));

    /* 3. USART2 (PA2=TX, PA3=RX) - AF Mode */
    GPIOA->MODER |= (2 << (2*2)) | (2 << (3*2));
    GPIOA->AFR[0] |= (7 << (2*4)) | (7 << (3*4)); // AF7 = USART2

    /* 4. USART Config (9600 Baud @ 16MHz) */
    USART2->BRR = 0x0683; 
    USART2->CR1 |= (USART_CR1_UE | USART_CR1_TE | USART_CR1_RE);
}

void uart_send(char *str) {
    while (*str) {
        while (!(USART2->SR & USART_SR_TXE)); // Wait for TX Empty
        USART2->DR = *str++;
    }
}

char uart_read_nonblocking(void) {
    if (USART2->SR & USART_SR_RXNE) {
        return (char)(USART2->DR);
    }
    return 0;
}

void led_toggle(int led_idx) {
    /* led_idx: 0=Green(12), 1=Orange(13), 2=Red(14), 3=Blue(15) */
    if (led_idx >= 0 && led_idx <= 3) {
        GPIOD->ODR ^= (1 << (12 + led_idx));
    }
}
