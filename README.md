# 触控板手势缩放

## 介绍

此Demo演示了如何使用触控板手势缩放内容。

## 说明

1. `command` / `ctrl` + `+` 放大
2. `command` / `ctrl` + `-` 缩小
3. `command` / `ctrl` + `滚轮下` 放大
4. `command` / `ctrl` + `滚轮上` 缩小
5. 触控板双指张开 放大
6. 触控板双指捏合 缩小
7. 左击拖动

## 方法

1. `setScale(scale: number)`: 设置目标元素的缩放比例。
2. `addZoom(zoom: number)`: 增加缩放比例（中心放大）。
3. `subZoom(zoom: number)`: 减小缩放比例（中心缩小）。
4. `setMaxScale(maxScale: number)`: 设置最大缩放比例。
5. `setMinScale(minScale: number)`: 设置最小缩放比例。
6. `onScaleChange(scaleCallBack: Function)`: 设置缩放比例发生变化时的回调函数。
7. `onTranslateChange(translateCallBack: Function)`: 设置偏移坐标发生变化时的回调函数。
8. `setEnlargeCallBack(enlargeCallBack: Function)`: 设置缩放比例变大时的回调函数。
9. `setNarrowCallBack(narrowCallBack: Function)`: 设置缩放比例变小时的回调函数。
10. `setXY`: 设置目标元素的偏移坐标。
11. `resetXY(x: number, y: number)`: 设置目标元素的偏移坐标（立即更新）。
12. `refreshStyle()`: 刷新样式（立即更新）。
13. `init(container: HTMLElement, target: HTMLElement)`: 初始化方法，将父元素和目标元素保存为属性，并绑定事件。此外，该方法还居中显示目标元素并设置其初始样式。
14. `removeEvent()`: 移除事件。

## 使用案例

vue3 + ts 案例，其他框架类似

```vue

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

</style>


```
