import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = 3000;

const NOTION_API_URL = 'https://api.notion.com/v1/databases/cd7f24d6139b4d09ba084deb7a1c65f9/query';
const NOTION_API_KEY = 'secret_HSi1sBSFC0KZkg9wthXGJ5NkDzo9EiZenZxHs4FV8DX';

app.use(cors())
app.get('/fetchData', async (req, res) => {
    try {
        const response = await fetch(NOTION_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': '2021-08-16',
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        const nodes = data.results.map(item => {
            return {
                id: item.id,
                name: item.properties.Name.title[0].text.content // Assuming "Name" is a property
            };
        });

        const links = [];
        data.results.forEach(item => {
            const sourceId = item.id;
            item.properties.Children.relation.forEach(link => {
                links.push({
                    source: sourceId,
                    target: link.id
                });
            });
        });
        res.json({ nodes, links });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to fetch data from Notion' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
