"use client";
import { useDevToolsOpen } from "@/hooks/use-devtools-open";
import React, { useEffect, useState } from "react";
import NyanCat from "./nyan-cat";
import { AnimatePresence } from "framer-motion";

/**
 * EasterEggs组件 - 网站的彩蛋功能组件
 * 功能包括：
 * 1. 监测开发者工具的打开状态
 * 2. 当开发者工具打开时，在控制台显示有趣的提示信息
 * 3. 提供一个隐藏的交互功能：
 *    - 在控制台输入"naresh"会触发特殊消息
 *    - 之后按'n'键可以触发Nyan Cat动画
 */
const EasterEggs = () => {
  // 使用自定义hook检测开发者工具是否打开
  const { isDevToolsOpen } = useDevToolsOpen();

  useEffect(() => {
    // 只在开发者工具打开时执行
    if (!isDevToolsOpen) return;

    // 确保console对象存在
    if (typeof console !== "undefined") {
      // 清空控制台
      console.clear();
      
      // 显示初始欢迎信息，使用样式化的console.log
      console.log(
        "%cWhoa, look at you! 🕵️‍♂️\n" +
          "You seem to have discovered the secret console! 🔍\n" +
          "Want to see some magic? ✨\n" +
          "Just type %cmy first name%c and hit enter! 🎩🐇",
        "color: #FFD700; font-size: 16px; font-weight: bold; background-color: black; padding: 10px; border-radius: 10px; margin-top:20px",
        "color: #00FF00; font-size: 16px; font-weight: bold; background-color: black; padding: 10px; border-radius: 10px; margin-top:20px",
        "color: #FFD700; font-size: 16px; font-weight: bold; background-color: black; padding: 10px; border-radius: 10px;"
      );

      // 为不同大小写版本的"naresh"添加全局getter
      ["naresh", "Naresh", "NARESH"].forEach((name) => {
        // 避免重复定义属性
        // @ts-ignore
        if (Object.hasOwn(window, name)) return;
        
        // 定义全局属性，当访问时触发彩蛋效果
        Object.defineProperty(window, name, {
          get() {
            // 显示魔法效果信息
            console.log(
              "%c✨ Abra Kadabra! ✨\n\n" +
                "You just summoned the magic of Naresh! 🧙‍♂️\n" +
                "What??? youre not impressed? Fine, but remember: With great power comes great responsibility! 💻⚡",
              "color: #FF4500; font-size: 18px; font-weight: bold; background-color: black; padding: 10px; border-radius: 10px; margin-top:10px"
            );

            // 延迟7秒后显示关于Nyan Cat的提示
            const timer = setTimeout(() => {
              console.log(
                "%cPssttt! 🤫\n\n" +
                  "Do you like cats?? 😺 If yes, then press 'n' on viewport and see what happens! 🐱✨",
                "color: #FF69B4; font-size: 16px; font-weight: bold; background-color: black; padding: 10px; border-radius: 10px;"
              );
              clearTimeout(timer);
            }, 7000);
            return "";
          },
        });
      });
    }
  }, [isDevToolsOpen]);

  return (
    <>
      {/* 渲染Nyan Cat组件，具体动画效果在该组件中实现 */}
      <NyanCat />
    </>
  );
};

export default EasterEggs;
