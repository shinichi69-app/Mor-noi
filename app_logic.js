/**
 * app_logic.js
 * ตัวเชื่อมระหว่างหน้าเว็บ (UI) กับคลังข้อมูล (KB)
 */

document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyze-btn');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', processDiagnosis);
    }
});

function processDiagnosis() {
    // 1. รวบรวมข้อมูลจากฟอร์ม (Matching IDs from your HTML)
    const formData = {
        age: document.getElementById('age')?.value,
        gender: document.querySelector('input[name="gender"]:checked')?.value,
        pregnancy: document.querySelector('input[name="pregnancy"]:checked')?.value,
        symptoms: Array.from(document.querySelectorAll('input[name="symptoms"]:checked')).map(cb => cb.value),
        onset: document.getElementById('onset')?.value,
        progression: document.querySelector('input[name="progression"]:checked')?.value,
        severity: document.getElementById('severity')?.value,
        history: document.getElementById('history-detail')?.value,
        vitals: {
            temp: document.getElementById('temp')?.value,
            hr: document.getElementById('hr')?.value,
            spo2: document.getElementById('spo2')?.value,
            bpSys: document.getElementById('bp-sys')?.value,
            consciousness: document.getElementById('consciousness')?.value
        }
    };

    // 2. ตรวจสอบภาวะฉุกเฉิน (Safety First!)
    const isEmergency = checkEmergencyStatus(formData.symptoms, formData.vitals);

    // 3. วิเคราะห์โรค
    const possibleDiseases = analyzePossibleDiseases(formData.symptoms);

    // 4. สร้าง SOAP Note
    const soapNote = generateSOAP(formData, possibleDiseases, isEmergency);

    // 5. แสดงผล
    displayResult(soapNote, isEmergency);
}

function generateSOAP(data, diseases, isEmergency) {
    const diseaseNames = diseases.map(d => d.name).join(', ');
    const primaryAdvice = diseases[0]?.advice || "พักผ่อนและสังเกตอาการ";

    return {
        S: `ผู้ป่วยเพศ${data.gender || '-'} อายุ ${data.age || '-'} ปี มาด้วยอาการ: ${data.symptoms.join(', ')}. เริ่มเมื่อ: ${data.onset || '-'}. เล่าว่า: "${data.history || '-'}"`,
        O: `Vitals: T=${data.vitals.temp || '-'}°C, HR=${data.vitals.hr || '-'}, SpO2=${data.vitals.spo2 || '-'}%, BP=${data.vitals.bpSys || '-'}/?. ความรู้สึกตัว: ${data.vitals.consciousness || '-'}`,
        A: `วินิจฉัยเบื้องต้น: ${diseaseNames} | ความรุนแรง: ${data.severity}/10 | ภาวะฉุกเฉิน: ${isEmergency ? '🚨 ใช่' : '✅ ไม่'}`,
        P: `คำแนะนำ: ${primaryAdvice} | แผนการ: ${isEmergency ? 'นำส่ง ER ทันที' : 'ดูแลตัวเองตามคำแนะนำ หากไม่ดีขึ้นใน 2-3 วันให้พบแพทย์'}`
    };
}

function displayResult(soap, isEmergency) {
    const outputDiv = document.getElementById('soap-output');
    const emergencyBanner = document.getElementById('emergency-banner'); // สมมติว่ามี ID นี้สำหรับแจ้งเตือน
    
    if (outputDiv) {
        let htmlContent = `
            <div class="soap-card">
                <h3>📋 สรุปข้อมูลสำหรับพบแพทย์ (SOAP Note)</h3>
                <div class="soap-section"><strong>S (Subjective):</strong> ${soap.S}</div>
                <div class="soap-section"><strong>O (Objective):</strong> ${soap.O}</div>
                <div class="soap-section"><strong>A (Assessment):</strong> ${soap.A}</div>
                <div class="soap-section"><strong>P (Plan):</strong> ${soap.P}</div>
            </div>
        `;

        if (isEmergency) {
            htmlContent += `
                <div style="background-color: #ffebee; color: #c62828; padding: 15px; border-radius: 8px; margin-top: 15px; border: 1px solid #ef9a9a;">
                    <strong>🚨 คำเตือนฉุกเฉิน:</strong> ระบบตรวจจับพบสัญญาณอันตราย กรุณาติดต่อสายด่วน 1669 หรือไปห้องฉุกเฉินทันที!
                </div>
            `;
        }

        outputDiv.innerHTML = htmlContent;
        outputDiv.scrollIntoView({ behavior: 'smooth' });
    }
}