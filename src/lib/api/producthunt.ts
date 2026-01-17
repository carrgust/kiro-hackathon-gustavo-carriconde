interface ProductHuntProduct {
  id: string;
  name: string;
  tagline: string;
  votesCount: number;
  website: string;
  url: string;
}

interface ProductHuntResponse {
  data: {
    posts: {
      edges: Array<{
        node: ProductHuntProduct;
      }>;
    };
  };
}

export class ProductHuntClient {
  private token: string;
  private endpoint = 'https://api.producthunt.com/v2/api/graphql';

  constructor(token: string) {
    this.token = token;
  }

  async searchProducts(query: string): Promise<ProductHuntProduct[]> {
    const graphqlQuery = `
      query SearchProducts($query: String!) {
        posts(first: 10, topic: $query) {
          edges {
            node {
              id
              name
              tagline
              votesCount
              website
              url
            }
          }
        }
      }
    `;

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: graphqlQuery,
          variables: { query },
        }),
      });

      if (!response.ok) {
        throw new Error(`Product Hunt API error: ${response.status}`);
      }

      const data: ProductHuntResponse = await response.json();
      return data.data.posts.edges.map(edge => edge.node);
    } catch (error) {
      console.error('[ProductHunt] Search error:', error);
      return [];
    }
  }
}

// Factory function to get client with token from env
export function getProductHuntClient(): ProductHuntClient | null {
  const token = process.env.PRODUCTHUNT_TOKEN;
  if (!token) {
    console.warn('[ProductHunt] No token configured');
    return null;
  }
  return new ProductHuntClient(token);
}
