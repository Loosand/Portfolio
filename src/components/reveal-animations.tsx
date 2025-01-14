"use client";

import { motion, useAnimation, useInView } from "framer-motion";

import { cn } from "@/lib/utils";
import { ReactNode, useEffect, useRef } from "react";

/**
 * BlurIn 组件 - 实现模糊淡入动画效果
 * @param children - 需要添加动画效果的子元素
 * @param className - 自定义类名
 * @param delay - 动画延迟时间（秒）
 * @param variant - 自定义动画变体配置
 * @param duration - 动画持续时间（秒）
 */
interface BlurIntProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: {
    hidden: { filter: string; opacity: number };
    visible: { filter: string; opacity: number };
  };
  duration?: number;
}

export const BlurIn = ({
  children,
  className,
  variant,
  delay = 0,
  duration = 1,
}: BlurIntProps) => {
  // 默认的动画变体配置
  const defaultVariants = {
    hidden: { filter: "blur(10px)", opacity: 0 },
    visible: { filter: "blur(0px)", opacity: 1 },
  };
  const combinedVariants = variant || defaultVariants;

  return (
    <motion.h1
      initial="hidden"
      animate="visible"
      transition={{ duration, delay }}
      variants={combinedVariants}
      className={cn(
        className
        // "font-display text-center text-4xl font-bold tracking-[-0.02em] drop-shadow-sm md:text-7xl md:leading-[5rem]"
      )}
    >
      {children}
    </motion.h1>
  );
};

/**
 * BoxReveal 组件 - 实现盒子显现动画效果
 * @param children - 需要添加动画效果的子元素
 * @param width - 容器宽度，可以是"fit-content"或"100%"
 * @param boxColor - 动画遮罩的颜色
 * @param duration - 动画持续时间（秒）
 * @param delay - 动画延迟时间（秒）
 * @param once - 是否只触发一次动画，默认为true
 */
interface BoxRevealProps {
  children: JSX.Element;
  width?: "fit-content" | "100%";
  boxColor?: string;
  duration?: number;
  delay?: number;
  once?: boolean;
}
export const BoxReveal = ({
  children,
  width = "fit-content",
  boxColor,
  duration,
  delay,
  once = true,
}: BoxRevealProps) => {
  // 创建动画控制器
  const mainControls = useAnimation();
  const slideControls = useAnimation();

  // 创建视图引用和监听
  const ref = useRef(null);
  const isInView = useInView(ref, { once });

  // 当元素进入视图时触发动画
  useEffect(() => {
    if (isInView) {
      slideControls.start("visible");
      mainControls.start("visible");
    } else {
      slideControls.start("hidden");
      mainControls.start("hidden");
    }
  }, [isInView, mainControls, slideControls]);

  return (
    <div ref={ref} style={{ position: "relative", width, overflow: "hidden" }}>
      {/* 主要内容动画 */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 75 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate={mainControls}
        transition={{ duration: duration ? duration : 0.5, delay }}
      >
        {children}
      </motion.div>

      {/* 滑动遮罩动画 */}
      <motion.div
        variants={{
          hidden: { left: 0 },
          visible: { left: "100%" },
        }}
        initial="hidden"
        animate={slideControls}
        transition={{
          duration: duration ? duration : 0.5,
          ease: "easeIn",
          delay,
        }}
        style={{
          position: "absolute",
          top: 4,
          bottom: 4,
          left: 0,
          right: 0,
          zIndex: 20,
          background: boxColor ? boxColor : "#ffffff00",
        }}
      />
    </div>
  );
};
