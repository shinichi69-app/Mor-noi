/**
 * Mor Noi AI Logic Module
 * หน้าที่: รับข้อมูลจากฟอร์ม, วิเคราะห์อาการ, สร้าง SOAP Note
 */

class MorNoiAnalyzer {
    constructor() {
        this.patientData = {};
    }

    // 1. ฟังก์ชันดึงข้อมูลจากฟอร์ม (สมมติว่า ID ใน HTML ตรงกับชื่อตัวแปร)
    collectFormData() {
        this.patientData = {
            age: document.getElementById('age')?.value || 'ไม่ระบุ',
            gender: document.querySelector('input[name="gender"]:checked')?.value || 'ไม่ระบุ',
            isPregnant: document.querySelector('input[name="pregnancy"]:checked')?.value === 'ใช่',
            chiefComplaints: Array.from(document.querySelectorAll('input[name="symptoms"]:checked')).map(cb => cb.value),
            onset: document.getElementById('onset')?.value || '',
            progression: document.querySelector('input[name="progression"]:checked')?.value || '',
            severity: document.getElementById('severity')?.value || 5,
            redFlags: Array.from(document.querySelectorAll('input[name="redflags"]:checked')).map(cb => cb.value),
            vitals: {
                temp: document.getElementById('temp')?.value || null,
                hr: document.getElementById('hr')?.value || null,
                spo2: document.getElementById('spo2')?.value || null,
                bpSys: document.getElementById('bp-sys')?.value || null,
                consciousness: document.getElementById('consciousness')?.value || 'รู้ตัวดี'
            },
            history: document.getElementById('history-detail')?.value || '' // ช่องเล่าอาการเอง
        };
        return this.patientData;
    }

    // 2. ฟังก์ชันตรวจสอบภาวะฉุกเฉิน (Red Flags Check)
    checkEmergency() {
        const { vitals, redFlags, chiefComplaints } = this.patientData;
        
        // เงื่อนไขฉุกเฉินพื้นฐาน (สามารถเพิ่มได้ตาม Medical Guideline)
        if (vitals.consciousness === 'ไม่รู้สึกตัว' || vitals.consciousness === 'ซึม/ปลุกยาก') return true;
        if (vitals.spo2 && parseInt(vitals.spo2) < 90) return true;
        if (redFlags.includes('เจ็บหน้าอกร้าวไหล่')) return true;
        if (redFlags.includes('หายใจไม่ออก')) return true;
        if (chiefComplaints.includes('หมดสติ')) return true;
        
        return false;
    }

    // 3. ฟังก์ชันวิเคราะห์โรคเบื้องต้น (Simple Rule-Based Diagnosis)
    // *หมายเหตุ: ในระบบจริงควรใช้ Machine Learning หรือ Decision Tree ที่ซับซ้อนกว่านี้*
    analyzeDiagnosis() {
        const { chiefComplaints, vitals, history } = this.patientData;
        let possibleConditions = [];
        let advice = "";

        // ตัวอย่าง Logic ง่ายๆ
        if (chiefComplaints.includes('ไข้สูง') && chiefComplaints.includes('ปวดเมื่อย')) {
            possibleConditions.push("ไข้หวัดใหญ่ (Influenza)");
            advice = "ควรพักผ่อน ดื่มน้ำมากๆ หากมีอาการหอบเหนื่อยให้รีบพบแพทย์";
        } else if (chiefComplaints.includes('ปวดท้อง') && chiefComplaints.includes('ถ่ายเหลว')) {
            possibleConditions.push("อาหารเป็นพิษ หรือ ลำไส้อักเสบ");
            advice = "จิบน้ำเกลือแร่บ่อยๆ งดอาหารรสจัด หากมีเลือดปนหรือไข้สูงให้พบแพทย์";
        } else if (chiefComplaints.includes('ปวดหัว') && !chiefComplaints.includes('ไข้')) {
            possibleConditions.push("ปวดหัวจากความเครียด หรือ ไมเกรน");
            advice = "ลองนอนพักในห้องมืดเงียบๆ หลีกเลี่ยงแสงจ้า";
        } else {
            possibleConditions.push("ยังไม่สามารถระบุชัดเจน ต้องตรวจร่างกายเพิ่มเติม");
            advice = "แนะนำให้พบแพทย์เพื่อซักประวัติและตรวจร่างกายอย่างละเอียด";
        }

        return { conditions: possibleConditions, advice: advice };
    }

    // 4. ฟังก์ชันสร้าง SOAP Note
    generateSOAPNote() {
        const data = this.patientData;
        const diagnosis = this.analyzeDiagnosis();
        const isEmergency = this.checkEmergency();

        const soap = {
            S: `ผู้ป่วยเพศ${data.gender} อายุ ${data.age} ปี มาด้วยอาการหลัก: ${data.chiefComplaints.join(', ')} เริ่มมีอาการเมื่อ ${data.onset} อาการรุนแรงระดับ ${data.severity}/10 เล่าว่า: "${data.history}"`,
            O: `Vitals: T=${data.vitals.temp || '-'}°C, HR=${data.vitals.hr || '-'}, SpO2=${data.vitals.spo2 || '-'}%, BP=${data.vitals.bpSys || '-'}/? mmHg. สัญญาณอันตรายที่พบ: ${data.redFlags.length > 0 ? data.redFlags.join(', ') : 'ไม่มี'}`,
            A: `วินิจฉัยเบื้องต้น: ${diagnosis.conditions.join(', ')} | ระดับความเร่งด่วน: ${isEmergency ? '🚨 EMERGENCY' : '✅ Non-Emergency'}`,
            P: `แผนการรักษาเบื้องต้น: ${diagnosis.advice} | แนะนำ: ${isEmergency ? 'โทร 1669 หรือไป ER ทันที' : 'ดูแลตัวเองตามคำแนะนำ และติดตามอาการหากไม่ดีขึ้นใน 2-3 วัน'}`
        };

        return soap;
    }

    // 5. ฟังก์ชันแสดงผลลัพธ์ไปยัง UI
    displayResult() {
        this.collectFormData();
        const soap = this.generateSOAPNote();
        
        // แสดงผลในช่อง Summary (สมมติว่ามี ID ชื่อ 'soap-output')
        const outputDiv = document.getElementById('soap-output');
        if (outputDiv) {
            outputDiv.innerHTML = `
                <h3>📋 สรุปข้อมูลสำหรับพบแพทย์ (SOAP Note)</h3>
                <p><strong>S (Subjective):</strong> ${soap.S}</p>
                <p><strong>O (Objective):</strong> ${soap.O}</p>
                <p><strong>A (Assessment):</strong> ${soap.A}</p>
                <p><strong>P (Plan):</strong> ${soap.P}</p>
                <hr>
                <p style="color: #666; font-size: 0.9em;">*หมายเหตุ: นี่เป็นการประเมินเบื้องต้นโดย AI ไม่ใช่การวินิจฉัยทางการแพทย์แทนแพทย์จริง*</p>
            `;
        }
    }
}

// การเรียกใช้งานเมื่อผู้ใช้กดปุ่ม "ให้หมอวิเคราะห์ข้อมูล"
document.getElementById('analyze-btn')?.addEventListener('click', () => {
    const morNoi = new MorNoiAnalyzer();
    morNoi.displayResult();
});