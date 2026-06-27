# HRBP Dashboard Premium Theme

เอกสารรวบรวมการตั้งค่าธีม คลาสสไตล์ และเอฟเฟกต์แอนิเมชันระดับพรีเมียม (Glassmorphism & Interactive UI) ที่ใช้งานในโปรเจกต์นี้ เพื่อให้นำไปประยุกต์ใช้งานกับระบบอื่นๆ ต่อได้ง่ายขึ้น

---

## 1. Setup Framework & Fonts

วางโค้ดนี้ไว้ที่ส่วน `<head>` ของไฟล์ HTML เพื่อเรียกใช้ Tailwind CSS (ผ่าน CDN) และฟอนต์ภาษาไทย/อังกฤษ (Inter & Sarabun)

```html
<!-- Tailwind CSS (CDN) -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- Google Fonts (Inter & Sarabun) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

---

## 2. Core Styles & Keyframe Animations

คัดลอก CSS ส่วนนี้ไปวางไว้ที่ส่วน `<style>` ของโปรเจกต์ หรือไฟล์ `index.css` เพื่อเปิดใช้งานเอฟเฟกต์การแสดงผลพรีเมียม

```css
/* การตั้งค่า Font Family และสีพื้นหลังเริ่มต้น */
body {
  font-family: 'Inter', 'Sarabun', sans-serif;
  background-color: #f8fafc;
}

/* Custom scrollbar สำหรับ Sidebar/กล่องข้อมูล */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* ==========================================================================
   PREMIUM EFFECTS & ANIMATIONS
   ========================================================================== */

/* 1. Animated Gradient Background (พื้นหลังไล่โทนสีและขยับได้ลื่นไหล) */
@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
.animated-gradient {
  background: linear-gradient(-45deg, #667eea, #764ba2, #6B8DD6, #8E37D7);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}

/* 2. Glassmorphism (เอฟเฟกต์กระจกฝ้าเบลอหลัง) */
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
.glass-dark {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 3. Card Hover Lift (เอฟเฟกต์ยกตัวและเงาซ้อนเมื่อชี้เมาส์) */
.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.card-hover:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}

/* 4. Gradient Border (ขอบการ์ดเรืองแสงแบบไล่โทนสีเมื่อโฮเวอร์) */
.gradient-border {
  position: relative;
  background: white;
  border-radius: 1rem;
}
.gradient-border::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 1.125rem;
  background: linear-gradient(135deg, #667eea, #764ba2, #f093fb);
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.gradient-border:hover::before {
  opacity: 1;
}

/* 5. Text Gradient (ตัวหนังสือไล่เฉดสีเฉพาตัว) */
.text-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 6. Button Shine Effect (แสงสะท้อน Sweep วิ่งผ่านตัวปุ่มเมื่อชี้เมาส์) */
.btn-shine {
  position: relative;
  overflow: hidden;
}
.btn-shine::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}
.btn-shine:hover::after {
  left: 100%;
}

/* 7. Floating (เอฟเฟกต์ลอยขึ้นลงเบาๆ สำหรับองค์ประกอบหน้าต้อนรับ/Hero) */
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(3deg); }
}
@keyframes floatReverse {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(20px) rotate(-3deg); }
}
.float-slow {
  animation: float 8s ease-in-out infinite;
}
.float-medium {
  animation: floatReverse 6s ease-in-out infinite;
}

/* 8. Pulse Glow (เอฟเฟกต์ปุ่มเรืองแสงวาบเป็นจังหวะ) */
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); }
  50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.8); }
}
.pulse-glow {
  animation: pulseGlow 2s ease-in-out infinite;
}
```

---

## 3. วิธีการนำคลาสไปประยุกต์ใช้งาน (HTML/React Examples)

### ตัวอย่างการใช้ Glassmorphism คู่กับ Hover Lift:
```html
<div class="glass card-hover p-6 rounded-2xl shadow-lg max-w-sm">
  <h3 class="text-xl font-semibold text-slate-800 mb-2">Glassmorphism Card</h3>
  <p class="text-slate-600 text-sm">การ์ดสไตล์กระจกฝ้าที่จะยกตัวและขยายขนาดขึ้นเล็กน้อยเมื่อชี้เมาส์</p>
</div>
```

### ตัวอย่างปุ่มเฉดสีรุ้งพร้อมเอฟเฟกต์แสงสะท้อนวิ่งผ่าน (Button Shine):
```html
<button class="btn-shine bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all duration-300">
  รับข้อเสนอพิเศษ
</button>
```

### ตัวอย่างหัวข้อไล่โทนสี (Text Gradient):
```html
<h1 class="text-4xl font-extrabold text-gradient">
  Double A Alliance Recruitment
</h1>
```
