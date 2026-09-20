# Clinical Scoring Guide

This document describes how the questionnaire responses are translated into numerical scores for the machine learning model.

## 1. Pain Score
- **Source:** Questionnaire Part 1 (Visual Analogue Scale slider).
- **Range:** 0 to 10
- **Calculation:** Direct value from the slider (0 = None, 10 = Severe).

## 2. Stiffness Score
- **Source:** Questionnaire Part 1 (Morning Stiffness duration).
- **Range:** 1 to 2
- **Calculation:** 
  - `< 30 mins` = 1
  - `>= 30 mins` = 2

## 3. Function Score
- **Source:** Questionnaire Part 2 (WOMAC Physical Function subset).
- **Range:** 0 to 12
- **Calculation:** Sum of 4 activities (stairs, rising, walking, squatting), each rated on a 0-3 scale:
  - 0 = None
  - 1 = Mild
  - 2 = Moderate
  - 3 = Severe
