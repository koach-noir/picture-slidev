---
transition: fade-out
mdc: true
theme: '@slidev/theme-default'
# theme: '@slidev/theme-apple-basic'
# theme: '@slidev/theme-bricks'
dark: true  # ダークモードを有効化
highlighter: shiki
background: "/images/sun-in-the-universe.svg"
class: 'bg-contain bg-center bg-no-repeat'
---

<div class="content-wrapper">
  <div class="floating-title">

# <!-- Title --> 天体

## 太陽・地球・月

  </div>


  <SolarSystemAnimation 
    v-if="$slidev"
    :earth-orbit-duration="400000"
    :moon-orbit-duration="37750"
    :earth-size="840"
    :moon-size="495"
  />
</div>

---
src: ./pages/toc.md
transition: slide-down
activeTopic: "sun"
---

<!-- this page will be loaded from './pages/toc.md' Contents here are ignored -->

---

# 太陽について

<div class="layout">
  <!-- 左側：説明文 -->
  <div class="content-left">
    <div class="sun-facts">
<v-clicks every="1">

+ 銀河系（天の川銀河）の恒星の一つ
+ 地球も含まれる太陽系の物理的中心
+ 太陽系の全質量の99.8 %を占める
+ 太陽系の全天体に重力の影響を与える

</v-clicks>
    </div>
  </div>

  <!-- 右側：画像とアニメーション -->
  <div class="content-right">
    <!-- <CelestialImage title="太陽" imageName="sun" /> -->
    <CelestialImage title="太陽" imageName="sun" :imageSize="360" />
  </div>
</div>

---
src: ./pages/toc.md
transition: slide-down
activeTopic: "earth"
---

<!-- this page will be loaded from './pages/toc.md' Contents here are ignored -->

---

# 地球について

<div class="layout">
  <!-- 左側：説明文 -->
  <div class="content-left">
    <div class="earth-facts">
<v-clicks every="1">

+ 太陽系の惑星の1つ
+ 水星、金星に次いで太陽から3番目に近い
+ そのため太陽系第3惑星と言われる
+ 表面に水、空気中に酸素を大量に蓄える
+ 人類を含む多種多様な生命体が生存する

</v-clicks>
    </div>
  </div>

  <!-- 右側：画像とアニメーション -->
  <div class="content-right">
    <CelestialImage title="地球" imageName="earth" :imageSize="300" />
  </div>
</div>

---
src: ./pages/toc.md
transition: slide-down
activeTopic: "moon"
---

<!-- this page will be loaded from './pages/toc.md' Contents here are ignored -->

---

# 月について

<div class="layout">
  <!-- 左側：説明文 -->
  <div class="content-left">
    <div class="moon-facts">
<v-clicks every="1">

+ 地球の唯一の衛星
+ 地球からの平均距離：約38万4,400km
+ 直径：約3,475km（地球の約1/4）
+ 公転周期：約27.3日

</v-clicks>
    </div>
  </div>

  <!-- 右側：画像とアニメーション -->
  <div class="content-right">
    <CelestialImage title="月" imageName="moon" :imageSize="200" />
  </div>
</div>

---
