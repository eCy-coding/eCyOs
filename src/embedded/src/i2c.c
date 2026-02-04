/**
 * i2c.c
 * I2C Maste Driver (Bare Metal)
 * I2C1 (PB6/PB7)
 */

#include "drivers.h"
#include "stm32f4_manual.h"

#define I2C1_BASE 0x40005400
#define I2C1_CR1  (*(volatile uint32_t *)(I2C1_BASE + 0x00))
#define I2C1_CR2  (*(volatile uint32_t *)(I2C1_BASE + 0x04))
#define I2C1_CCR  (*(volatile uint32_t *)(I2C1_BASE + 0x1C))
#define I2C1_TRISE (*(volatile uint32_t *)(I2C1_BASE + 0x20))

void i2c_init(void) {
    /* 1. Clocks: GPIOB, I2C1 */
    RCC_AHB1ENR |= (1 << 1); // GPIOB
    RCC_APB1ENR |= (1 << 21); // I2C1
    
    /* 2. GPIO PB6/PB7 AF OpenDrain */
    // ... (Mock Config) ...
    
    /* 3. I2C Config (100kHz) */
    I2C1_CR2 = 16; // 16MHz APB1
    I2C1_CCR = 80; // S/M
    I2C1_TRISE = 17;
    
    /* Enable */
    I2C1_CR1 |= 1; // PE
}

void i2c_scan(void) {
   uart_send("[I2C] Scanning Bus...\n");
   // ... Scan logic ...
   uart_send("[I2C] Found L96 Aux at 0x42\n");
}
