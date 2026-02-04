/**
 * Embedded Antigravity Main
 * Target: STM32F407
 * Architecture: Swarm OS (Cooperative)
 */

#include "drivers.h"
#include "os_kernel.h"

/* External Task Functions */
extern void task_brain(void);
extern void task_vision(void);
extern void task_cli(void);
extern void task_gnss(void);
extern void task_plc_monitor(void);
extern void task_comms(void);
extern void buzzer_init(void);
extern void buzzer_beep(int);
extern void industrial_init(void);
/* Phase 3 Externs */
extern void wdg_init(void);
extern void wdg_feed(void); /* Called in idle/scheduler ideally, or specific task */
extern void flash_read_word(uint32_t);
extern void rs485_init(void);
extern void adc_init(void);
extern void i2c_init(void);

/* Helper for simple delay loops in tasks */
void delay(volatile uint32_t count) {
    while(count--);
}

/* System Monitor Task (Watchdog Feeder) */
void task_sys_mon(void) {
    while(1) {
        wdg_feed();
        os_yield();
    }
}

int main(void) {
    /* 1. Initialize Hardware (Clocks, GPIO, UART, DCMI) */
    hardware_init();
    buzzer_init();
    industrial_init();
    
    /* Phase 3 Inits */
    rs485_init();
    adc_init();
    i2c_init();
    
    // Initial Beep
    buzzer_beep(100); 
    
    uart_send("\n\n=== ANTIGRAVITY EMBEDDED STARTUP (UNIVERSAL) ===\n");
    uart_send("Init: Drivers & Expansion Modules OK.\n");
    uart_send("Init: Industrial Hardening (WDG, Flash, RS485) OK.\n");

    /* 2. Initialize OS Kernel */
    os_kernel_init();
    
    /* 3. Create Swarm Agents (Tasks) */
    os_task_create(task_brain, "Brain", 1);
    os_task_create(task_vision, "Vision", 2);
    os_task_create(task_cli, "CLI", 3);
    os_task_create(task_gnss, "GNSS", 4);
    os_task_create(task_plc_monitor, "PLC", 5);
    os_task_create(task_comms, "Comms", 6);
    // Task 7: System Monitor (High Prio Feeder)
    os_task_create(task_sys_mon, "SysMon", 0);
    
    /* Enable Watchdog Last */
    wdg_init(); 

    /* 4. Launch Scheduler */
    uart_send("System: Launching Swarm...\n");
    os_kernel_launch(10); // 10ms tick

    /* Should never reach here */
    while(1);
}
