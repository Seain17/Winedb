// ===== API 설정 =====
// Vercel Serverless Function을 통해 안전하게 Airtable과 통신
const API_URL = '/api/wines';

// ===== 와인 데이터 로드 =====
async function loadWines() {
    const list = document.getElementById('wine-list');
    list.innerHTML = '<div class="loading">불러오는 중...</div>';

    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`API 오류 (${res.status})`);

        const data = await res.json();
        allWines = data.records;
        renderWines(allWines);
    } catch (err) {
        list.innerHTML = `<div class="empty-msg">
            연결 실패: ${err.message}<br>
            <small>서버 연결 상태를 확인하세요.</small>
        </div>`;
    }
}

// ===== 와인 등록 =====
async function createWine(fields) {
    const btn = document.getElementById('submit-btn');
    btn.disabled = true;
    btn.textContent = '등록 중...';

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ records: [{ fields }] })
        });

        if (!res.ok) throw new Error(`등록 실패 (${res.status})`);

        document.getElementById('wine-form').reset();
        resetStars();
        loadWines();
    } catch (err) {
        alert('등록 오류: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = '등록하기';
    }
}

// ===== 와인 삭제 =====
async function deleteWine(recordId) {
    if (!confirm('이 와인을 삭제하시겠습니까?')) return;

    try {
        const res = await fetch(`${API_URL}?id=${recordId}`, {
            method: 'DELETE'
        });

        if (!res.ok) throw new Error(`삭제 실패 (${res.status})`);
        loadWines();
    } catch (err) {
        alert('삭제 오류: ' + err.message);
    }
}

// ===== 화면 렌더링 =====
let allWines = [];

function renderWines(wines) {
    const list = document.getElementById('wine-list');
    const count = document.getElementById('wine-count');
    count.textContent = `(${wines.length})`;

    if (wines.length === 0) {
        list.innerHTML = '<p class="empty-msg">등록된 와인이 없습니다.</p>';
        return;
    }

    list.innerHTML = wines.map(record => {
        const f = record.fields;
        const stars = f.Rating ? '★'.repeat(f.Rating) + '☆'.repeat(5 - f.Rating) : '';
        const price = f.Price ? Number(f.Price).toLocaleString() + '원' : '';

        return `
        <div class="wine-card">
            <div class="wine-card-main">
                <div class="wine-card-header">
                    <span class="wine-type-badge badge-${f.Type || 'Red'}">${f.Type || '-'}</span>
                    <h3>${f.Name || '이름 없음'}</h3>
                </div>
                <div class="wine-card-info">
                    ${f.Country ? `<span>${f.Country}</span>` : ''}
                    ${f.Region ? `<span>${f.Region}</span>` : ''}
                    ${f.Grape ? `<span>${f.Grape}</span>` : ''}
                    ${f.Vintage ? `<span>${f.Vintage}년</span>` : ''}
                    ${f.Alcohol ? `<span>${f.Alcohol}%</span>` : ''}
                </div>
                ${f.Notes ? `<div class="wine-card-notes">"${f.Notes}"</div>` : ''}
                ${stars ? `<div class="wine-card-stars">${stars}</div>` : ''}
            </div>
            <div class="wine-card-right">
                ${price ? `<div class="wine-card-price">${price}</div>` : ''}
                <div class="wine-card-actions">
                    <button class="btn-delete" onclick="deleteWine('${record.id}')">삭제</button>
                </div>
            </div>
        </div>`;
    }).join('');
}

// ===== 검색 & 필터 =====
function filterWines() {
    const keyword = document.getElementById('search').value.toLowerCase();
    const type = document.getElementById('filter-type').value;

    const filtered = allWines.filter(record => {
        const f = record.fields;
        const matchName = !keyword || (f.Name && f.Name.toLowerCase().includes(keyword));
        const matchType = !type || f.Type === type;
        return matchName && matchType;
    });

    renderWines(filtered);
}

// ===== 별점 =====
function setupStars() {
    const stars = document.querySelectorAll('#star-rating span');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const val = parseInt(star.dataset.value);
            document.getElementById('rating').value = val;
            stars.forEach(s => {
                s.classList.toggle('active', parseInt(s.dataset.value) <= val);
            });
        });
    });
}

function resetStars() {
    document.getElementById('rating').value = 0;
    document.querySelectorAll('#star-rating span').forEach(s => s.classList.remove('active'));
}

// ===== 폼 제출 =====
document.getElementById('wine-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const fields = {
        Name: document.getElementById('name').value.trim(),
        Type: document.getElementById('type').value
    };

    // 선택 필드 (빈 값이면 보내지 않음)
    const country = document.getElementById('country').value.trim();
    const region = document.getElementById('region').value.trim();
    const grape = document.getElementById('grape').value.trim();
    const vintage = document.getElementById('vintage').value;
    const alcohol = document.getElementById('alcohol').value;
    const price = document.getElementById('price').value;
    const rating = document.getElementById('rating').value;
    const notes = document.getElementById('notes').value.trim();

    if (country) fields.Country = country;
    if (region) fields.Region = region;
    if (grape) fields.Grape = grape;
    if (vintage) fields.Vintage = parseInt(vintage);
    if (alcohol) fields.Alcohol = parseFloat(alcohol);
    if (price) fields.Price = parseInt(price);
    if (rating && rating !== '0') fields.Rating = parseInt(rating);
    if (notes) fields.Notes = notes;

    createWine(fields);
});

// ===== 이벤트 바인딩 =====
document.getElementById('search').addEventListener('input', filterWines);
document.getElementById('filter-type').addEventListener('change', filterWines);

// ===== 초기화 =====
setupStars();
loadWines();
