/**
 * vision.c
 * DCMI Driver / Vision Task
 */

#include "os_kernel.h"
#include "drivers.h"

/* Mock Buffer for DCMI */
#define IMG_BUFFER_SIZE 128
uint8_t image_buffer[IMG_BUFFER_SIZE];

void task_vision(void) {
    uart_send("[Vision] Sensor Init (DCMI)...\n");
    
    /* Enable DCMI Capture (Mock Bit) */
    // DCMI->CR |= DCMI_CR_CAPTURE; 

    while (1) {
        /* Simulate VSYNC wait */
        delay(50000); 

        /* Simulated Frame Capture */
        led_toggle(1); // Orange LED (Activity)

        /* "Process" Image */
        for (int i = 0; i < IMG_BUFFER_SIZE; i++) {
            image_buffer[i] = i; // Dummy data fill
        }
        
        os_yield();
    }
}
