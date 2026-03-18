/**
 * MyAIPrintShop Product Showcase Widget
 * Version: 1.0.0
 *
 * Usage:
 * <div id="myaiprintshop-products"></div>
 * <script src="https://myaiprintshop.vercel.app/widgets/product-showcase.js"></script>
 * <script>
 *   MyAIPrintShop.init({
 *     apiKey: 'sk_live_...',
 *     containerId: 'myaiprintshop-products',
 *     category: 'print',  // optional
 *     limit: 12,          // optional, default: 12
 *     theme: 'light'      // optional: 'light' or 'dark'
 *   });
 * </script>
 */

(function () {
  'use strict';

  const MyAIPrintShopWidget = {
    // API 엔드포인트
    apiBase: 'https://myaiprintshop.vercel.app/api/public/v1',

    // 설정 저장
    config: null,

    /**
     * 위젯 초기화
     */
    init: function (config) {
      // 기본 설정
      this.config = {
        apiKey: config.apiKey,
        containerId: config.containerId || 'myaiprintshop-products',
        category: config.category || null,
        limit: config.limit || 12,
        theme: config.theme || 'light',
        columns: config.columns || 3,
      };

      // 유효성 검증
      if (!this.config.apiKey) {
        console.error('MyAIPrintShop Widget: API key is required');
        return;
      }

      // Container 확인
      const container = document.getElementById(this.config.containerId);
      if (!container) {
        console.error(`MyAIPrintShop Widget: Container '${this.config.containerId}' not found`);
        return;
      }

      // 스타일 주입
      this.injectStyles();

      // 상품 로드
      this.loadProducts(container);
    },

    /**
     * CSS 스타일 주입
     */
    injectStyles: function () {
      if (document.getElementById('myaiprintshop-widget-styles')) {
        return; // 이미 주입됨
      }

      const style = document.createElement('style');
      style.id = 'myaiprintshop-widget-styles';
      style.textContent = `
        .myaiprintshop-widget {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        .myaiprintshop-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 24px;
          padding: 20px 0;
        }
        .myaiprintshop-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: pointer;
        }
        .myaiprintshop-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }
        .myaiprintshop-card-image {
          width: 100%;
          height: 250px;
          object-fit: cover;
        }
        .myaiprintshop-card-content {
          padding: 16px;
        }
        .myaiprintshop-card-title {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 8px 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .myaiprintshop-card-price {
          font-size: 18px;
          font-weight: 700;
          color: #10b981;
          margin: 0;
        }
        .myaiprintshop-card-original-price {
          font-size: 14px;
          color: #999;
          text-decoration: line-through;
          margin-left: 8px;
        }
        .myaiprintshop-card-badge {
          display: inline-block;
          background: #10b981;
          color: white;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 4px;
          margin-bottom: 8px;
        }
        .myaiprintshop-loading {
          text-align: center;
          padding: 40px;
          color: #666;
        }
        .myaiprintshop-error {
          text-align: center;
          padding: 40px;
          color: #ef4444;
          background: #fef2f2;
          border-radius: 8px;
        }
        .myaiprintshop-widget.dark .myaiprintshop-card {
          background: #1a1a1a;
        }
        .myaiprintshop-widget.dark .myaiprintshop-card-title {
          color: #f0f0f0;
        }
      `;
      document.head.appendChild(style);
    },

    /**
     * 상품 로드
     */
    loadProducts: function (container) {
      // 로딩 표시
      container.className = `myaiprintshop-widget ${this.config.theme}`;
      container.innerHTML = '<div class="myaiprintshop-loading">Loading products...</div>';

      // API 호출
      const url = new URL(`${this.apiBase}/products`);
      if (this.config.category) {
        url.searchParams.append('category', this.config.category);
      }
      url.searchParams.append('limit', this.config.limit.toString());

      fetch(url.toString(), {
        headers: {
          'x-api-key': this.config.apiKey,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          return response.json();
        })
        .then((data) => {
          if (!data.success) {
            throw new Error(data.error || 'Failed to load products');
          }
          this.renderProducts(container, data.data);
        })
        .catch((error) => {
          console.error('MyAIPrintShop Widget Error:', error);
          container.innerHTML = `
            <div class="myaiprintshop-error">
              <strong>Failed to load products</strong><br>
              ${error.message}
            </div>
          `;
        });
    },

    /**
     * 상품 렌더링
     */
    renderProducts: function (container, products) {
      if (products.length === 0) {
        container.innerHTML = '<div class="myaiprintshop-loading">No products found</div>';
        return;
      }

      const grid = document.createElement('div');
      grid.className = 'myaiprintshop-grid';

      products.forEach((product) => {
        const card = this.createProductCard(product);
        grid.appendChild(card);
      });

      container.innerHTML = '';
      container.appendChild(grid);
    },

    /**
     * 상품 카드 생성
     */
    createProductCard: function (product) {
      const card = document.createElement('div');
      card.className = 'myaiprintshop-card';

      const badge = product.badge
        ? `<div class="myaiprintshop-card-badge">${this.escapeHtml(product.badge)}</div>`
        : '';

      const originalPrice =
        product.originalPrice && product.originalPrice > product.price
          ? `<span class="myaiprintshop-card-original-price">${product.originalPrice.toLocaleString()}원</span>`
          : '';

      card.innerHTML = `
        <img src="${this.escapeHtml(product.thumbnail)}" alt="${this.escapeHtml(product.name)}" class="myaiprintshop-card-image" />
        <div class="myaiprintshop-card-content">
          ${badge}
          <h3 class="myaiprintshop-card-title">${this.escapeHtml(product.name)}</h3>
          <p class="myaiprintshop-card-price">
            ${product.price.toLocaleString()}원
            ${originalPrice}
          </p>
        </div>
      `;

      // 클릭 시 상세 페이지로 이동
      card.addEventListener('click', () => {
        window.open(`https://myaiprintshop.vercel.app/products/${product.id}`, '_blank');
      });

      return card;
    },

    /**
     * HTML 이스케이프
     */
    escapeHtml: function (text) {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      };
      return text.replace(/[&<>"']/g, (m) => map[m]);
    },
  };

  // 전역 객체로 노출
  window.MyAIPrintShop = MyAIPrintShopWidget;
})();
