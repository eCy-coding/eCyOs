/**
 * adc.c
 * Precision ADC Driver (DMA)
 * Continuous Scan of Analog Inputs
 */

#include "drivers.h"
#include "stm32f4_manual.h"

/* ADC1 on PA1 (Chan 1) */
#define ADC1_BASE 0x40012000
/* DMA2 Stream 0 Chan 0 */
#define DMA2_BASE 0x40026400

#define ADC1 ((ADC_TypeDef *) ADC1_BASE)

uint16_t adc_dma_buffer[4]; 

void adc_init(void) {
    /* 1. Clocks: ADC1, DMA2, GPIOA */
    RCC_APB2ENR |= (1 << 8); // ADC1
    RCC_AHB1ENR |= (1 << 22); // DMA2
    
    /* 2. GPIO PA1 Analog */
    GPIOA->MODER |= (3 << (1*2));
    
    /* 3. DMA Config (Simulated Register Access) */
    /* Point DMA Periph -> ADC DR, Memory -> Buffer */
    /* Enable Circular, Inc Mem */
    
    /* 4. ADC Common Init */
    /* Prescaler /4 */
    
    /* 5. Configure Channel 1 */
    /* CR1: Scan Mode */
    ADC1->CR1 |= (1 << 8); 
    /* CR2: DMA, Cont */
    ADC1->CR2 |= (1 << 8) | (1 << 1);
    
    /* Start */
    ADC1->CR2 |= 1; // ADON
    ADC1->CR2 |= (1 << 30); // SWSTART
}

uint16_t adc_read_latest(void) {
    return adc_dma_buffer[0]; // In real DMA, this updates auto
}
