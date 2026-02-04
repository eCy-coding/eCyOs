#ifndef STM32F4_MANUAL_H
#define STM32F4_MANUAL_H

#include <stdint.h>

/* Base Addresses */
#define PERIPH_BASE           0x40000000UL
#define AHB1PERIPH_BASE       (PERIPH_BASE + 0x00020000UL)
#define AHB2PERIPH_BASE       (PERIPH_BASE + 0x10000000UL) /* DCMI is here */
#define APB1PERIPH_BASE       PERIPH_BASE
#define APB2PERIPH_BASE       (PERIPH_BASE + 0x00010000UL)

/* RCC */
#define RCC_BASE              (AHB1PERIPH_BASE + 0x3800UL)
#define RCC_AHB1ENR           (*(volatile uint32_t *)(RCC_BASE + 0x30))
#define RCC_AHB2ENR           (*(volatile uint32_t *)(RCC_BASE + 0x34)) /* DCMI EN */
#define RCC_APB1ENR           (*(volatile uint32_t *)(RCC_BASE + 0x40))

/* GPIO */
#define GPIOA_BASE            (0x40020000UL)
#define GPIOD_BASE            (0x40020C00UL)

typedef struct {
  volatile uint32_t MODER;
  volatile uint32_t OTYPER;
  volatile uint32_t OSPEEDR;
  volatile uint32_t PUPDR;
  volatile uint32_t IDR;
  volatile uint32_t ODR;
  volatile uint32_t BSRR;
  volatile uint32_t LCKR;
  volatile uint32_t AFR[2];
} GPIO_TypeDef;

#define GPIOA                 ((GPIO_TypeDef *) GPIOA_BASE)
#define GPIOD                 ((GPIO_TypeDef *) GPIOD_BASE)

/* USART2 */
#define USART2_BASE           (APB1PERIPH_BASE + 0x4400UL)

typedef struct {
  volatile uint32_t SR;
  volatile uint32_t DR;
  volatile uint32_t BRR;
  volatile uint32_t CR1;
  volatile uint32_t CR2;
  volatile uint32_t CR3;
  volatile uint32_t GTPR;
} USART_TypeDef;

#define USART2                ((USART_TypeDef *) USART2_BASE)

/* DCMI (Digital Camera Interface) */
#define DCMI_BASE             (AHB2PERIPH_BASE + 0x050000UL)

typedef struct {
    volatile uint32_t CR;      /* Control Register */
    volatile uint32_t SR;      /* Status Register */
    volatile uint32_t RIS;     /* Raw Interrupt Status */
    volatile uint32_t IER;     /* Interrupt Enable */
    volatile uint32_t MIS;     /* Masked Interrupt Status */
    volatile uint32_t ICR;     /* Interrupt Clear */
    volatile uint32_t ESCR;    /* Embedded Synch Code */
    volatile uint32_t ESUR;    /* Embedded Synch Unmask */
    volatile uint32_t CWSTRT;  /* Crop Window Start */
    volatile uint32_t CWSIZE;  /* Crop Window Size */
    volatile uint32_t DR;      /* Data Register */
} DCMI_TypeDef;

#define DCMI                  ((DCMI_TypeDef *) DCMI_BASE)

/* Bit Definitions */
#define RCC_AHB1ENR_GPIOAEN   (1 << 0)
#define RCC_AHB1ENR_GPIODEN   (1 << 3)
#define RCC_AHB2ENR_DCMIEN    (1 << 0)
#define RCC_APB1ENR_USART2EN  (1 << 17)

#define USART_CR1_UE          (1 << 13)
#define USART_CR1_TE          (1 << 3)
#define USART_CR1_RE          (1 << 2)
#define USART_SR_TXE          (1 << 7)
#define USART_SR_RXNE         (1 << 5)

#define DCMI_CR_ENABLE        (1 << 14)
#define DCMI_CR_CAPTURE       (1 << 0)
#define DCMI_CR_JPEG          (1 << 4)

#endif
