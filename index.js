const express = require('express');
const fs = require('fs/promises');

const app = express();
const port = 1000;

app.use(express.json());
app.use(cors());

app.post('', async (req, res) => {
	const content = req.body;

	console.log(content);

	try {
		await fs.access('quote.json');
	} catch (error) {
		await fs.writeFile('quote.json', '[]');
	}

	if (content.type === 'all') {
		try {
			const fileContent = await fs.readFile('quote.json', 'utf-8');
			const quotes = JSON.parse(fileContent);
			res.json(quotes);
		} catch (error) {
			res.status(500).send('Erreur lors de la lecture du fichier quote.json');
		}
	} else {
		try {
			const fileContent = await fs.readFile('quote.json', 'utf-8');
			const quotes = JSON.parse(fileContent);
			quotes.push(content);

			await fs.writeFile('quote.json', JSON.stringify(quotes, null, 2));

			res.send('OK');
		} catch (error) {
			res.status(500).send('Erreur lors de la manipulation du fichier quote.json');
		}
	}
});

app.listen(port, () => {
	console.log(`Serveur en écoute sur le port ${port}`);
});
