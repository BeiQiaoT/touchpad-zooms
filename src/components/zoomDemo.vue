<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from "vue";
import { ContainerScaling } from "@/tools/ContainerScaling";

const scaleValue = ref(1);
let containerScaling: ContainerScaling;

type Point = {
  x: number;
  y: number;
};

const translateValue = reactive<Point>({
  x: 0,
  y: 0
});

onMounted(() => {
  const container = document.querySelector(".container") as HTMLElement;
  const target = document.querySelector(".target") as HTMLElement;
  containerScaling = new ContainerScaling();
  containerScaling.init(container, target);

  // 监听缩放
  containerScaling.onScaleChange((scale: number) => {
    scaleValue.value = scale;
  });
  // 监听移动
  containerScaling.onTranslateChange((x: number, y: number) => {
    translateValue.x = x;
    translateValue.y = y;
  });
  // 监听放大快捷键
  containerScaling.setEnlargeCallBack(() => {
    containerScaling.addZoom(0.1);

  });
  // 监听缩小快捷键
  containerScaling.setNarrowCallBack(() => {
    containerScaling.subZoom(0.1);
  });
});

onUnmounted(() => {
  containerScaling.removeEvent();
});
</script>

<template>
  <div class="content">
    <div class="container">
      <div
        :style="{transform: `translate(${translateValue.x}px, ${translateValue.y}px) scale(${scaleValue})`}"
        class="target" />
    </div>
    <div class="info">
      <div>缩放：{{ scaleValue }}</div>
      <div>translate({{ translateValue.x }}px, {{ translateValue.y }}px)</div>
      <div>command / ctrl + （放大）</div>
      <div>command / ctrl - （缩小）</div>
      <div>command / ctrl 加 鼠标滚轮下 （放大）</div>
      <div>command / ctrl 加 鼠标滚轮上 （缩小）</div>
      <div>触控板双指张开 (放大)</div>
      <div>触控板双指捏合 (缩小)</div>
      <div>左击拖动</div>
    </div>
  </div>
</template>

<style>
.content {
  display: flex;
  align-items: center;
  height: 100vh;
}

.container {
  display: flex;
  width: 600px;
  height: 600px;
  background: #eee;
  overflow: hidden;
}

.target {
  position: relative;
  width: 100px;
  height: 100px;
  background: #2979ff;
  transform-origin: 0 0;
}

.info {
  margin-left: 20px;
  font-size: 18px;
}

</style>
