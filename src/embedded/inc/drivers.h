#ifndef DRIVERS_H
#define DRIVERS_H

#include <stdint.h>

void hardware_init(void);
void uart_send(char *str);
char uart_read_nonblocking(void);
void led_toggle(int led_idx); // 0=Green, 1=Orange, 2=Red, 3=Blue

#endif
