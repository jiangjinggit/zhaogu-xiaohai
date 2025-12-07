import { GoogleGenAI, Type } from "@google/genai";
import { DailyLog, AIResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const FLASH_MODEL = 'gemini-2.5-flash';
// "Nano Banana Pro" maps to gemini-3-pro-image-preview according to instructions
const IMAGE_MODEL = 'gemini-3-pro-image-preview'; 

/**
 * Analyzes daily logs to provide a health summary.
 */
export const analyzeDailyLogs = async (logs: DailyLog[]): Promise<string> => {
  if (logs.length === 0) return "暂无记录可供分析。";

  const logText = logs.map(l => 
    `- [${new Date(l.timestamp).toLocaleTimeString('zh-CN')}] ${l.type}: ${l.detail} ${l.note ? `(${l.note})` : ''}`
  ).join('\n');

  const prompt = `
    你是一位专业的儿科健康助手。请分析以下1-3岁幼儿的日常活动记录。
    总结当天的饮食（营养）、饮水（补水）和排泄情况。
    指出任何潜在的健康关注点（例如喝水太少、大便不规律等）或表扬良好的习惯。
    请用简体中文回答，语气亲切鼓励，言简意赅（不超过200字）。
    
    记录日志:
    ${logText}
  `;

  try {
    const response = await ai.models.generateContent({
      model: FLASH_MODEL,
      contents: prompt,
      config: {
        systemInstruction: "你是一位乐于助人、充满关爱的儿科助手。请提供安全、通用的建议。所有回答必须使用简体中文。"
      }
    });
    return response.text || "无法生成分析报告。";
  } catch (error) {
    console.error("Error analyzing logs:", error);
    return "生成摘要时出错，请重试。";
  }
};

/**
 * Fetches parenting knowledge using Google Search grounding.
 */
export const getParentingAdvice = async (query: string): Promise<AIResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: FLASH_MODEL,
      contents: `针对1-3岁幼儿的父母，请提供关于以下问题的权威建议：${query}。
      请优先引用知名育儿网站或医疗机构（如CDC、AAP、丁香医生、育学园等）的内容。
      请用简体中文回答。`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "未找到相关建议。";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources = chunks
      .map((c: any) => c.web)
      .filter((w: any) => w && w.uri && w.title)
      .map((w: any) => ({ uri: w.uri, title: w.title }));

    return { text, sources };
  } catch (error) {
    console.error("Error fetching advice:", error);
    return { text: "抱歉，暂时无法获取该信息。", sources: [] };
  }
};

/**
 * Gets advice for common illnesses using Search Grounding.
 */
export const getIllnessGuidance = async (symptoms: string): Promise<AIResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: FLASH_MODEL,
      contents: `我家里1-3岁的宝宝出现了以下症状：${symptoms}。
      有哪些标准的家庭护理建议？出现什么情况需要立即去医院？
      请用简体中文回答。`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "你是一位医疗信息助手。你必须以免责声明开头：'我是一个AI助手，不是医生。具体的医疗建议请务必咨询专业儿科医生。' 然后基于搜索结果提供通用的护理建议。请用简体中文回答。"
      },
    });

    const text = response.text || "未找到相关指导信息。";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources = chunks
      .map((c: any) => c.web)
      .filter((w: any) => w && w.uri && w.title)
      .map((w: any) => ({ uri: w.uri, title: w.title }));

    return { text, sources };
  } catch (error) {
    console.error("Error fetching illness guidance:", error);
    return { text: "获取医疗信息失败。如果情况紧急，请立即就医。", sources: [] };
  }
};

/**
 * Generates a visual guide text and an image for emergency situations.
 */
export const getEmergencyStepWithImage = async (situation: string): Promise<{ text: string, imageUrl?: string }> => {
  try {
    // 1. Get text instructions first
    const textResponse = await ai.models.generateContent({
      model: FLASH_MODEL,
      contents: `针对1-3岁幼儿发生的紧急情况：【${situation}】，请提供立即、分步骤的急救指南。
      内容必须极其清晰、可操作性强。使用项目符号列出。
      请用简体中文回答。`,
    });
    
    const guideText = textResponse.text || "请遵循标准的急救流程。";

    // 2. Generate an illustrative image using Nano Banana Pro (Gemini 3 Pro Image Preview)
    // We ask for an educational illustration style to avoid photorealistic gore or distress.
    const imagePrompt = `Educational medical illustration showing the correct first aid position for a toddler regarding: ${situation}. Simple, clear line art or soft color style. Safe for viewing. No text in image.`;
    
    let imageUrl: string | undefined = undefined;

    try {
        const imageResponse = await ai.models.generateContent({
            model: IMAGE_MODEL,
            contents: { parts: [{ text: imagePrompt }] },
            config: {
                imageConfig: {
                    aspectRatio: "16:9",
                    imageSize: "1K" // Use high quality
                }
            }
        });

        // Extract image
        for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                imageUrl = `data:image/png;base64,${part.inlineData.data}`;
                break;
            }
        }
    } catch (imgError) {
        console.error("Image generation failed", imgError);
        // Fallback: We return text only if image fails
    }

    return { text: guideText, imageUrl };

  } catch (error) {
    console.error("Error handling emergency request:", error);
    return { text: "急救服务出错。请立即拨打120或当地急救电话。" };
  }
};