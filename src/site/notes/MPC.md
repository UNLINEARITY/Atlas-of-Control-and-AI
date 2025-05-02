---
{"dg-publish":true,"dg-path":"A2- 控制理论/4. 先进控制理论/MPC.md","permalink":"/A2- 控制理论/4. 先进控制理论/MPC/","dgPassFrontmatter":true,"noteIcon":"","created":"2024-08-18T23:01:08.000+08:00","updated":"2025-05-02T17:47:13.008+08:00"}
---

(terminology::**Model Predictive Control**)   
它通过预测系统未来的行为来计算当前的[[最优控制\|最优控制]]动作

预测模型、滚动优化和反馈矫正三个部分
- 在推演过程中，采用**预测控制**思想：
    - 未来滚动预测若干步；
    - 每次选择当前最优动作而不是一次性确定完整计划。
- 有效应对动态变化的环境。











