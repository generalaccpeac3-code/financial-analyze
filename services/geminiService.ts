import { GoogleGenAI } from "@google/genai";
import { VarianceResult } from "../types";
import { getDefinition } from "./accountDefinitions";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeFinancialVariances = async (
  variances: VarianceResult[]
): Promise<string> => {
  const significantItems = variances.filter((v) => v.isMaterial);

  if (significantItems.length === 0) {
    return "✅ ไม่พบรายการที่มีการเปลี่ยนแปลงผิดปกติอย่างมีนัยยะสำคัญตามเกณฑ์ที่กำหนดในเดือนนี้";
  }

  // Format data for the prompt with definitions
  const dataString = significantItems
    .map(
      (item) => {
        const def = getDefinition(item.accountName);
        return `
📌 **${item.accountName}** (Code: ${item.accountCode})
   - หมวด: ${item.category}
   - ยอดปีก่อน: ${new Intl.NumberFormat('en-US').format(item.previousAmount)}
   - ยอดปีปัจจุบัน: ${new Intl.NumberFormat('en-US').format(item.currentAmount)}
   - เปลี่ยนแปลง: ${new Intl.NumberFormat('en-US').format(item.diff)} (${item.percentChange.toFixed(2)}%)
   - **บริบท/คำอธิบายบัญชี:** ${def}
   `;
      }
    )
    .join("\n--------------------------------------------------\n");

  const prompt = `
    คุณคือผู้เชี่ยวชาญด้านการตรวจสอบบัญชี (Audit Manager) และนักวิเคราะห์งบการเงินระดับสูง
    
    งานของคุณคือ: วิเคราะห์ "รายการเปลี่ยนแปลงที่มีนัยยะสำคัญ" (Material Variances) ของงบการเงินเปรียบเทียบ (YoY)
    โดยใช้ข้อมูล **บริบท/คำอธิบายบัญชี** ที่ให้ไป เพื่อหาสาเหตุที่แท้จริง (Root Cause) ที่เป็นไปได้ทางธุรกิจและบัญชี

    ข้อมูลรายการที่ต้องตรวจสอบ:
    ${dataString}

    คำสั่ง (Instructions):
    1. **สรุปภาพรวม (Executive Summary):** สรุปสถานการณ์สั้นๆ 2-3 บรรทัด ว่าผลการดำเนินงานปีนี้เทียบกับปีก่อนเป็นอย่างไร (เน้นรายการที่กระทบกำไรสุทธิสูงสุด)
    2. **วิเคราะห์เจาะลึกรายบัญชี (Deep Dive):** สำหรับแต่ละบัญชี ให้ระบุ:
       - **🔴 ความเสี่ยง/ข้อสังเกต:** (เช่น ยอดลดลงผิดปกติทั้งที่ค่าไฟเพิ่ม, ยอดโอนปิดเข้างานสูงผิดปกติ ฯลฯ)
       - **💡 สมมติฐานสาเหตุ (Hypothesis):** ใช้ข้อมูลจาก "บริบท/คำอธิบายบัญชี" มาวิเคราะห์ เช่น 
         * ถ้า "ค่าใช้จ่ายโอนปิดเข้างาน" เปลี่ยนแปลงเยอะ อาจเกิดจากการเร่งปิดโครงการก่อสร้างขนาดใหญ่?
         * ถ้า "ค่าป้องกันซ่อมแซม" ลดลง อาจเกิดจากการชะลอการจ้างเหมาตัดต้นไม้หรือเลื่อนแผน PM?
         * ถ้า "รายได้อื่น" เพิ่มขึ้น มาจากการขายเศษซากวัสดุ หรือ ค่าปรับผิดสัญญาที่สูงขึ้น?
       - **📄 เอกสารที่ต้องเรียกตรวจ (Audit Evidence):** ระบุชื่อเอกสารแบบเจาะจง (เช่น สัญญาจ้าง, ใบตรวจรับงาน, รายงานโอนปิดงาน WBS, ภ.ง.ด., รายงานสรุปยอดขายมิเตอร์)

    ข้อควรระวัง:
    - ให้สังเกตบัญชีที่เป็น "รายการหัก" หรือ "โอนปิด" (ยอดติดลบ) ให้ดี ว่าการเพิ่มขึ้น/ลดลง หมายถึงอะไรในทางบัญชี (เช่น ยอดติดลบมากขึ้น = ค่าใช้จ่ายโอนออกมากขึ้น = ดีต่อกำไรในงวดนั้น แต่อาจเป็นสินทรัพย์เพิ่มขึ้น)
    - ใช้ภาษาไทยแบบทางการ มืออาชีพ (Professional Tone)
    - ใช้ Markdown ในการจัดรูปแบบให้อ่านง่าย
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.2, // Low temperature for consistency
      },
    });

    return response.text || "ไม่สามารถวิเคราะห์ข้อมูลได้ในขณะนี้";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI กรุณาตรวจสอบ API Key หรือลองใหม่อีกครั้ง";
  }
};