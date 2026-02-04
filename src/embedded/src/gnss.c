/**
 * gnss.c
 * Quectel L96 Driver (NMEA Parser)
 * Interface: UART (Simulated)
 */

#include "drivers.h"
#include "os_kernel.h"
#include <string.h>

/* GNSS Data Structure */
typedef struct {
    char time[12];
    char lat[12];
    char lon[12];
    int fix_valid;
} GNSS_Data_t;

GNSS_Data_t system_pos;

/* Simple NMEA Parser (GPRMC) */
/* Format: $GPRMC,123519,A,4807.038,N,01131.000,E,... */
void parse_nmea(char *buffer) {
    if (strncmp(buffer, "$GPRMC", 6) == 0) {
        // Mock parsing logic relying on comma counting
        // In prod, use a tokenizer or strchr loop
        
        // Check Validity (Field 2: 'A' or 'V')
        // For simplicity in this embedded mock, we assume valid
        system_pos.fix_valid = 1;
        
        // Extract Time (Field 1)
        // Extract Lat (Field 3)
        // Extract Lon (Field 5)
        
        // Debug
        uart_send("[GNSS] Fix Updated: ");
        uart_send("Lat: 41.0082 N, Lon: 28.9784 E\n");
    }
}

void task_gnss(void) {
    uart_send("[GNSS] L96 Module Init...\n");
    
    // Simulate Rx Buffer
    char rx_buf[128];
    int rx_idx = 0;
    
    while (1) {
        // In real HW, this listens to UART IRQ or DMA buffer.
        // Simul: We fake receiving a GPRMC string every few seconds.
        
        char *mock_nmea = "$GPRMC,120000,A,4100.00,N,02800.00,E,000.0,000.0,120126,,,A*77";
        
        // Simulate "Reading" character by character
        for (int i=0; mock_nmea[i] != 0; i++) {
            rx_buf[rx_idx++] = mock_nmea[i];
            if (mock_nmea[i] == '\n' || mock_nmea[i] == '\r') {
                rx_buf[rx_idx] = 0;
                parse_nmea(rx_buf);
                rx_idx = 0;
            }
        }

        led_toggle(1); // Blink Orange for GPS activity
        
        for (int i=0; i<100; i++) os_yield(); // Wait for next update (1Hz)
    }
}
