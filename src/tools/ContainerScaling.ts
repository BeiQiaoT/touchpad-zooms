interface Point {
  x: number;
  y: number;
}

interface ScaleOperating {
  /**
   * 设置缩放值
   * @param scale
   */
  setScale(scale: number): void;

  /**
   * 增加缩放值（中心放大）
   * @param zoom
   */
  addZoom(zoom: number): void;

  /**
   * 减小缩放值（中心缩小）
   * @param zoom
   */
  subZoom(zoom: number): void;

  /**
   * 设置最大缩放值
   * @param maxScale
   */
  setMaxScale(maxScale: number): void;

  /**
   * 设置最小缩放值
   * @param minScale
   */
  setMinScale(minScale: number): void;

  /**
   * scale改变时的回调
   * @param scaleCallBack
   */
  onScaleChange(scaleCallBack: Function): void;

  /**
   * translate改变时的回调
   * @param translateCallBack
   */
  onTranslateChange(translateCallBack: Function): void;

  /**
   * scale放大时的回调
   * @param enlargeCallBack
   */
  setEnlargeCallBack(enlargeCallBack: Function): void;

  /**
   * scale缩小时的回调
   * @param narrowCallBack
   */
  setNarrowCallBack(narrowCallBack: Function): void;

  /**
   * 设置translate的偏移量
   * @param x
   * @param y
   */
  setXY(x: number, y: number): void;

  /**
   * 设置translate的偏移量（立即更新）
   * @param x
   * @param y
   */
  resetXY(x: number, y: number): void;

  /**
   * 更新style
   */
  refreshStyle(): void;
}

export class ContainerScaling implements ScaleOperating {
  private targetEl!: HTMLElement;
  private parentEl!: HTMLElement;
  private parentRect!: ClientRect;
  // 鼠标相对于目标物缩放点的距离
  private diffXY: Point = { x: 0, y: 0 };
  // 是否正在拖拽
  public isDrawing = false;
  // 鼠标当前相对于父容器的坐标
  private mouseXY: Point = { x: 0, y: 0 };
  // 偏移坐标
  private translateXY: Point = { x: 0, y: 0 };
  private oldTranslateXY: Point = { x: Number.MIN_VALUE, y: Number.MIN_VALUE };
  // 缩放比例
  private scale = 1;
  private oldScale = Number.MIN_VALUE;
  // 缩放最小值、最大值
  private minScale = 0.1;
  private maxScale = 4;
  // 滚轮滚动方向是否向上（向上,缩小、向下，放大）
  private isUpward = false;
  // 是否是mac系统
  private isMac = false;
  private scaleCallBack: Function = () => {};
  private translateCallBack: Function = () => {};
  private enlargeCallBack: Function = () => {};
  private narrowCallBack: Function = () => {};

  public init(container: HTMLElement, target: HTMLElement): void {
    this.targetEl = target;
    this.parentEl = container;
    this.parentRect = this.parentEl.getBoundingClientRect();
    this.isMac = /macintosh|mac os x/i.test(navigator.userAgent);
    this.bindEvent();

    this.setXY(this.targetEl.offsetLeft, this.targetEl.offsetTop);

    //设置初始样式
    this.targetEl.style.transformOrigin = "0 0";
  }

  public setScale(scale: number): void {
    this.scale = scale;
    this.refreshTargetStyle();
  }

  public addZoom(zoom: number): void {
    if (this.scale + zoom > this.maxScale) return;
    const oldWidth = this.targetEl.clientWidth * this.scale;
    const oldHeight = this.targetEl.clientHeight * this.scale;
    this.scale += zoom;
    const newWidth = this.targetEl.clientWidth * this.scale;
    const newHeight = this.targetEl.clientHeight * this.scale;
    this.translateXY.x -= (newWidth - oldWidth) / 2;
    this.translateXY.y -= (newHeight - oldHeight) / 2;
    this.refreshTargetStyle();
  }

  public subZoom(zoom: number): void {
    if (this.scale - zoom < this.minScale) return;
    const oldWidth = this.targetEl.clientWidth * this.scale;
    const oldHeight = this.targetEl.clientHeight * this.scale;
    this.scale -= zoom;
    const newWidth = this.targetEl.clientWidth * this.scale;
    const newHeight = this.targetEl.clientHeight * this.scale;
    this.translateXY.x += (oldWidth - newWidth) / 2;
    this.translateXY.y += (oldHeight - newHeight) / 2;
    this.refreshTargetStyle();
  }

  public setMaxScale(maxScale: number): void {
    this.maxScale = maxScale;
  }

  public setMinScale(minScale: number): void {
    this.minScale = minScale;
  }

  public onScaleChange(scaleCallBack: Function): void {
    this.scaleCallBack = scaleCallBack;
  }

  public onTranslateChange(translateCallBack: Function): void {
    this.translateCallBack = translateCallBack;
  }

  public setEnlargeCallBack(enlargeCallBack: Function): void {
    this.enlargeCallBack = enlargeCallBack;
  }

  public setNarrowCallBack(narrowCallBack: Function): void {
    this.narrowCallBack = narrowCallBack;
  }

  /**
   * 设置XY
   */
  public setXY(x: number, y: number): void {
    this.translateXY.x = x;
    this.translateXY.y = y;
  }

  /**
   * 重置
   */
  public resetXY(x: number, y: number): void {
    this.setXY(x, y);
    this.refreshTargetStyle();
  }

  public refreshStyle(): void {
    this.refreshTargetStyle();
  }

  /**
   * 绑定事件
   */
  private bindEvent = (): void => {
    window.addEventListener("keydown", this.keydown);
    this.parentEl.addEventListener("mousemove", this.mousemove);
    this.parentEl.addEventListener("mousedown", this.mousedown);
    window.addEventListener("mouseup", this.mouseup);
    this.parentEl.addEventListener("wheel", this.mouseZoom);
  };

  /**
   * 释放事件
   */
  public removeEvent(): void {
    window.removeEventListener("keydown", this.keydown);
    this.parentEl.removeEventListener("mousemove", this.mousemove);
    this.parentEl.removeEventListener("mousedown", this.mousedown);
    window.removeEventListener("mouseup", this.mouseup);
    this.parentEl.removeEventListener("wheel", this.mouseZoom);
  }

  /**
   * 键盘按下
   */
  private keydown = (e: KeyboardEvent): void => {
    // 只阻止[Meta/ctrl] + [=/-]的默认事件
    if (e.key === "=" && ((e.ctrlKey && !this.isMac) || (e.metaKey && this.isMac))) {
      e.preventDefault();
      if (typeof this.enlargeCallBack === "function") this.enlargeCallBack();
    }
    if (e.key === "-" && ((e.ctrlKey && !this.isMac) || (e.metaKey && this.isMac))) {
      e.preventDefault();
      if (typeof this.narrowCallBack === "function") this.narrowCallBack();
    }
  };

  /**
   * 鼠标移动
   */
  private mousemove = (e: any): void => {
    this.mouseXY.x = e.x - this.parentRect.left;
    this.mouseXY.y = e.y - this.parentRect.top;
    if (this.isDrawing) {
      this.translateXY.x = this.mouseXY.x - this.diffXY.x;
      this.translateXY.y = this.mouseXY.y - this.diffXY.y;
      this.refreshTargetStyle();
    }
  };

  /**
   * 鼠标按下
   */
  private mousedown = (e: any): void => {
    this.refreshMousePositionDiffValue();
    if (e.button === 0) {
      this.isDrawing = true;
    }
    this.refreshTargetStyle();
  };

  /**
   * 鼠标抬起
   */
  private mouseup = (): void => {
    this.isDrawing = false;
    this.refreshTargetStyle();
  };

  /**
   * 刷新鼠标距离目标元素缩放点的距离
   */
  private refreshMousePositionDiffValue = (): void => {
    this.diffXY.x = this.mouseXY.x - this.translateXY.x;
    this.diffXY.y = this.mouseXY.y - this.translateXY.y;
  };

  /**
   * 鼠标、触控板滚动事件
   */
  private mouseZoom = (e: any): void => {
    e.preventDefault();
    // windows用户滚轮如果deltaY超过+/- 100，则纠正为 +/- 10
    let deltaY = e.deltaY;
    if (!this.isMac && Math.abs(e.deltaY) >= 100) deltaY = e.deltaY > 0 ? 10 : -10;

    if (e.ctrlKey || e.metaKey) {
      if (e.wheelDelta) {
        this.isUpward = e.wheelDelta > 0;
      } else if (e.detail) {
        this.isUpward = e.detail < 0;
      }

      const oldWidth = this.scale * this.targetEl.clientWidth;
      const oldHeight = this.scale * this.targetEl.clientHeight;

      // 控制缩放比例不能超过最大值和最小值
      this.scale -= deltaY * 0.01;
      if (this.scale < this.minScale) this.scale = this.minScale;
      if (this.scale > this.maxScale) this.scale = this.maxScale;

      const newWidth = this.scale * this.targetEl.clientWidth;
      const newHeight = this.scale * this.targetEl.clientHeight;

      //刷新鼠标距离目标元素缩放点坐标
      this.refreshMousePositionDiffValue();

      // 重新计算缩放偏移量
      this.translateXY.x -= (newWidth - oldWidth) * (this.diffXY.x / oldWidth);
      this.translateXY.y -= (newHeight - oldHeight) * (this.diffXY.y / oldHeight);

      this.refreshTargetStyle();
    } else {
      this.translateXY.x -= e.deltaX;
      this.translateXY.y -= deltaY;
      this.refreshTargetStyle();
    }
  };

  /**
   * 更新样式
   */
  private refreshTargetStyle = (): void => {
    if (!this.scaleCallBack || !this.translateCallBack) return;
    if (typeof this.scaleCallBack === "function") {
      // 如果缩放比例没有变化，则不执行回调
      if (this.oldScale !== this.scale) this.scaleCallBack(this.scale);
      this.oldScale = this.scale;
    }
    if (typeof this.onTranslateChange === "function")
      if (
        this.oldTranslateXY.x !== this.translateXY.x ||
        this.oldTranslateXY.y !== this.translateXY.y
      )
        this.translateCallBack(this.translateXY.x, this.translateXY.y);
    this.oldTranslateXY.x = this.translateXY.x;
    this.oldTranslateXY.y = this.translateXY.y;
    this.parentEl.style.cursor = this.isDrawing ? "move" : "default";
  };
}
