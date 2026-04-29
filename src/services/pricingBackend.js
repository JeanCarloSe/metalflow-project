/**
 * Pricing Backend Service
 * Conecta com IA/ML do backend para sugestões de preço
 */

const API_URL = 'http://localhost:3000/api';

export async function getSuggestedPrice(material, thickness, flat, quantity) {
  try {
    const token = localStorage.getItem('backend_token');
    if (!token) return null;

    const response = await fetch(`${API_URL}/pricing/suggest-price`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        material,
        thickness,
        flat,
        quantity,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`💡 Sugestão de preço: R$ ${data.suggestedPrice}`);
      return data.suggestedPrice;
    }
    return null;
  } catch (error) {
    console.warn('Erro ao obter sugestão:', error.message);
    return null;
  }
}

export async function getInsights() {
  try {
    const token = localStorage.getItem('backend_token');
    if (!token) return null;

    const response = await fetch(`${API_URL}/pricing/insights`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.warn('Erro ao obter insights:', error.message);
    return null;
  }
}

export async function getRecommendations() {
  try {
    const token = localStorage.getItem('backend_token');
    if (!token) return [];

    const response = await fetch(`${API_URL}/pricing/recommendations`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.warn('Erro ao obter recomendações:', error.message);
    return [];
  }
}
