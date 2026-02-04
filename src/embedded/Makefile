################################################################################
# Antigravity Embedded Makefile
# Target: STM32F4
# Toolchain: arm-none-eabi-gcc
################################################################################

# Project Name
TARGET = antigravity_embedded

# Directories
SRC_DIR = src
ASM_DIR = asm
INC_DIR = inc
LD_DIR = ld
BUILD_DIR = build

# Sources
C_SOURCES = $(wildcard $(SRC_DIR)/*.c)
ASM_SOURCES = $(wildcard $(ASM_DIR)/*.s)

# Binaries
CC = arm-none-eabi-gcc
AS = arm-none-eabi-as
CP = arm-none-eabi-objcopy
SZ = arm-none-eabi-size

# Flags
MCU = -mcpu=cortex-m4 -mthumb -mfloat-abi=soft
CFLAGS = $(MCU) -g -Wall -I$(INC_DIR) -std=c99 -O0
LDFLAGS = $(MCU) -T$(LD_DIR)/stm32f4.ld -Wl,-Map=$(BUILD_DIR)/$(TARGET).map -Wl,--gc-sections --specs=nosys.specs

# Build Rules
all: $(BUILD_DIR)/$(TARGET).elf $(BUILD_DIR)/$(TARGET).bin

$(BUILD_DIR)/$(TARGET).elf: $(C_SOURCES) $(ASM_SOURCES)
	@mkdir -p $(BUILD_DIR)
	@echo "[LINK] Linking $@"
	$(CC) $(CFLAGS) $(LDFLAGS) $^ -o $@
	@echo "[SIZE] System Footprint:"
	$(SZ) $@

$(BUILD_DIR)/$(TARGET).bin: $(BUILD_DIR)/$(TARGET).elf
	@echo "[COPY] Creating Binary $@"
	$(CP) -O binary $< $@

clean:
	rm -rf $(BUILD_DIR)

.PHONY: all clean
