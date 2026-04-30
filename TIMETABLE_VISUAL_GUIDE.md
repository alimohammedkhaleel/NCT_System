# 🎨 دليل التصميم البصري - الجداول الدراسية

## 📐 Layout Structure

### Desktop View (> 768px)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         جدولي الدراسي                                   │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  ┌────┐  ┌──────────────────────────────────────────┐  ┌──────────┐   │
│  │ 📅 │  │ جدول السنة الأولى - الترم الأول          │  │ عرض      │   │
│  │    │  │ [تكنولوجيا المعلومات]                    │  │ الجدول   │   │
│  │    │  │ 📄 ICT_Y1_S1.pdf  💾 240.5 KB           │  │          │   │
│  │    │  │ 📅 15 سبتمبر 2024                        │  │          │   │
│  └────┘  └──────────────────────────────────────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  ┌────┐  ┌──────────────────────────────────────────┐  ┌──────────┐   │
│  │ 📅 │  │ جدول السنة الأولى - الترم الثاني         │  │ عرض      │   │
│  │    │  │ [تكنولوجيا المعلومات]                    │  │ الجدول   │   │
│  │    │  │ 📄 ICT_Y1_S2.pdf  💾 235.8 KB           │  │          │   │
│  │    │  │ 📅 20 فبراير 2025                        │  │          │   │
│  └────┘  └──────────────────────────────────────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Tablet View (≤ 768px)

```
┌───────────────────────────────────────┐
│         جدولي الدراسي                 │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│              ┌────┐                   │
│              │ 📅 │                   │
│              └────┘                   │
│                                       │
│   جدول السنة الأولى - الترم الأول     │
│      [تكنولوجيا المعلومات]            │
│                                       │
│      📄 ICT_Y1_S1.pdf                │
│      💾 240.5 KB                     │
│      📅 15 سبتمبر 2024               │
│                                       │
│   ┌─────────────────────────────┐    │
│   │      عرض الجدول              │    │
│   └─────────────────────────────┘    │
└───────────────────────────────────────┘
```

### Mobile View (≤ 480px)

```
┌─────────────────────────┐
│    جدولي الدراسي        │
└─────────────────────────┘

┌─────────────────────────┐
│        ┌────┐           │
│        │ 📅 │           │
│        └────┘           │
│                         │
│  جدول السنة الأولى      │
│    الترم الأول          │
│  [تكنولوجيا المعلومات]  │
│                         │
│  📄 ICT_Y1_S1.pdf      │
│  💾 240.5 KB          │
│  📅 15 سبتمبر 2024    │
│                         │
│ ┌─────────────────────┐ │
│ │   عرض الجدول        │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

---

## 🎨 Color Palette

### Primary Colors
```
Purple Primary:    #b36eff  ████████
Purple Light:      #d4a5ff  ████████
Purple Dark:       #8b4fd9  ████████
```

### Background Colors
```
Purple Transparent: rgba(179, 110, 255, 0.1)  ░░░░░░░░
Border Purple:      rgba(179, 110, 255, 0.2)  ▒▒▒▒▒▒▒▒
Glow Purple:        rgba(179, 110, 255, 0.3)  ▓▓▓▓▓▓▓▓
```

### Text Colors
```
White:         #ffffff  ████████
White Dim:     rgba(255, 255, 255, 0.7)  ▓▓▓▓▓▓▓▓
```

---

## 📏 Spacing System

```
┌─────────────────────────────────────┐
│  ← 24px →                           │  Padding
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  │  ← 20px →                     │  │  Gap between elements
│  │  ┌────┐  ┌────────────────┐  │  │
│  │  │Icon│  │Content         │  │  │
│  │  └────┘  └────────────────┘  │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

### Spacing Values
```
xs:   4px   ▌
sm:   8px   ▌▌
md:  16px   ▌▌▌▌
lg:  24px   ▌▌▌▌▌▌
xl:  32px   ▌▌▌▌▌▌▌▌
2xl: 48px   ▌▌▌▌▌▌▌▌▌▌▌▌
```

---

## 🎭 States

### Normal State
```
┌─────────────────────────────────────┐
│  ┌────┐  Content         [Button]  │  ← Border: 1px solid
│  │ 📅 │                             │  ← Shadow: 0 4px 12px
│  └────┘                             │  ← Background: transparent
└─────────────────────────────────────┘
```

### Hover State
```
┌─────────────────────────────────────┐  ← Lifted up (translateY: -4px)
│█ ┌────┐  Content         [Button]  │  ← Border: glowing
│█ │ 📅 │                             │  ← Shadow: 0 8px 24px
│█ └────┘                             │  ← Gradient line on right
└─────────────────────────────────────┘
     ↑
   Scaled
```

### Empty State
```
┌─────────────────────────────────────┐
│                                     │
│              📅                     │  ← Floating animation
│         (4rem size)                 │
│                                     │
│      لا توجد جداول دراسية          │  ← Title
│                                     │
│   لا يوجد جدول دراسي متاح          │  ← Description
│      لتخصصك حتى الآن               │
│                                     │
└─────────────────────────────────────┘
```

---

## 🎬 Animations

### Float Animation (3s loop)
```
Frame 1 (0s):     ┌────┐
                  │ 📅 │  ← Position: 0px
                  └────┘

Frame 2 (1.5s):   ┌────┐
                  │ 📅 │  ← Position: -10px (up)
                  └────┘

Frame 3 (3s):     ┌────┐
                  │ 📅 │  ← Position: 0px
                  └────┘
```

### Hover Transition (0.2s)
```
Before:  ┌────────┐
         │ Card   │  ← Y: 0px
         └────────┘

After:   ┌────────┐  ← Y: -4px
         │ Card   │
         └────────┘
         ▓▓▓▓▓▓▓▓  ← Shadow grows
```

---

## 🔤 Typography

### Title
```
Font Size:    1.05rem (16.8px)
Font Weight:  700 (Bold)
Color:        #ffffff
Shadow:       0 2px 6px purple glow
Line Height:  1.3
```

### Badge
```
Font Size:    0.75rem (12px)
Font Weight:  600 (Semi-bold)
Color:        #d4a5ff
Padding:      4px 12px
Border:       1px solid rgba(179, 110, 255, 0.3)
```

### Meta Text
```
Font Size:    0.8rem (12.8px)
Font Weight:  400 (Regular)
Color:        rgba(255, 255, 255, 0.7)
```

---

## 🎯 Icon Sizes

### Main Icon (Calendar)
```
┌──────────┐
│          │
│    📅    │  40x40px
│          │
└──────────┘
```

### Meta Icons
```
┌────┐
│ 📄 │  16x16px
└────┘
```

### Button Icon
```
┌──────┐
│  👁  │  20x20px
└──────┘
```

---

## 📐 Component Dimensions

### Card
```
Width:         100% (flex)
Height:        auto
Padding:       20px 24px
Border Radius: 12px
Gap:           20px
```

### Icon Container
```
Width:         56px
Height:        56px
Min Width:     56px
Border Radius: 12px
```

### Button
```
Padding:       10px 20px
Border Radius: 10px
Gap:           8px
```

### Badge
```
Padding:       4px 12px
Border Radius: 6px
```

---

## 🎨 Visual Effects

### Glass Morphism
```
┌─────────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│  ← Blur effect
│░░┌────┐░░Content░░░░░░░░[Button]░░│  ← Semi-transparent
│░░│ 📅 │░░░░░░░░░░░░░░░░░░░░░░░░░░░│  ← Border glow
│░░└────┘░░░░░░░░░░░░░░░░░░░░░░░░░░░│
└─────────────────────────────────────┘
```

### Gradient Border (on hover)
```
█┌─────────────────────────────────────┐
█│  ┌────┐  Content         [Button]  │
█│  │ 📅 │                             │
█│  └────┘                             │
█└─────────────────────────────────────┘
↑
4px gradient line
(purple → light purple)
```

### Shadow Glow
```
         ┌────────┐
         │ Card   │
         └────────┘
      ▒▒▒▒▒▒▒▒▒▒▒▒▒▒  ← Purple glow
    ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
```

---

## 📱 Responsive Behavior

### Desktop → Tablet
```
Desktop:                    Tablet:
┌─────────────────────┐    ┌─────────────┐
│ [Icon] Content [Btn]│ →  │   [Icon]    │
└─────────────────────┘    │   Content   │
                           │   [Button]  │
                           └─────────────┘
```

### Tablet → Mobile
```
Tablet:                     Mobile:
┌─────────────┐            ┌───────────┐
│   [Icon]    │         →  │  [Icon]   │
│   Content   │            │  Content  │
│   [Button]  │            │ [Button]  │
└─────────────┘            └───────────┘
     ↓                          ↓
  Centered                  Smaller
```

---

## 🎯 Interaction Zones

### Clickable Areas
```
┌─────────────────────────────────────┐
│  ┌────┐  ┌────────────────────────┐ │
│  │    │  │                        │ │  ← Entire card is
│  │    │  │      Content           │ │     hoverable
│  │    │  │                        │ │
│  └────┘  └────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────┐   │  ← Button is
│  │      عرض الجدول              │   │     clickable
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## 🎨 Theme Consistency

### All Components Use Same Variables
```
Card Background:    var(--purple-transparent)
Card Border:        var(--border-purple)
Card Shadow:        var(--glow-purple)
Text Color:         var(--white)
Text Dim:           var(--white-dim)
Accent Color:       var(--purple-primary)
Accent Light:       var(--purple-light)
```

---

## ✨ Visual Hierarchy

```
Level 1 (Most Important):
  ┌────────────────┐
  │ Title (1.05rem)│  ← Bold, White, Shadow
  └────────────────┘

Level 2 (Secondary):
  ┌────────────────┐
  │ Badge (0.75rem)│  ← Semi-bold, Purple
  └────────────────┘

Level 3 (Tertiary):
  ┌────────────────┐
  │ Meta (0.8rem)  │  ← Regular, White Dim
  └────────────────┘
```

---

**تاريخ الإنشاء:** 2026-04-22  
**الإصدار:** 1.0.0
