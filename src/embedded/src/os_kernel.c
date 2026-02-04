/**
 * os_kernel.c
 * Antigravity "Swarm" Kernel - Logic
 * Implements Cooperative/Preemptive Round Robin Scheduler
 */

#include "os_kernel.h"

/* Constants */
#define MAX_TASKS 10
#define BUS_FREQ 16000000
#define SYSTICK_RVR (*((volatile uint32_t *)0xE000E014))
#define SYSTICK_CVR (*((volatile uint32_t *)0xE000E018))
#define SYSTICK_CSR (*((volatile uint32_t *)0xE000E010))
#define SCB_ICSR    (*((volatile uint32_t *)0xE000ED04))

/* Global Variables */
TCB tcbs[MAX_TASKS];
uint32_t task_stacks[MAX_TASKS][TASK_STACK_SIZE];
TCB *current_ptcb;
uint8_t task_count = 0;

/* Initialize the Kernel */
void os_kernel_init(void) {
    task_count = 0;
    current_ptcb = &tcbs[0];
}

/* Initialize Task Stack (Simulating Exception Frame) */
/* Stack Frame: xPSR, PC, LR, R12, R3, R2, R1, R0, R11-R4 */
void os_stack_init(uint8_t i) {
    tcbs[i].stack_ptr = &task_stacks[i][TASK_STACK_SIZE - 16]; // Point to top - 16 regs

    /* Set xPSR (Bit 24 = 1 for Thumb Mode) */
    task_stacks[i][TASK_STACK_SIZE - 1] = 0x01000000; 
    
    /* PC (Programming Counter) - Entry Point handled in create */
    
    /* LR (Link Register) - Return to something safe if task exits */
    task_stacks[i][TASK_STACK_SIZE - 3] = 0xFFFFFFFD; // EXC_RETURN using PSP

    /* R0-R12 and R4-R11 can be 0 init */
}

/* Create a new Task ("Agent") */
uint8_t os_task_create(void (*task_func)(void), char *name, uint32_t priority) {
    if (task_count >= MAX_TASKS) return 0;
    
    uint8_t i = task_count;
    
    /* Init Stack Pointer */
    os_stack_init(i);
    
    /* Set PC to function address */
    task_stacks[i][TASK_STACK_SIZE - 2] = (uint32_t)task_func;

    /* Set TCB Links */
    tcbs[i].next = &tcbs[0]; // Default circular
    if (i > 0) {
        tcbs[i-1].next = &tcbs[i];
    }
    
    /* Name & ID */
    tcbs[i].task_id = i;
    // Simple copy loop for name
    char *d = tcbs[i].name;
    while (*name && (d - tcbs[i].name < 15)) *d++ = *name++;
    *d = 0;

    task_count++;
    return 1;
}

/* Scheduler Logic (Called from Assembly PendSV) */
void os_scheduler_round_robin(void) {
    current_ptcb = current_ptcb->next;
}

/* Start the Scheduler */
/* Assumes 16HMz, quanta_ms milliseconds per tick */
void os_kernel_launch(uint32_t quanta_ms) {
    /* Configure SysTick */
    SYSTICK_RVR = (BUS_FREQ / 1000) * quanta_ms - 1;
    SYSTICK_CVR = 0;
    SYSTICK_CSR = 7; // Enable, Int, Clk Src

    /* Start First Task via SVC */
    __asm("svc #0"); 
}

/* Voluntary Yield */
void os_yield(void) {
    /* Trigger PendSV manually */
    SCB_ICSR |= (1 << 28); // PENDSVSET
}
