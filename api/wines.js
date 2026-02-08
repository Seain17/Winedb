// Vercel Serverless Function - Airtable 프록시
// API 키를 서버에서만 사용하여 보안 유지

export default async function handler(req, res) {
    const API_KEY = process.env.AIRTABLE_API_KEY;
    const BASE_ID = process.env.AIRTABLE_BASE_ID;
    const TABLE_NAME = 'Wines';

    const API_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;
    const HEADERS = {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    };

    try {
        // GET - 와인 목록 조회
        if (req.method === 'GET') {
            const response = await fetch(API_URL, { headers: HEADERS });
            const data = await response.json();

            if (!response.ok) {
                return res.status(response.status).json({ error: data.error || 'Airtable 오류' });
            }
            return res.status(200).json(data);
        }

        // POST - 와인 등록
        if (req.method === 'POST') {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: HEADERS,
                body: JSON.stringify(req.body)
            });
            const data = await response.json();

            if (!response.ok) {
                return res.status(response.status).json({ error: data.error || '등록 실패' });
            }
            return res.status(200).json(data);
        }

        // DELETE - 와인 삭제
        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) {
                return res.status(400).json({ error: '삭제할 와인 ID가 필요합니다' });
            }

            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: HEADERS
            });
            const data = await response.json();

            if (!response.ok) {
                return res.status(response.status).json({ error: data.error || '삭제 실패' });
            }
            return res.status(200).json(data);
        }

        // 지원하지 않는 메서드
        res.status(405).json({ error: '허용되지 않는 요청입니다' });
    } catch (err) {
        res.status(500).json({ error: '서버 오류: ' + err.message });
    }
}
