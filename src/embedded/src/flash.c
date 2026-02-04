/**
 * flash.c
 * Internal Flash Driver (IAP / Knowledge Base)
 * Sector 11 (128KB) usage for storage
 */

#include "drivers.h"
#include "stm32f4_manual.h"

#define FLASH_R_BASE  0x40023C00
#define FLASH_KEYR    (*(volatile uint32_t *)(FLASH_R_BASE + 0x04))
#define FLASH_SR      (*(volatile uint32_t *)(FLASH_R_BASE + 0x0C))
#define FLASH_CR      (*(volatile uint32_t *)(FLASH_R_BASE + 0x10))

#define KEY1 0x45670123
#define KEY2 0xCDEF89AB

#define STORAGE_ADDR 0x080E0000 // Sector 11 Start

void flash_unlock(void) {
    FLASH_KEYR = KEY1;
    FLASH_KEYR = KEY2;
}

void flash_lock(void) {
    FLASH_CR |= (1 << 31); // LOCK bit
}

void flash_erase_sector11(void) {
     /* Wait for Busy */
    while(FLASH_SR & (1 << 16)); 

    flash_unlock();
    
    /* SER (Sector Erase) bit 1, SNB (Sector Num) = 11 (01011) -> bits 3-6 */
    FLASH_CR &= ~(0xF << 3); // Clear SNB
    FLASH_CR |= (11 << 3);   // Set SNB 11
    FLASH_CR |= (1 << 1);    // SER
    
    /* Start */
    FLASH_CR |= (1 << 16);   // STRT
    
    /* Wait for Busy */
    while(FLASH_SR & (1 << 16));
    
    /* Clear SER */
    FLASH_CR &= ~(1 << 1);
    
    flash_lock();
}

void flash_write_word(uint32_t offset, uint32_t data) {
    while(FLASH_SR & (1 << 16));
    
    flash_unlock();
    
    /* PG (Programming) */
    FLASH_CR |= (1 << 0);
    
    /* PSIZE x32 (10) -> bits 8,9 */
    FLASH_CR &= ~(3 << 8);
    FLASH_CR |= (2 << 8);
    
    /* Write Data */
    *(volatile uint32_t*)(STORAGE_ADDR + offset) = data;
    
    while(FLASH_SR & (1 << 16));
    
    FLASH_CR &= ~(1 << 0); // Clear PG
    flash_lock();
}

uint32_t flash_read_word(uint32_t offset) {
    return *(volatile uint32_t*)(STORAGE_ADDR + offset);
}
