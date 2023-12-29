const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const port = 1000;
const deleteToken = process.env.DELETE_TOKEN;

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
	} else if (content.type === 'random') {
		try {
			const fileContent = await fs.readFile('quote.json', 'utf-8');
			const quotes = JSON.parse(fileContent);

			if (quotes.length === 0) {
				res.status(404).send('Aucune citation disponible.');
			} else {
				const randomIndex = Math.floor(Math.random() * quotes.length);
				const randomQuote = quotes[randomIndex];
				res.json(randomQuote);
			}
		} catch (error) {
			res.status(500).send('Erreur lors de la manipulation du fichier quote.json');
		}
	} else if (content.type === 'supprimer') {
		if (content.token !== deleteToken) {
			res.status(401).send('Token incorrect. Autorisation refusée.');
			return;
		}

		try {
			const fileContent = await fs.readFile('quote.json', 'utf-8');
			const quotes = JSON.parse(fileContent);

			// Trouvez l'index de la citation avec l'id spécifié
			const indexToRemove = quotes.findIndex((quote) => quote.id === content.id);

			if (indexToRemove === -1) {
				res.status(404).send('Citation non trouvée.');
			} else {
				// Supprimez la citation
				quotes.splice(indexToRemove, 1);
				await fs.writeFile('quote.json', JSON.stringify(quotes, null, 2));
				res.send('Citation supprimée avec succès.');
			}
		} catch (error) {
			res.status(500).send('Erreur lors de la manipulation du fichier quote.json');
		}
	} else {
		try {
			const fileContent = await fs.readFile('quote.json', 'utf-8');
			const quotes = JSON.parse(fileContent);

			const newQuote = { id: uuidv4(), ...content };
			quotes.push(newQuote);

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
