# Antigravity Embedded (STM32F4) 🛰️

The Hardware Cortex of the Antigravity System. A bare-metal, event-driven kernel designed for real-time control of the "Antigravity Hardware Interface".

## 🔌 Wiring Diagram (STM32F4 Discovery)

```ascii
     [ STM32F4 Discovery ]
       |            |
       | PA2 (TX) --|-----> [ GNSS L96 RX ]
       | PA3 (RX) --|-----> [ GNSS L96 TX ]
       |            |
       | PB6 (SCL)--|-----> [ I2C Sensors ]
       | PB7 (SDA)--|-----> [ I2C Sensors ]
       |            |
       | PA9 (USB) -|-----> [ Host PC / Antigravity Agent ]
       |            |
       | PC13 ------|-----> [ Status LED ] 🟢
       |____________|
```

## 🛠️ Build Instructions

### Prerequisites
- `arm-none-eabi-gcc` (GNU Arm Embedded Toolchain)
- `make`
- `st-flash` (stlink)

### Installation (macOS)
```bash
brew install --cask gcc-arm-embedded
brew install stlink
```

### Building
```bash
make all
```

### Flashing
```bash
make flash
```

## 🧩 Modules
- **`os_kernel.c`**: Cooperative Round-Robin Scheduler.
- **`brain.c`**: Main State Machine (Idle -> Listen -> Action).
- **`vision.c`**: DCMI Driver for Camera Module (Future).
- **`drivers.c`**: Low-level HAL (GPIO, UART, I2C).
