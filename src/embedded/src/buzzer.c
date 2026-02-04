/**
 * buzzer.c
 * Active Buzzer Driver (PWM)
 * Target: STM32F4 Timer (register mock)
 */

#include "drivers.h"
#include "stm32f4_manual.h"
#include "os_kernel.h"

/* Timer Register Mock (Adding specific TIM defs if needed, or just assuming generic) */
/* We will use generic address offset for simulation */
#define TIM2_BASE 0x40000000
#define TIM2_CR1   (*(volatile uint32_t *)(TIM2_BASE + 0x00))
#define TIM2_PSC   (*(volatile uint32_t *)(TIM2_BASE + 0x28))
#define TIM2_ARR   (*(volatile uint32_t *)(TIM2_BASE + 0x2C))
#define TIM2_CCR1  (*(volatile uint32_t *)(TIM2_BASE + 0x34))
#define TIM2_CCMR1 (*(volatile uint32_t *)(TIM2_BASE + 0x18))
#define TIM2_CCER  (*(volatile uint32_t *)(TIM2_BASE + 0x20))

void buzzer_init(void) {
    // 1. Enable TIM2 Clock
    RCC_APB1ENR |= (1 << 0); // TIM2EN

    // 2. GPIO Config (PA0 as Alternate Function 1 for TIM2_CH1) of buzzer pin
    GPIOA->MODER |= (2 << 0); // PA0 AF mode
    GPIOA->AFR[0] |= (1 << 0); // AF1

    // 3. PWM Config (Frequency 2kHz)
    // 16MHz / (15+1) = 1MHz Timer Clock
    TIM2_PSC = 15; 
    // 1MHz / 500 = 2kHz PWM
    TIM2_ARR = 499; 
    
    // PWM Mode 1
    TIM2_CCMR1 |= (6 << 4); // OC1M = 110
    TIM2_CCMR1 |= (1 << 3); // OC1PE

    // Enable Output
    TIM2_CCER |= (1 << 0); // CC1E
}

void buzzer_on(void) {
    TIM2_CCR1 = 250; // 50% Duty Cycle
    TIM2_CR1 |= 1;   // Enable Timer
}

void buzzer_off(void) {
    TIM2_CR1 &= ~1;  // Disable Timer
}

void buzzer_beep(int duration_ms) {
    buzzer_on();
    // Busy wait or delay (in OS, this blocks, but used for short beeps)
    volatile int count = duration_ms * 1000;
    while(count--);
    buzzer_off();
}
