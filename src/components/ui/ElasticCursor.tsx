/**
 * ElasticCursor 组件 - 创建一个具有弹性动画效果的自定义鼠标光标
 * 
 * 功能特点：
 * 1. 跟随鼠标移动的弹性光标效果
 * 2. 悬停在可交互元素上时会自动调整形状
 * 3. 在加载状态下显示进度条效果
 * 4. 在移动设备上自动禁用
 * 5. 支持深色模式
 */

"use client";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import { useMouse } from "@/hooks/use-mouse";
import { usePreloader } from "../preloader";
import { useMediaQuery } from "@/hooks/use-media-query";

// GSAP动画计时器钩子函数 - 用于处理动画循环
function useTicker(callback: any, paused: boolean) {
  useEffect(() => {
    if (!paused && callback) {
      gsap.ticker.add(callback);
    }
    return () => {
      gsap.ticker.remove(callback);
    };
  }, [callback, paused]);
}

// 存储GSAP动画设置器的空对象类型定义
const EMPTY = {} as {
  x: Function;
  y: Function;
  r?: Function;
  width?: Function;
  rt?: Function;
  sx?: Function;
  sy?: Function;
};

// 实例化钩子 - 用于保存动画状态
function useInstance(value = {}) {
  const ref = useRef(EMPTY);
  if (ref.current === EMPTY) {
    ref.current = typeof value === "function" ? value() : value;
  }
  return ref.current;
}

// 计算鼠标移动的缩放比例
function getScale(diffX: number, diffY: number) {
  const distance = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
  return Math.min(distance / 735, 0.35);
}

// 计算鼠标移动的角度（度数）
function getAngle(diffX: number, diffY: number) {
  return (Math.atan2(diffY, diffX) * 180) / Math.PI;
}

// 获取可悬停元素的边界矩形
function getRekt(el: HTMLElement) {
  if (el.classList.contains("cursor-can-hover"))
    return el.getBoundingClientRect();
  else if (el.parentElement?.classList.contains("cursor-can-hover"))
    return el.parentElement.getBoundingClientRect();
  else if (
    el.parentElement?.parentElement?.classList.contains("cursor-can-hover")
  )
    return el.parentElement.parentElement.getBoundingClientRect();
  return null;
}

// 光标直径常量
const CURSOR_DIAMETER = 50;

function ElasticCursor() {
  // 获取预加载状态和加载进度
  const { loadingPercent, isLoading } = usePreloader();
  // 检测是否为移动设备
  const isMobile = useMediaQuery("(max-width: 768px)");

  // 弹性光标的DOM引用和状态
  const jellyRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  // 获取鼠标位置
  const { x, y } = useMouse();

  // 存储位置和速度的对象
  const pos = useInstance(() => ({ x: 0, y: 0 }));
  const vel = useInstance(() => ({ x: 0, y: 0 }));
  const set = useInstance();

  // 设置GSAP动画的快速设置器
  useLayoutEffect(() => {
    set.x = gsap.quickSetter(jellyRef.current, "x", "px");
    set.y = gsap.quickSetter(jellyRef.current, "y", "px");
    set.r = gsap.quickSetter(jellyRef.current, "rotate", "deg");
    set.sx = gsap.quickSetter(jellyRef.current, "scaleX");
    set.sy = gsap.quickSetter(jellyRef.current, "scaleY");
    set.width = gsap.quickSetter(jellyRef.current, "width", "px");
  }, []);

  // 动画循环函数 - 处理光标的变形和旋转效果
  const loop = useCallback(() => {
    if (!set.width || !set.sx || !set.sy || !set.r) return;
    // 基于速度计算角度和缩放
    var rotation = getAngle(+vel.x, +vel.y);
    var scale = getScale(+vel.x, +vel.y);

    // 根据不同状态设置光标样式
    if (!isHovering && !isLoading) {
      set.x(pos.x);
      set.y(pos.y);
      set.width(50 + scale * 300);
      set.r(rotation);
      set.sx(1 + scale);
      set.sy(1 - scale * 2);
    } else {
      set.r(0);
    }
  }, [isHovering, isLoading]);

  // 追踪光标是否已移动
  const [cursorMoved, setCursorMoved] = useState(false);

  // 处理鼠标移动事件
  useLayoutEffect(() => {
    if (isMobile) return;

    const setFromEvent = (e: MouseEvent) => {
      if (!jellyRef.current) return;
      if (!cursorMoved) {
        setCursorMoved(true);
      }

      const el = e.target as HTMLElement;
      const hoverElemRect = getRekt(el);

      // 处理悬停状态
      if (hoverElemRect) {
        const rect = el.getBoundingClientRect();
        setIsHovering(true);
        // 设置悬停时的光标样式
        gsap.to(jellyRef.current, {
          rotate: 0,
          duration: 0,
        });
        gsap.to(jellyRef.current, {
          width: el.offsetWidth + 20,
          height: el.offsetHeight + 20,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          borderRadius: 10,
          duration: 1.5,
          ease: "elastic.out(1, 0.3)",
        });
      } else {
        // 重置为默认光标样式
        gsap.to(jellyRef.current, {
          borderRadius: 50,
          width: CURSOR_DIAMETER,
          height: CURSOR_DIAMETER,
        });
        setIsHovering(false);
      }

      // 更新光标位置和计算速度
      const x = e.clientX;
      const y = e.clientY;

      gsap.to(pos, {
        x: x,
        y: y,
        duration: 1.5,
        ease: "elastic.out(1, 0.5)",
        onUpdate: () => {
          // @ts-ignore 由于 vel 的类型定义限制，这里需要忽略类型检查
          vel.x = (x - pos.x) * 1.2;
          // @ts-ignore 由于 vel 的类型定义限制，这里需要忽略类型检查
          vel.y = (y - pos.y) * 1.2;
        },
      });

      loop();
    };

    if (!isLoading) window.addEventListener("mousemove", setFromEvent);
    return () => {
      if (!isLoading) window.removeEventListener("mousemove", setFromEvent);
    };
  }, [isLoading]);

  // 处理加载状态下的光标样式
  useEffect(() => {
    if (!jellyRef.current) return;
    jellyRef.current.style.height = "2rem";
    jellyRef.current.style.borderRadius = "1rem";
    jellyRef.current.style.width = loadingPercent * 2 + "vw";
  }, [loadingPercent]);

  // 启动动画循环
  useTicker(loop, isLoading || !cursorMoved || isMobile);
  
  // 在移动设备上不显示自定义光标
  if (isMobile) return null;

  // 渲染光标UI
  return (
    <>
      {/* 弹性光标元素 */}
      <div
        ref={jellyRef}
        id={"jelly-id"}
        className={cn(
          `w-[${CURSOR_DIAMETER}px] h-[${CURSOR_DIAMETER}px] border-2 border-black dark:border-white`,
          "jelly-blob fixed left-0 top-0 rounded-lg z-[999] pointer-events-none will-change-transform",
          "translate-x-[-50%] translate-y-[-50%]"
        )}
        style={{
          zIndex: 100,
          backdropFilter: "invert(100%)",
        }}
      ></div>
      {/* 中心点光标 */}
      <div
        className="w-3 h-3 rounded-full fixed translate-x-[-50%] translate-y-[-50%] pointer-events-none transition-none duration-300"
        style={{
          top: y,
          left: x,
          backdropFilter: "invert(100%)",
        }}
      ></div>
    </>
  );
}

export default ElasticCursor;
