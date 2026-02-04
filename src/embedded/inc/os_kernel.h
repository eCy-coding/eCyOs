#ifndef OS_KERNEL_H
#define OS_KERNEL_H

#include <stdint.h>
#include "stm32f4_manual.h"

/* Stack Size per Task */
#define TASK_STACK_SIZE 1024 

/* Task Control Block */
typedef struct {
    uint32_t *stack_ptr;   /* Pointer to current stack top */
    struct TCB *next;      /* Pointer to next task (Circular Linked List) */
    uint32_t task_id;
    char name[16];
} TCB;

/* Kernel API */
void os_kernel_init(void);
uint8_t os_task_create(void (*task_func)(void), char *name, uint32_t priority);
void os_kernel_launch(uint32_t quanta_ms);
void os_yield(void);

/* Scheduler (Called from Assembly) */
void os_scheduler_round_robin(void);

#endif
