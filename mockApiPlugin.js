// Vite Mock API Middleware Plugin for Foodix
// Intercepts all '/api/*' requests and responds with genuine HTTP responses (200, 201)
// so that all GET, POST, PUT, PATCH, DELETE calls are 100% visible in the browser's Network Tab!

import url from 'url';

export function mockApiPlugin() {
  let ordersStore = null;
  let customersStore = null;

  const ensureStores = async () => {
    if (!customersStore) {
      try {
        const custMod = await import('./src/data/mockCustomers.js');
        customersStore = (custMod.INITIAL_CUSTOMERS || []).map((c) => ({ ...c }));
      } catch (err) {
        console.warn('[Mock API] Could not preload customers:', err.message);
        customersStore = [];
      }
    }
    if (!ordersStore) {
      try {
        const ordMod = await import('./src/data/mockMasterOrders.js');
        ordersStore = (ordMod.INITIAL_MASTER_ORDERS || []).map((o) => ({ ...o }));
      } catch (err) {
        console.warn('[Mock API] Could not preload orders:', err.message);
        ordersStore = [];
      }
    }
  };

  return {
    name: 'vite-plugin-foodix-mock-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const parsedUrl = url.parse(req.url, true);
        const pathname = parsedUrl.pathname;

        // Only intercept requests starting with /api
        if (!pathname.startsWith('/api')) {
          return next();
        }

        // Helper to read JSON request body
        const readBody = () =>
          new Promise((resolve) => {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', () => {
              try {
                resolve(body ? JSON.parse(body) : {});
              } catch (e) {
                resolve({});
              }
            });
          });

        // Helper to send JSON response
        const sendJson = (statusCode, data) => {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
          res.statusCode = statusCode;
          res.end(JSON.stringify(data));
        };

        // Handle CORS Preflight
        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
          return res.end();
        }

        const subPath = pathname.replace(/^\/api/, '');

        (async () => {
          try {
            const body = await readBody();

            // 1. GET /api/health
            if (subPath === '/health') {
              return sendJson(200, { status: 'healthy', timestamp: Date.now(), service: 'Foodix API v1' });
            }

            // 2. RESTAURANTS: GET /api/restaurants
            if (subPath === '/restaurants' && req.method === 'GET') {
              return sendJson(200, {
                status: 'success',
                message: 'Fetched restaurants successfully',
                timestamp: Date.now(),
              });
            }

            // 3. RESTAURANTS: POST /api/restaurants (Add restaurant)
            if (subPath === '/restaurants' && req.method === 'POST') {
              const created = {
                id: body.id || `rest_${Date.now()}`,
                ...body,
                createdAt: new Date().toISOString(),
              };
              return sendJson(201, {
                status: 'success',
                message: `Restaurant "${created.name}" created successfully`,
                data: created,
              });
            }

            // 4. RESTAURANTS: PATCH /api/restaurants/:id/status
            const statusMatch = subPath.match(/^\/restaurants\/([^/]+)\/status$/);
            if (statusMatch && (req.method === 'PATCH' || req.method === 'PUT')) {
              const id = statusMatch[1];
              return sendJson(200, {
                status: 'success',
                message: `Restaurant ${id} status updated to ${body.status}`,
                data: { id, status: body.status },
              });
            }

            // 5. RESTAURANTS: PATCH /api/restaurants/:id/favorite
            const favMatch = subPath.match(/^\/restaurants\/([^/]+)\/favorite$/);
            if (favMatch && (req.method === 'PATCH' || req.method === 'PUT')) {
              const id = favMatch[1];
              return sendJson(200, {
                status: 'success',
                message: `Restaurant ${id} favorite updated`,
                data: { id, isFavorite: body.isFavorite },
              });
            }

            // 6. RESTAURANTS: PUT /api/restaurants/:id (Edit restaurant)
            const restIdMatch = subPath.match(/^\/restaurants\/([^/]+)$/);
            if (restIdMatch && (req.method === 'PUT' || req.method === 'PATCH')) {
              const id = restIdMatch[1];
              return sendJson(200, {
                status: 'success',
                message: `Restaurant ${id} updated successfully`,
                data: { id, ...body, updatedAt: new Date().toISOString() },
              });
            }

            // 7. RESTAURANTS: DELETE /api/restaurants/:id (Delete restaurant)
            if (restIdMatch && req.method === 'DELETE') {
              const id = restIdMatch[1];
              return sendJson(200, {
                status: 'success',
                message: `Restaurant ${id} removed successfully`,
                data: { id, deleted: true },
              });
            }

            // 8. RESTAURANTS: GET /api/restaurants/:id
            if (restIdMatch && req.method === 'GET') {
              const id = restIdMatch[1];
              return sendJson(200, {
                status: 'success',
                message: `Restaurant ${id} details fetched`,
                data: { id },
              });
            }

            // 9. MENU DISHES: GET /api/restaurants/:id/menu
            const menuGetMatch = subPath.match(/^\/restaurants\/([^/]+)\/menu$/);
            if (menuGetMatch && req.method === 'GET') {
              const restaurantId = menuGetMatch[1];
              return sendJson(200, {
                status: 'success',
                message: `Menu for ${restaurantId} fetched successfully`,
                restaurantId,
              });
            }

            // 10. MENU DISHES: POST /api/restaurants/:id/menu (Add Food Item)
            if (menuGetMatch && req.method === 'POST') {
              const restaurantId = menuGetMatch[1];
              const createdDish = {
                id: body.id || `dish_${Date.now()}`,
                restaurantId,
                ...body,
                createdAt: new Date().toISOString(),
              };
              return sendJson(201, {
                status: 'success',
                message: `Dish "${createdDish.name}" added to menu successfully`,
                data: createdDish,
              });
            }

            // 11. MENU DISHES: PATCH /api/restaurants/:id/menu/:itemId/stock (Stock Toggle)
            const stockMatch = subPath.match(/^\/restaurants\/([^/]+)\/menu\/([^/]+)\/stock$/);
            if (stockMatch && (req.method === 'PATCH' || req.method === 'PUT')) {
              const [, restaurantId, itemId] = stockMatch;
              return sendJson(200, {
                status: 'success',
                message: `Dish ${itemId} stock status updated to ${body.inStock}`,
                data: { restaurantId, itemId, inStock: body.inStock },
              });
            }

            // 12. MENU DISHES: PUT /api/restaurants/:id/menu/:itemId (Edit Food Item)
            const dishItemMatch = subPath.match(/^\/restaurants\/([^/]+)\/menu\/([^/]+)$/);
            if (dishItemMatch && (req.method === 'PUT' || req.method === 'PATCH')) {
              const [, restaurantId, itemId] = dishItemMatch;
              return sendJson(200, {
                status: 'success',
                message: `Dish ${itemId} updated successfully`,
                data: { restaurantId, id: itemId, ...body, updatedAt: new Date().toISOString() },
              });
            }

            // 13. MENU DISHES: DELETE /api/restaurants/:id/menu/:itemId (Delete Food Item)
            if (dishItemMatch && req.method === 'DELETE') {
              const [, restaurantId, itemId] = dishItemMatch;
              return sendJson(200, {
                status: 'success',
                message: `Dish ${itemId} removed from menu`,
                data: { restaurantId, id: itemId, deleted: true },
              });
            }

            // 13a. MENU MANAGEMENT (CENTRAL): GET /api/menu
            if (subPath === '/menu' && req.method === 'GET') {
              return sendJson(200, {
                status: 'success',
                message: 'Fetched central menu management items',
                timestamp: Date.now(),
              });
            }

            // 13b. MENU MANAGEMENT (CENTRAL): POST /api/menu (Add Menu Item)
            if (subPath === '/menu' && req.method === 'POST') {
              const newDish = {
                id: body.id || `dish_${Date.now()}`,
                ...body,
                createdAt: new Date().toISOString(),
              };
              return sendJson(201, {
                status: 'success',
                message: `Menu item "${newDish.name}" created successfully`,
                data: newDish,
              });
            }

            // 13c. MENU MANAGEMENT (CENTRAL): PATCH /api/menu/:id/stock
            const centralStockMatch = subPath.match(/^\/menu\/([^/]+)\/stock$/);
            if (centralStockMatch && (req.method === 'PATCH' || req.method === 'PUT')) {
              const dishId = centralStockMatch[1];
              return sendJson(200, {
                status: 'success',
                message: `Dish ${dishId} stock status updated to ${body.inStock}`,
                data: { id: dishId, inStock: body.inStock },
              });
            }

            // 13d. MENU MANAGEMENT (CENTRAL): PATCH /api/menu/:id/favorite
            const centralFavMatch = subPath.match(/^\/menu\/([^/]+)\/favorite$/);
            if (centralFavMatch && (req.method === 'PATCH' || req.method === 'PUT')) {
              const dishId = centralFavMatch[1];
              return sendJson(200, {
                status: 'success',
                message: `Dish ${dishId} favorite updated`,
                data: { id: dishId, isFavorite: body.isFavorite },
              });
            }

            // 13e. MENU MANAGEMENT (CENTRAL): PUT /api/menu/:id (Update Menu Item)
            const centralDishMatch = subPath.match(/^\/menu\/([^/]+)$/);
            if (centralDishMatch && (req.method === 'PUT' || req.method === 'PATCH')) {
              const dishId = centralDishMatch[1];
              return sendJson(200, {
                status: 'success',
                message: `Dish ${dishId} updated successfully`,
                data: { id: dishId, ...body, updatedAt: new Date().toISOString() },
              });
            }

            // 13f. MENU MANAGEMENT (CENTRAL): DELETE /api/menu/:id (Delete Menu Item)
            if (centralDishMatch && req.method === 'DELETE') {
              const dishId = centralDishMatch[1];
              return sendJson(200, {
                status: 'success',
                message: `Dish ${dishId} deleted from menu`,
                data: { id: dishId, deleted: true },
              });
            }

            // 14. DASHBOARD: GET /api/dashboard/stats
            if (subPath === '/dashboard/stats' && req.method === 'GET') {
              return sendJson(200, {
                status: 'success',
                message: 'Dashboard metrics fetched',
                timestamp: Date.now(),
              });
            }

            // 15. DASHBOARD: GET /api/dashboard/activities
            if (subPath === '/dashboard/activities' && req.method === 'GET') {
              return sendJson(200, {
                status: 'success',
                message: 'Dashboard activities fetched',
                timestamp: Date.now(),
              });
            }

            // 16. ORDERS: GET /api/orders
            if (subPath === '/orders' && req.method === 'GET') {
              await ensureStores();
              const { status, customerId, search } = parsedUrl.query || {};
              let results = [...ordersStore];

              if (status && status !== 'All') {
                results = results.filter((o) => o.status === status);
              }
              if (customerId) {
                results = results.filter(
                  (o) => o.customerId === customerId || o.customer?.id === customerId
                );
              }
              if (search) {
                const q = String(search).toLowerCase();
                results = results.filter(
                  (o) =>
                    o.id?.toLowerCase().includes(q) ||
                    o.customer?.name?.toLowerCase().includes(q) ||
                    o.restaurant?.toLowerCase().includes(q)
                );
              }

              return sendJson(200, {
                status: 'success',
                message: 'Fetched orders successfully',
                total: results.length,
                data: results,
                timestamp: Date.now(),
              });
            }

            // 17. ORDERS: POST /api/orders (Create new order)
            if (subPath === '/orders' && req.method === 'POST') {
              await ensureStores();
              const idNum = Math.floor(2050 + Math.random() * 7900);
              const nowStr = new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
              const createdOrder = {
                id: body.id || `#FDX-${idNum}`,
                rawId: body.rawId || `FDX-${idNum}`,
                status: body.status || 'Pending',
                timestamp: body.timestamp || Date.now(),
                placedAt: body.placedAt || nowStr,
                history: body.history || [
                  {
                    status: body.status || 'Pending',
                    timestamp: nowStr,
                    note: 'Order placed via Foodix API',
                  },
                ],
                ...body,
                createdAt: new Date().toISOString(),
              };

              ordersStore = [
                createdOrder,
                ...ordersStore.filter((o) => o.id !== createdOrder.id),
              ];

              return sendJson(201, {
                status: 'success',
                message: `Order ${createdOrder.id} created successfully`,
                data: createdOrder,
              });
            }

            // 18. ORDERS: PATCH /api/orders/:id/status
            const orderStatusMatch = subPath.match(/^\/orders\/([^/]+)\/status$/);
            if (orderStatusMatch && (req.method === 'PATCH' || req.method === 'PUT')) {
              await ensureStores();
              const orderId = decodeURIComponent(orderStatusMatch[1]);
              const nowStr = new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              let updatedOrder = null;
              ordersStore = ordersStore.map((ord) => {
                if (ord.id === orderId || ord.rawId === orderId) {
                  updatedOrder = {
                    ...ord,
                    ...body,
                    status: body.status || ord.status,
                    history: [
                      ...(ord.history || []),
                      {
                        status: body.status || ord.status,
                        timestamp: nowStr,
                        note: body.note || `Status updated to ${body.status || ord.status}`,
                      },
                    ],
                    updatedAt: new Date().toISOString(),
                  };
                  return updatedOrder;
                }
                return ord;
              });

              return sendJson(200, {
                status: 'success',
                message: `Order ${orderId} updated to ${body.status || 'updated'}`,
                data: updatedOrder || { id: orderId, ...body },
              });
            }

            // 19. ORDERS: GET / PUT / DELETE /api/orders/:id
            const orderIdMatch = subPath.match(/^\/orders\/([^/]+)$/);
            if (orderIdMatch && req.method === 'GET') {
              await ensureStores();
              const orderId = decodeURIComponent(orderIdMatch[1]);
              const found = ordersStore.find((o) => o.id === orderId || o.rawId === orderId);
              return sendJson(found ? 200 : 404, {
                status: found ? 'success' : 'error',
                data: found || null,
              });
            }

            if (orderIdMatch && (req.method === 'PUT' || req.method === 'PATCH')) {
              await ensureStores();
              const orderId = decodeURIComponent(orderIdMatch[1]);
              let updatedOrder = null;
              ordersStore = ordersStore.map((ord) => {
                if (ord.id === orderId || ord.rawId === orderId) {
                  updatedOrder = { ...ord, ...body, updatedAt: new Date().toISOString() };
                  return updatedOrder;
                }
                return ord;
              });
              return sendJson(200, {
                status: 'success',
                message: `Order ${orderId} updated`,
                data: updatedOrder || { id: orderId, ...body },
              });
            }

            if (orderIdMatch && req.method === 'DELETE') {
              await ensureStores();
              const orderId = decodeURIComponent(orderIdMatch[1]);
              ordersStore = ordersStore.filter((o) => o.id !== orderId && o.rawId !== orderId);
              return sendJson(200, {
                status: 'success',
                message: `Order ${orderId} deleted`,
                data: { id: orderId, deleted: true },
              });
            }

            // 20. CUSTOMERS: GET /api/customers
            if (subPath === '/customers' && req.method === 'GET') {
              await ensureStores();
              return sendJson(200, {
                status: 'success',
                message: 'Fetched customers successfully',
                total: customersStore.length,
                data: customersStore,
                timestamp: Date.now(),
              });
            }

            // 21. CUSTOMERS: POST /api/customers
            if (subPath === '/customers' && req.method === 'POST') {
              await ensureStores();
              const created = {
                id: body.id || `cust_user_${Date.now()}`,
                ...body,
                createdAt: new Date().toISOString(),
              };
              customersStore = [created, ...customersStore.filter((c) => c.id !== created.id)];
              return sendJson(201, {
                status: 'success',
                message: `Customer "${created.fullName || 'New'}" created`,
                data: created,
              });
            }

            // 22. CUSTOMERS: POST /api/customers/:id/orders
            const custOrdersMatch = subPath.match(/^\/customers\/([^/]+)\/orders$/);
            if (custOrdersMatch && req.method === 'POST') {
              await ensureStores();
              const customerId = decodeURIComponent(custOrdersMatch[1]);
              const createdOrder = {
                id: body.id || `#FDX-${Math.floor(2050 + Math.random() * 7900)}`,
                customerId,
                ...body,
                createdAt: new Date().toISOString(),
              };
              ordersStore = [createdOrder, ...ordersStore.filter((o) => o.id !== createdOrder.id)];
              return sendJson(201, {
                status: 'success',
                message: `Order ${createdOrder.id} placed for customer ${customerId}`,
                data: createdOrder,
              });
            }

            // 23. GEOCODE: GET /api/geocode/reverse?lat=...&lon=...
            if (subPath === '/geocode/reverse' && req.method === 'GET') {
              const lat = parsedUrl.query?.lat;
              const lon = parsedUrl.query?.lon;
              if (!lat || !lon) {
                return sendJson(400, { error: 'Latitude and longitude are required' });
              }
              try {
                const nomUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&addressdetails=1`;
                const nomRes = await fetch(nomUrl, {
                  headers: { 'User-Agent': 'FoodixDeliveryApp/1.0' },
                });
                if (!nomRes.ok) {
                  return sendJson(502, { error: 'Reverse geocoding provider unavailable' });
                }
                const data = await nomRes.json();
                return sendJson(200, { status: 'success', data });
              } catch (geoErr) {
                return sendJson(502, { error: geoErr.message || 'Reverse geocoding failed' });
              }
            }

            // 24. GEOCODE: GET /api/geocode/search?q=...
            if (subPath === '/geocode/search' && req.method === 'GET') {
              const q = parsedUrl.query?.q || '';
              if (!q.trim()) {
                return sendJson(200, { status: 'success', data: [] });
              }
              try {
                const nomUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&addressdetails=1&limit=6`;
                const nomRes = await fetch(nomUrl, {
                  headers: { 'User-Agent': 'FoodixDeliveryApp/1.0' },
                });
                if (!nomRes.ok) {
                  return sendJson(502, { error: 'Address search provider unavailable' });
                }
                const data = await nomRes.json();
                return sendJson(200, { status: 'success', data: Array.isArray(data) ? data : [] });
              } catch (geoErr) {
                return sendJson(502, { error: geoErr.message || 'Address search failed' });
              }
            }

            // Fallback for any other /api/* path
            return sendJson(200, {
              status: 'success',
              endpoint: subPath,
              method: req.method,
              data: body || {},
              timestamp: Date.now(),
            });
          } catch (err) {
            console.error('[Mock API Server Error]', err);
            return sendJson(500, { error: 'Internal Mock API error', message: err.message });
          }
        })();
      });
    },
  };
}
