/**
 * wdg.c
 * Independent Watchdog (IWDG) Driver
 * Ensures system reliability/recovery
 */

#include "drivers.h"
#include "stm32f4_manual.h"

/* IWDG Registers */
#define IWDG_BASE 0x40003000
#define IWDG_KR   (*(volatile uint32_t *)(IWDG_BASE + 0x00))
#define IWDG_PR   (*(volatile uint32_t *)(IWDG_BASE + 0x04))
#define IWDG_RLR  (*(volatile uint32_t *)(IWDG_BASE + 0x08))
#define IWDG_SR   (*(volatile uint32_t *)(IWDG_BASE + 0x0C))

void wdg_init(void) {
    /* 1. Enable Write Access */
    IWDG_KR = 0x5555;
    
    /* 2. Set Prescaler (32kHz LSI) */
    /* Prescaler /256 (0x06) -> ~125Hz clock */
    IWDG_PR = 0x06; 
    
    /* 3. Set Reload Value */
    /* 125Hz * 2s = 250 counts */
    IWDG_RLR = 250; 
    
    /* 4. Start IWDG */
    IWDG_KR = 0xCCCC;
}

void wdg_feed(void) {
    /* Reload Counter */
    IWDG_KR = 0xAAAA;
}
