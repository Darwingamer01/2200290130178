import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = 9876;
const BASE_URL = 'http://20.244.56.144/evaluation-service/stocks';

const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

async function fetchStockHistory(ticker, minutes) {
  const key = `${ticker}_${minutes}`;
  const now = Date.now();

  if (cache.has(key)) {
    const { timestamp, data } = cache.get(key);
    if (now - timestamp < CACHE_DURATION) return data;
  }

  try {
    const { data } = await axios.get(`${BASE_URL}/${ticker}?minutes=${minutes}`, {
      headers: {
        Authorization: `Bearer ${process.env.TOKEN}`
      }
    });
    cache.set(key, { timestamp: now, data });
    return data;
  } catch (err) {
    console.error(`Error fetching ${ticker}:`, err.message);
    return [];
  }
}

function calculateAverage(prices) {
  if (!prices.length) return 0;
  const sum = prices.reduce((acc, p) => acc + p.price, 0);
  return +(sum / prices.length).toFixed(6);
}

function calculateCorrelation(pricesX, pricesY) {
  const length = Math.min(pricesX.length, pricesY.length);
  if (length < 2) return 0;

  const x = pricesX.slice(-length).map(p => p.price);
  const y = pricesY.slice(-length).map(p => p.price);

  const meanX = x.reduce((a, b) => a + b, 0) / length;
  const meanY = y.reduce((a, b) => a + b, 0) / length;

  let numerator = 0, denomX = 0, denomY = 0;
  for (let i = 0; i < length; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }

  const denominator = Math.sqrt(denomX * denomY);
  return denominator === 0 ? 0 : +(numerator / denominator).toFixed(4);
}

app.get('/stocks/:ticker', async (req, res) => {
  const { ticker } = req.params;
  const minutes = parseInt(req.query.minutes);

  if (!ticker || isNaN(minutes)) {
    return res.status(400).json({ error: 'Invalid ticker or minutes' });
  }

  const history = await fetchStockHistory(ticker, minutes);
  const avg = calculateAverage(history);

  return res.json({
    averageStockPrice: avg,
    priceHistory: history
  });
});

app.get('/stockcorrelation', async (req, res) => {
  const { minutes, ticker } = req.query;

  if (!ticker || !Array.isArray(ticker) || ticker.length !== 2 || isNaN(minutes)) {
    return res.status(400).json({ error: 'Invalid tickers or minutes' });
  }

  const [t1, t2] = ticker;
  const [history1, history2] = await Promise.all([
    fetchStockHistory(t1, minutes),
    fetchStockHistory(t2, minutes)
  ]);

  const correlation = calculateCorrelation(history1, history2);

  return res.json({
    correlation,
    stocks: {
      [t1]: {
        averagePrice: calculateAverage(history1),
        priceHistory: history1
      },
      [t2]: {
        averagePrice: calculateAverage(history2),
        priceHistory: history2
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
