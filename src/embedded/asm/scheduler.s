/**
 * scheduler.s
 * Antigravity "Swarm" Kernel - Context Switcher
 * Target: Cortex-M4 (STM32F4)
 */

.syntax unified
.cpu cortex-m4
.fpu softvfp
.thumb

.global PendSV_Handler
.global SVC_Handler
.global os_start_first_task

/* External Symbols from os_kernel.c */
.extern current_ptcb  /* Pointer to current TCB */

/* 
 * void os_start_first_task(void)
 * Sets up PSP and jumps to the first task.
 */
.section .text.os_start_first_task
.type os_start_first_task, %function
os_start_first_task:
    /* Get the location of current_ptcb */
    ldr r0, =current_ptcb
    ldr r0, [r0]        /* r0 = current_ptcb */
    ldr r0, [r0]        /* r0 = current_ptcb->stack_ptr (first element) */

    /* Load the new PSP from the TCB */
    msr psp, r0

    /* Switch to use PSP (Control Register Bit 1 = 1) */
    mov r0, #2
    msr control, r0
    isb                 /* Instruction Sync Barrier */

    /* Pop the exception frame (simulated) manually or just jump */
    /* Since we initialized stack to look like an exception frame, we pop: */
    /* R4-R11 (manual) then HW pops R0-R3, R12, LR, PC, xPSR */
    
    pop {r4-r11}
    pop {r0-r3}
    pop {r12}
    add sp, sp, #4      /* Skip LR (Link Register) */
    pop {lr}            /* Pop PC into LR to branch */
    add sp, sp, #4      /* Skip xPSR */
    
    bx lr               /* Jump to task! */

.size os_start_first_task, .-os_start_first_task

/*
 * SVC_Handler
 * Used to launch the OS
 */
.section .text.SVC_Handler
.type SVC_Handler, %function
SVC_Handler:
    /* In a real OS, we decode SVC number. Here we just launch. */
    b os_start_first_task
.size SVC_Handler, .-SVC_Handler

/*
 * PendSV_Handler
 * Performs the Context Switch.
 * Triggered by the Scheduler (SysTick or Yeild).
 */
.section .text.PendSV_Handler
.type PendSV_Handler, %function
PendSV_Handler:
    cpsid i             /* Disable Interrupts */

    /* 1. Save Context of Current Task */
    mrs r0, psp         /* Get current PSP */
    
    /* Save R4-R11 (Callee Saved) onto the task stack */
    stmdb r0!, {r4-r11}

    /* Save updated PSP back to the TCB */
    ldr r1, =current_ptcb
    ldr r2, [r1]        /* r2 = current_ptcb */
    str r0, [r2]        /* current_ptcb->stack_ptr = new PSP */

    /* 2. Select Next Task */
    push {r14}          /* Save LR (EXC_RETURN) */
    bl os_scheduler_round_robin  /* Call C function to update current_ptcb */
    pop {r14}

    /* 3. Restore Context of Next Task */
    ldr r1, =current_ptcb
    ldr r2, [r1]        /* r2 = new pointer to current_ptcb */
    ldr r0, [r2]        /* r2 = new TCB, r0 = new stack_ptr */

    /* Restore R4-R11 */
    ldmia r0!, {r4-r11}

    /* Update PSP */
    msr psp, r0

    cpsie i             /* Enable Interrupts */
    bx r14              /* Return from Exception (Hardware restores R0-R3, PC, etc.) */
.size PendSV_Handler, .-PendSV_Handler
