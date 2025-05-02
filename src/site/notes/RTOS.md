---
{"dg-publish":true,"dg-path":"机器人/RTOS.md","permalink":"/机器人/RTOS/","dgPassFrontmatter":true,"noteIcon":"","created":"2025-02-02T13:51:19.104+08:00","updated":"2025-05-02T17:43:21.167+08:00"}
---

(terminology::**Real-Time Operating System**)

These systems typically consist of a resource-constrained microcontroller that executes an application which requires an interaction with external components.

**实时性**：RTOS的核心特性是实时性，它能够保证任务在严格的时间约束内完成。这通常分为硬实时（Hard Real-Time）和软实时（Soft Real-Time）两种：
- **硬实时**：任务必须在绝对严格的时间限制内完成，否则可能导致系统故障。例如，汽车的防抱死制动系统（ABS）。  
- **软实时**：任务虽然也有时间限制，但偶尔的延迟不会导致系统故障。例如，视频播放系统。

[[FreeRTOS\|FreeRTOS]]
[[Zephyr\|Zephyr]]
[[NuttX\|NuttX]]

