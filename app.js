// ===== Airtable 설정 =====
// 아래 값들을 본인의 Airtable 정보로 교체하세요
const AIRTABLE_API_KEY = 'YOUR_API_KEY';   // Airtable Personal Access Token
const AIRTABLE_BASE_ID = 'YOUR_BASE_ID';   // Base ID (appXXXXXXXX 형태)
const AIRTABLE_TABLE_NAME = 'YOUR_TABLE';   // 테이블 이름

const API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

// 데이터 불러오기
async function loadData() {
    const display = document.getElementById('data-display');
    display.innerHTML = '<p>불러오는 중...</p>';

    try {
        const response = await fetch(API_URL, {
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`
            }
        });

        if (!response.ok) throw new Error('API 요청 실패');

        const data = await response.json();
        const records = data.records;

        if (records.length === 0) {
            display.innerHTML = '<p>데이터가 없습니다.</p>';
            return;
        }

        // 레코드를 카드 형태로 표시
        display.innerHTML = records.map(record => {
            const fields = record.fields;
            const fieldList = Object.entries(fields)
                .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
                .join('<br>');
            return `<div style="background:white; padding:12px; margin:8px 0; border-radius:6px; text-align:left; border:1px solid #eee;">${fieldList}</div>`;
        }).join('');

    } catch (error) {
        display.innerHTML = `<p style="color:red;">오류: ${error.message}</p>
            <p style="font-size:0.85rem; color:#999;">API 키와 Base ID를 확인해주세요.</p>`;
    }
}

// 버튼 클릭 이벤트
document.getElementById('load-btn').addEventListener('click', loadData);
