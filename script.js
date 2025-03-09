// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDAJS5oYvX2VzMBP0Dg_FtOVUeP6lG7sSk",
    authDomain: "megalistadeia.firebaseapp.com",
    databaseURL: "https://megalistadeia-default-rtdb.firebaseio.com",
    projectId: "megalistadeia",
    storageBucket: "megalistadeia.appspot.com",
    messagingSenderId: "900819794642",
    appId: "1:900819794642:web:ee4f0c5b329e4778a98b0b",
    measurementId: "G-0MDDT9B8XN"
};

// Iniciar apenas após o carregamento total da página
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        const database = firebase.database();
        
        // Global Variables
        let currentUser = null;
        let userData = null;
        let products = [];
        let images = [];
        let favorites = {
            products: [],
            images: []
        };
        
        // DOM Elements - Login
        const loginSection = document.getElementById('loginSection');
        const appSection = document.getElementById('appSection');
        const loginForm = document.getElementById('loginForm');
        const loginEmail = document.getElementById('loginEmail');
        const rememberMe = document.getElementById('rememberMe');
        const loginError = document.getElementById('loginError');
        const loadingOverlay = document.getElementById('loadingOverlay');
        
        // DOM Elements - Navigation
        const menuToggle = document.getElementById('menuToggle');
        const sideNav = document.getElementById('sideNav');
        const sideNavOverlay = document.getElementById('sideNavOverlay');
        const navLinks = document.querySelectorAll('.nav-link');
        const pages = document.querySelectorAll('.page');
        
        // DOM Elements - User
        const logoutBtn = document.getElementById('logoutBtn');
        const userDropdown = document.getElementById('userDropdown');
        const userMenu = document.getElementById('userMenu');
        const userInitials = document.getElementById('userInitials');
        const userName = document.getElementById('userName');
        const userEmailDisplay = document.getElementById('userEmailDisplay');
        const welcomeUserName = document.getElementById('welcomeUserName');
        const profileLink = document.getElementById('profileLink');
        const favoritesLink = document.getElementById('favoritesLink');
        
        // DOM Elements - Dashboard
        const dashboardProductCount = document.getElementById('dashboardProductCount');
        const dashboardImageCount = document.getElementById('dashboardImageCount');
        const dashboardFavoritesCount = document.getElementById('dashboardFavoritesCount');
        const featuredProducts = document.getElementById('featuredProducts');
        const recentGallery = document.getElementById('recentGallery');
        
        // DOM Elements - Products
        const productsList = document.getElementById('productsList');
        const productSearch = document.getElementById('productSearch');
        const noProducts = document.getElementById('noProducts');
        
        // DOM Elements - Gallery
        const galleryGrid = document.getElementById('galleryGrid');
        const gallerySearch = document.getElementById('gallerySearch');
        const noGallery = document.getElementById('noGallery');
        
        // DOM Elements - Favorites
        const favoriteProducts = document.getElementById('favoriteProducts');
        const favoriteImages = document.getElementById('favoriteImages');
        const noFavoriteProducts = document.getElementById('noFavoriteProducts');
        const noFavoriteImages = document.getElementById('noFavoriteImages');
        
        // DOM Elements - Profile
        const profileInitials = document.getElementById('profileInitials');
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        const profileFavProducts = document.getElementById('profileFavProducts');
        const profileFavImages = document.getElementById('profileFavImages');
        const profileForm = document.getElementById('profileForm');
        const profileDisplayName = document.getElementById('profileDisplayName');
        const profileEmailInput = document.getElementById('profileEmailInput');
        const profilePhone = document.getElementById('profilePhone');
        const profileError = document.getElementById('profileError');
        const profileSuccess = document.getElementById('profileSuccess');
        
        // DOM Elements - Image Modal
        const imageModal = document.getElementById('imageModal');
        const imageModalOverlay = document.getElementById('imageModalOverlay');
        const closeImageModalBtn = document.getElementById('closeImageModalBtn');
        const modalImage = document.getElementById('modalImage');
        const modalImageTitle = document.getElementById('modalImageTitle');
        
        // DOM Elements - Dark Mode
        const toggleDarkMode = document.getElementById('toggleDarkMode');
        const appToggleDarkMode = document.getElementById('appToggleDarkMode');
        const sidebarToggleDarkMode = document.getElementById('sidebarToggleDarkMode');
        
        // Função para salvar preferência de tema no localStorage com fallback para cookie
        function saveThemePreference(isDark) {
            try {
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
            } catch (e) {
                // Fallback para cookies se localStorage não estiver disponível
                setCookie('theme', isDark ? 'dark' : 'light', 365);
            }
            
            // Também tenta salvar no Firebase
            if (currentUser) {
                try {
                    database.ref(`userPreferences/${getDeviceId()}`).update({
                        theme: isDark ? 'dark' : 'light'
                    });
                } catch (error) {
                    console.error('Erro ao salvar preferência de tema no Firebase:', error);
                }
            }
        }
        
        // Função para recuperar preferência de tema
        function getThemePreference() {
            try {
                // Tenta primeiro do localStorage
                const theme = localStorage.getItem('theme');
                if (theme) return theme;
            } catch (e) {
                // Silencia erro
            }
            
            // Se não encontrar no localStorage, tenta do cookie
            const cookieTheme = getCookie('theme');
            if (cookieTheme) return cookieTheme;
            
            // Se não encontrar em nenhum lugar, retorna null (usar preferência do sistema)
            return null;
        }
        
        // Carrega e aplica tema salvo ou usa o padrão do sistema
        function loadSavedTheme() {
            const savedTheme = getThemePreference();
            
            if (savedTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else if (savedTheme === 'light') {
                document.documentElement.classList.remove('dark');
            } else {
                // Se não houver tema salvo, usa o padrão do sistema
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }
        }
        
        // Funções para manipular cookies de forma robusta
        function setCookie(name, value, days) {
            let expires = "";
            if (days) {
                const date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toUTCString();
            }
            document.cookie = name + "=" + encodeURIComponent(value || "") + expires + "; path=/; SameSite=Lax";
        }
        
        function getCookie(name) {
            const nameEQ = name + "=";
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
            }
            return null;
        }
        
        function eraseCookie(name) {
            document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
        }

        // Função melhorada para obter uma identificação única do dispositivo
        function getDeviceId() {
            // Coletamos mais informações para garantir uma identificação única do dispositivo
            const navigatorInfo = [
                navigator.userAgent,
                navigator.language,
                screen.width,
                screen.height,
                screen.colorDepth,
                new Date().getTimezoneOffset(),
                navigator.platform,
                navigator.hardwareConcurrency || 'unknown',
                navigator.deviceMemory || 'unknown',
                navigator.vendor
            ].join('|');
            
            // Função avançada de hash para gerar um ID mais exclusivo
            let hash = 0;
            for (let i = 0; i < navigatorInfo.length; i++) {
                const char = navigatorInfo.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return 'device_' + Math.abs(hash).toString(16);
        }

        // Verifica e registra um dispositivo autorizado
        async function checkAndRegisterAuthDevice(email) {
            try {
                const deviceId = getDeviceId();
                const userRef = database.ref(`auth_devices/${btoa(email)}`);
                const snapshot = await userRef.once('value');
                
                // Se não existe registro de dispositivo para este usuário, registre este como autorizado
                if (!snapshot.exists()) {
                    await userRef.set({
                        deviceId: deviceId,
                        firstLogin: Date.now(),
                        lastLogin: Date.now()
                    });
                    return { authorized: true, firstTime: true };
                } 
                
                // Se já existe, verifique se é o mesmo dispositivo
                const authData = snapshot.val();
                if (authData && authData.deviceId === deviceId) {
                    // Atualiza o timestamp de último login
                    await userRef.update({
                        lastLogin: Date.now()
                    });
                    return { authorized: true, firstTime: false };
                }
                
                // Este é um dispositivo diferente - não autorizado
                return { authorized: false, message: "Esta conta só pode ser acessada no dispositivo onde foi registrada pela primeira vez." };
                
            } catch (error) {
                console.error('Erro ao verificar dispositivo autorizado:', error);
                return { authorized: false, message: "Erro ao verificar autorização de dispositivo." };
            }
        }

        // Armazenamento alternativo usando Firebase Database
        async function saveLoginState(email) {
            try {
                const deviceId = getDeviceId();
                await database.ref(`user_sessions/${deviceId}`).set({
                    email: email,
                    lastLogin: Date.now(),
                    deviceInfo: {
                        platform: navigator.platform,
                        screenSize: `${screen.width}x${screen.height}`,
                        timezone: new Date().getTimezoneOffset(),
                        language: navigator.language
                    }
                });
                return true;
            } catch (error) {
                console.error('Erro ao salvar estado de login:', error);
                return false;
            }
        }

        async function getLoginState() {
            try {
                const deviceId = getDeviceId();
                const snapshot = await database.ref(`user_sessions/${deviceId}`).once('value');
                if (snapshot.exists()) {
                    return snapshot.val().email;
                }
                return null;
            } catch (error) {
                console.error('Erro ao recuperar estado de login:', error);
                return null;
            }
        }

        async function clearLoginState() {
            try {
                const deviceId = getDeviceId();
                await database.ref(`user_sessions/${deviceId}`).remove();
                return true;
            } catch (error) {
                console.error('Erro ao limpar estado de login:', error);
                return false;
            }
        }
        
        // Utility Functions
        function showLoading() {
            loadingOverlay.classList.remove('hidden');
        }
        
        function hideLoading() {
            loadingOverlay.classList.add('hidden');
        }
        
        function showError(element, message) {
            element.textContent = message;
            element.classList.remove('hidden');
            setTimeout(() => {
                if (!element.classList.contains('keep-visible')) {
                    element.classList.add('hidden');
                }
            }, 5000);
        }
        
        function showSuccess(element, message) {
            element.textContent = message;
            element.classList.remove('hidden');
            setTimeout(() => {
                element.classList.add('hidden');
            }, 5000);
        }
        
        function getInitials(name) {
            if (!name) return 'U';
            return name.split(' ')
                .map(part => part.charAt(0))
                .join('')
                .toUpperCase()
                .substring(0, 2);
        }
        
        function toggleDarkModeHandler() {
            const isDarkMode = document.documentElement.classList.toggle('dark');
            saveThemePreference(isDarkMode);
        }
        
        // Carregar tema salvo ao iniciar
        loadSavedTheme();
        
        // Dark Mode Toggle Buttons
        toggleDarkMode.addEventListener('click', toggleDarkModeHandler);
        appToggleDarkMode.addEventListener('click', toggleDarkModeHandler);
        sidebarToggleDarkMode.addEventListener('click', toggleDarkModeHandler);
        
        // Verificar se existe login salvo ao carregar a página (modificado)
        async function checkSavedLogin() {
            showLoading();
            
            try {
                // Tenta primeiro via cookie
                let savedEmail = getCookie('userEmail');
                
                // Se não encontrar no cookie, tenta via Firebase
                if (!savedEmail) {
                    savedEmail = await getLoginState();
                }
                
                if (!savedEmail) {
                    hideLoading();
                    return false;
                }
                
                // Verificar se este dispositivo é o autorizado para este email
                const authCheck = await checkAndRegisterAuthDevice(savedEmail);
                if (!authCheck.authorized) {
                    // Limpar dados de login não autorizados
                    eraseCookie('userEmail');
                    await clearLoginState();
                    hideLoading();
                    showError(loginError, authCheck.message);
                    return false;
                }
                
                // Verificar se o email existe no banco de dados como cliente
                const clientsRef = database.ref('clients');
                const snapshot = await clientsRef.orderByChild('email').equalTo(savedEmail).once('value');
                
                if (!snapshot.exists()) {
                    // Se o usuário não existe mais, limpar dados de login
                    eraseCookie('userEmail');
                    await clearLoginState();
                    hideLoading();
                    return false;
                }
                
                // Extrair os dados do cliente encontrado
                let foundUser = null;
                snapshot.forEach(child => {
                    foundUser = child.val();
                    foundUser.id = child.key;
                    return true; // Para encerrar o loop após o primeiro item
                });
                
                if (foundUser) {
                    // Armazenar dados do usuário e carregar a aplicação
                    currentUser = {
                        uid: foundUser.id,
                        email: foundUser.email,
                        displayName: foundUser.name
                    };
                    userData = foundUser;
                    
                    // Carregar dados da aplicação
                    await Promise.all([
                        loadProducts(),
                        loadImages(),
                        loadFavorites()
                    ]);
                    
                    // Atualizar UI
                    updateUI();
                    
                    // Mostrar seção principal
                    loginSection.classList.add('hidden');
                    appSection.classList.remove('hidden');
                    
                    // Definir página inicial (dashboard)
                    navigateToPage('dashboard');
                    
                    hideLoading();
                    return true;
                }
            } catch (error) {
                console.error('Erro ao verificar login salvo:', error);
            }
            
            hideLoading();
            return false;
        }
        
        // Login Form Handler (modificado)
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = loginEmail.value.trim();
            const shouldRemember = rememberMe.checked;
            
            if (!email) {
                showError(loginError, 'Por favor, informe seu email.');
                return;
            }
            
            showLoading();
            
            try {
                // Primeiro verifica se este dispositivo está autorizado
                const authCheck = await checkAndRegisterAuthDevice(email);
                
                if (!authCheck.authorized) {
                    hideLoading();
                    showError(loginError, authCheck.message);
                    return;
                }
                
                // Verificar se o email existe no banco de dados como cliente
                const clientsRef = database.ref('clients');
                const snapshot = await clientsRef.orderByChild('email').equalTo(email).once('value');
                
                if (!snapshot.exists()) {
                    hideLoading();
                    showError(loginError, 'Email não encontrado. Entre em contato com o administrador.');
                    return;
                }
                
                // Extrair os dados do cliente encontrado
                let foundUser = null;
                snapshot.forEach(child => {
                    foundUser = child.val();
                    foundUser.id = child.key;
                    return true; // Para encerrar o loop após o primeiro item
                });
                
                if (foundUser) {
                    // Armazenar dados do usuário e carregar a aplicação
                    currentUser = {
                        uid: foundUser.id,
                        email: foundUser.email,
                        displayName: foundUser.name
                    };
                    userData = foundUser;
                    
                    // Salvar email para login automático (se selecionado)
                    if (shouldRemember) {
                        // Tenta ambos os métodos para garantir persistência
                        setCookie('userEmail', email, 30);
                        await saveLoginState(email);
                    }
                    
                    // Carregar dados da aplicação
                    await Promise.all([
                        loadProducts(),
                        loadImages(),
                        loadFavorites()
                    ]);
                    
                    // Atualizar UI
                    updateUI();
                    
                    // Mostrar seção principal
                    loginSection.classList.add('hidden');
                    appSection.classList.remove('hidden');
                    
                    // Definir página inicial (dashboard)
                    navigateToPage('dashboard');
                    
                    hideLoading();
                } else {
                    hideLoading();
                    showError(loginError, 'Erro ao carregar dados do usuário.');
                }
                
            } catch (error) {
                hideLoading();
                console.error('Erro no login:', error);
                showError(loginError, `Erro: ${error.message}`);
            }
        });
        
        // Load Products
        async function loadProducts() {
            try {
                const snapshot = await database.ref('products').orderByChild('timestamp').once('value');
                products = [];
                
                if (snapshot.exists()) {
                    snapshot.forEach(childSnapshot => {
                        const product = childSnapshot.val();
                        product.id = childSnapshot.key;
                        products.push(product);
                    });
                    
                    // Sort by newest first
                    products.sort((a, b) => {
                        if (b.timestamp && a.timestamp) {
                            return b.timestamp - a.timestamp;
                        }
                        return 0;
                    });
                }
                
                return products;
            } catch (error) {
                console.error('Erro ao carregar produtos:', error);
                return [];
            }
        }
        
        // Load Images
        async function loadImages() {
            try {
                const snapshot = await database.ref('images').orderByChild('timestamp').once('value');
                images = [];
                
                if (snapshot.exists()) {
                    snapshot.forEach(childSnapshot => {
                        const image = childSnapshot.val();
                        image.id = childSnapshot.key;
                        images.push(image);
                    });
                    
                    // Sort by newest first
                    images.sort((a, b) => {
                        if (b.timestamp && a.timestamp) {
                            return b.timestamp - a.timestamp;
                        }
                        return 0;
                    });
                }
                
                return images;
            } catch (error) {
                console.error('Erro ao carregar imagens:', error);
                return [];
            }
        }
        
        // Load Favorites
        async function loadFavorites() {
            if (!currentUser) return;
            
            try {
                const userId = currentUser.uid;
                const favoritesRef = database.ref(`favorites/${userId}`);
                const snapshot = await favoritesRef.once('value');
                
                favorites = {
                    products: [],
                    images: []
                };
                
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    
                    // Load favorite products
                    if (data && data.products) {
                        favorites.products = Object.keys(data.products).filter(id => data.products[id]);
                    }
                    
                    // Load favorite images
                    if (data && data.images) {
                        favorites.images = Object.keys(data.images).filter(id => data.images[id]);
                    }
                } else {
                    // Criar nó de favoritos para o usuário se não existir
                    await favoritesRef.set({
                        products: {},
                        images: {}
                    });
                }
                
                return favorites;
            } catch (error) {
                console.error('Erro ao carregar favoritos:', error);
                return { products: [], images: [] };
            }
        }
        
        // Toggle Favorite
        async function toggleFavorite(type, id) {
            if (!currentUser) return;
            
            try {
                const userId = currentUser.uid;
                const favRef = database.ref(`favorites/${userId}/${type}/${id}`);
                const isFavorite = favorites[type].includes(id);
                
                // Toggle favorite status
                if (isFavorite) {
                    await favRef.remove();
                    favorites[type] = favorites[type].filter(itemId => itemId !== id);
                } else {
                    await favRef.set(true);
                    favorites[type].push(id);
                }
                
                // Update UI
                updateFavoritesUI();
                
                return !isFavorite;
            } catch (error) {
                console.error(`Erro ao alterar favorito:`, error);
                return null;
            }
        }
        
        // Update UI
        function updateUI() {
            updateUserUI();
            updateDashboardUI();
            updateProductsUI();
            updateGalleryUI();
            updateFavoritesUI();
            updateProfileUI();
        }
        
        // Update User UI
        function updateUserUI() {
            if (!userData) return;
            
            const displayName = userData.name || userData.email.split('@')[0];
            const initials = getInitials(displayName);
            
            // Update header user info
            userInitials.textContent = initials;
            userName.textContent = displayName;
            userEmailDisplay.textContent = userData.email;
            welcomeUserName.textContent = displayName;
        }
        
        // Update Dashboard UI
        function updateDashboardUI() {
            // Update counts
            dashboardProductCount.textContent = products.length || 0;
            dashboardImageCount.textContent = images.length || 0;
            dashboardFavoritesCount.textContent = (favorites.products.length || 0) + (favorites.images.length || 0);
            
            // Featured Products (show max 3)
            featuredProducts.innerHTML = '';
            const featuredItems = products.slice(0, 3);
            
            if (featuredItems.length === 0) {
                featuredProducts.innerHTML = `
                    <div class="col-span-full text-center py-8">
                        <i class="fas fa-shopping-bag text-4xl text-gray-400 mb-3"></i>
                        <h3 class="text-lg font-medium text-gray-600 dark:text-gray-400">Nenhum produto disponível</h3>
                    </div>
                `;
            } else {
                featuredItems.forEach(product => {
                    const isFavorite = favorites.products.includes(product.id);
                    
                    featuredProducts.innerHTML += `
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col">
                            <div class="relative">
                                <img src="${product.imageUrl}" alt="${product.name}" class="w-full h-48 object-cover">
                                <button class="favorite-btn absolute top-2 right-2 w-9 h-9 rounded-full bg-white dark:bg-gray-800 shadow flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-500 transition-colors" data-type="products" data-id="${product.id}">
                                    <i class="fas fa-heart ${isFavorite ? 'text-red-500' : ''}"></i>
                                </button>
                            </div>
                            <div class="p-4 flex-grow">
                                <h3 class="font-semibold text-lg mb-2">${product.name}</h3>
                                <p class="text-gray-600 dark:text-gray-300 text-sm mb-4">${product.description}</p>
                            </div>
                            <div class="px-4 pb-4">
                                <a href="${product.redirectUrl}" target="_blank" class="inline-block w-full bg-primary hover:bg-primaryDark text-white font-medium py-2 px-4 rounded text-center transition-colors">
                                    ${product.buttonText || 'Ver Produto'}
                                </a>
                            </div>
                        </div>
                    `;
                });
            }
            
            // Recent Gallery (show max 4)
            recentGallery.innerHTML = '';
            const recentImages = images.slice(0, 4);
            
            if (recentImages.length === 0) {
                recentGallery.innerHTML = `
                    <div class="col-span-full text-center py-8">
                        <i class="fas fa-images text-4xl text-gray-400 mb-3"></i>
                        <h3 class="text-lg font-medium text-gray-600 dark:text-gray-400">Nenhuma imagem disponível</h3>
                    </div>
                `;
            } else {
                recentImages.forEach(image => {
                    const isFavorite = favorites.images.includes(image.id);
                    
                    recentGallery.innerHTML += `
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden relative group">
                            <img src="${image.url}" alt="${image.title}" class="w-full h-40 object-cover">
                            <div class="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button class="view-image-btn mr-2 w-9 h-9 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-primary" data-url="${image.url}" data-title="${image.title}">
                                    <i class="fas fa-search-plus"></i>
                                </button>
                                <button class="favorite-btn w-9 h-9 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-red-500" data-type="images" data-id="${image.id}">
                                    <i class="fas fa-heart ${isFavorite ? 'text-red-500' : ''}"></i>
                                </button>
                            </div>
                        </div>
                    `;
                });
            }
            
            setupEventListeners();
        }
        
        // Setup Event Listeners for dynamically generated content
        function setupEventListeners() {
            // Add event listeners to favorite buttons
            document.querySelectorAll('.favorite-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const type = btn.getAttribute('data-type');
                    const id = btn.getAttribute('data-id');
                    const isFavorite = await toggleFavorite(type, id);
                    
                    if (isFavorite !== null) {
                        const icon = btn.querySelector('i');
                        if (isFavorite) {
                            icon.classList.add('text-red-500');
                        } else {
                            icon.classList.remove('text-red-500');
                        }
                    }
                });
            });
            
            // Add event listeners to view image buttons
            document.querySelectorAll('.view-image-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const url = btn.getAttribute('data-url');
                    const title = btn.getAttribute('data-title');
                    openImageModal(url, title);
                });
            });
        }
        
        // Update Products UI
        function updateProductsUI() {
            productsList.innerHTML = '';
            
            if (products.length === 0) {
                productsList.classList.add('hidden');
                noProducts.classList.remove('hidden');
            } else {
                productsList.classList.remove('hidden');
                noProducts.classList.add('hidden');
                
                // Filter products by search term if needed
                const searchTerm = productSearch.value.trim().toLowerCase();
                const filteredProducts = searchTerm ? 
                    products.filter(product => 
                        product.name.toLowerCase().includes(searchTerm) || 
                        product.description.toLowerCase().includes(searchTerm)
                    ) : products;
                
                if (filteredProducts.length === 0) {
                    productsList.innerHTML = `
                        <div class="col-span-full text-center py-8">
                            <i class="fas fa-search text-4xl text-gray-400 mb-3"></i>
                            <h3 class="text-lg font-medium text-gray-600 dark:text-gray-400">Nenhum produto encontrado para "${searchTerm}"</h3>
                            <button id="clearProductSearch" class="mt-2 text-primary hover:text-primaryDark">Limpar busca</button>
                        </div>
                    `;
                    
                    document.getElementById('clearProductSearch').addEventListener('click', () => {
                        productSearch.value = '';
                        updateProductsUI();
                    });
                } else {
                    filteredProducts.forEach(product => {
                        const isFavorite = favorites.products.includes(product.id);
                        
                        productsList.innerHTML += `
                            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col fade-in">
                                <div class="relative">
                                    <img src="${product.imageUrl}" alt="${product.name}" class="w-full h-48 object-cover">
                                    <button class="favorite-btn absolute top-2 right-2 w-9 h-9 rounded-full bg-white dark:bg-gray-800 shadow flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-500 transition-colors" data-type="products" data-id="${product.id}">
                                        <i class="fas fa-heart ${isFavorite ? 'text-red-500' : ''}"></i>
                                    </button>
                                </div>
                                <div class="p-4 flex-grow">
                                    <h3 class="font-semibold text-lg mb-2">${product.name}</h3>
                                    <p class="text-gray-600 dark:text-gray-300 text-sm mb-4">${product.description}</p>
                                </div>
                                <div class="px-4 pb-4">
                                    <a href="${product.redirectUrl}" target="_blank" class="inline-block w-full bg-primary hover:bg-primaryDark text-white font-medium py-2 px-4 rounded text-center transition-colors">
                                        ${product.buttonText || 'Ver Produto'}
                                    </a>
                                </div>
                            </div>
                        `;
                    });
                }
            }
            
            setupEventListeners();
        }
        
        // Update Gallery UI
        function updateGalleryUI() {
            galleryGrid.innerHTML = '';
            
            if (images.length === 0) {
                galleryGrid.classList.add('hidden');
                noGallery.classList.remove('hidden');
            } else {
                galleryGrid.classList.remove('hidden');
                noGallery.classList.add('hidden');
                
                // Filter images by search term if needed
                const searchTerm = gallerySearch.value.trim().toLowerCase();
                const filteredImages = searchTerm ? 
                    images.filter(image => 
                        image.title.toLowerCase().includes(searchTerm)
                    ) : images;
                
                if (filteredImages.length === 0) {
                    galleryGrid.innerHTML = `
                        <div class="col-span-full text-center py-8">
                            <i class="fas fa-search text-4xl text-gray-400 mb-3"></i>
                            <h3 class="text-lg font-medium text-gray-600 dark:text-gray-400">Nenhuma imagem encontrada para "${searchTerm}"</h3>
                            <button id="clearGallerySearch" class="mt-2 text-primary hover:text-primaryDark">Limpar busca</button>
                        </div>
                    `;
                    
                    document.getElementById('clearGallerySearch').addEventListener('click', () => {
                        gallerySearch.value = '';
                        updateGalleryUI();
                    });
                } else {
                    filteredImages.forEach(image => {
                        const isFavorite = favorites.images.includes(image.id);
                        
                        galleryGrid.innerHTML += `
                            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden relative group fade-in">
                                <img src="${image.url}" alt="${image.title}" class="w-full h-40 object-cover">
                                <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button class="view-image-btn mr-2 w-9 h-9 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-primary" data-url="${image.url}" data-title="${image.title}">
                                        <i class="fas fa-search-plus"></i>
                                    </button>
                                    <button class="favorite-btn w-9 h-9 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-red-500" data-type="images" data-id="${image.id}">
                                        <i class="fas fa-heart ${isFavorite ? 'text-red-500' : ''}"></i>
                                    </button>
                                </div>
                                <div class="p-2 text-center">
                                    <h3 class="text-sm font-medium truncate">${image.title}</h3>
                                </div>
                            </div>
                        `;
                    });
                }
            }
            
            setupEventListeners();
        }
        
        // Update Favorites UI
        function updateFavoritesUI() {
            // Update favorite products
            favoriteProducts.innerHTML = '';
            
            if (!favorites.products || favorites.products.length === 0) {
                favoriteProducts.classList.add('hidden');
                noFavoriteProducts.classList.remove('hidden');
            } else {
                favoriteProducts.classList.remove('hidden');
                noFavoriteProducts.classList.add('hidden');
                
                const favProductsList = products.filter(product => favorites.products.includes(product.id));
                
                favProductsList.forEach(product => {
                    favoriteProducts.innerHTML += `
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col fade-in">
                            <div class="relative">
                                <img src="${product.imageUrl}" alt="${product.name}" class="w-full h-48 object-cover">
                                <button class="favorite-btn absolute top-10 right-2 w-9 h-9 rounded-full bg-white dark:bg-gray-800 shadow flex items-center justify-center text-red-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" data-type="products" data-id="${product.id}">
                                    <i class="fas fa-heart"></i>
                                </button>
                            </div>
                            <div class="p-4 flex-grow">
                                <h3 class="font-semibold text-lg mb-2">${product.name}</h3>
                                <p class="text-gray-600 dark:text-gray-300 text-sm mb-4">${product.description}</p>
                            </div>
                            <div class="px-4 pb-4">
                                <a href="${product.redirectUrl}" target="_blank" class="inline-block w-full bg-primary hover:bg-primaryDark text-white font-medium py-2 px-4 rounded text-center transition-colors">
                                    ${product.buttonText || 'Ver Produto'}
                                </a>
                            </div>
                        </div>
                    `;
                });
            }
            
            // Update favorite images
            favoriteImages.innerHTML = '';
            
            if (!favorites.images || favorites.images.length === 0) {
                favoriteImages.classList.add('hidden');
                noFavoriteImages.classList.remove('hidden');
            } else {
                favoriteImages.classList.remove('hidden');
                noFavoriteImages.classList.add('hidden');
                
                const favImagesList = images.filter(image => favorites.images.includes(image.id));
                
                favImagesList.forEach(image => {
                    favoriteImages.innerHTML += `
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden relative group fade-in">
                            <img src="${image.url}" alt="${image.title}" class="w-full h-40 object-cover">
                            <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button class="view-image-btn mr-2 w-9 h-9 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-primary" data-url="${image.url}" data-title="${image.title}">
                                    <i class="fas fa-search-plus"></i>
                                </button>
                                <button class="favorite-btn w-9 h-9 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-red-500 hover:text-gray-700 dark:hover:text-gray-300" data-type="images" data-id="${image.id}">
                                    <i class="fas fa-heart"></i>
                                </button>
                            </div>
                            <div class="p-2 text-center">
                                <h3 class="text-sm font-medium truncate">${image.title}</h3>
                            </div>
                        </div>
                    `;
                });
            }
            
            setupEventListeners();
            
            // Update counts
            dashboardFavoritesCount.textContent = (favorites.products.length || 0) + (favorites.images.length || 0);
            profileFavProducts.textContent = favorites.products.length || 0;
            profileFavImages.textContent = favorites.images.length || 0;
        }
        
        // Update Profile UI
        function updateProfileUI() {
            if (!userData) return;
            
            const displayName = userData.name || userData.email.split('@')[0];
            const initials = getInitials(displayName);
            
            // Update profile info
            profileInitials.textContent = initials;
            profileName.textContent = displayName;
            profileEmail.textContent = userData.email;
            profileFavProducts.textContent = favorites.products.length || 0;
            profileFavImages.textContent = favorites.images.length || 0;
            
            // Update profile form
            profileDisplayName.value = userData.name || '';
            profileEmailInput.value = userData.email;
            profilePhone.value = userData.phone || '';
        }
        
        // Search Handlers
        productSearch.addEventListener('input', debounce(() => {
            updateProductsUI();
        }, 300));
        
        gallerySearch.addEventListener('input', debounce(() => {
            updateGalleryUI();
        }, 300));
        
        // Debounce function (for search)
        function debounce(func, delay) {
            let timeout;
            return function() {
                const context = this;
                const args = arguments;
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(context, args), delay);
            };
        }
        
        // Profile Form Handler
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!currentUser) return;
            
            showLoading();
            
            try {
                const newName = profileDisplayName.value.trim();
                const newPhone = profilePhone.value.trim();
                
                // Update user data
                userData.name = newName;
                userData.phone = newPhone;
                
                // Save to database
                await database.ref(`clients/${userData.id}`).update({
                    name: newName,
                    phone: newPhone
                });
                
                // Update UI
                updateUserUI();
                showSuccess(profileSuccess, 'Perfil atualizado com sucesso!');
            } catch (error) {
                console.error('Erro ao atualizar perfil:', error);
                showError(profileError, `Erro ao atualizar perfil: ${error.message}`);
            } finally {
                hideLoading();
            }
        });
        
        // Image Modal Functions
        function openImageModal(url, title) {
            modalImage.src = url;
            modalImageTitle.textContent = title;
            imageModal.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
        }
        
        function closeImageModal() {
            imageModal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
            setTimeout(() => {
                modalImage.src = '';
            }, 300);
        }
        
        imageModalOverlay.addEventListener('click', closeImageModal);
        closeImageModalBtn.addEventListener('click', closeImageModal);
        
        // Navigation Functions
        function navigateToPage(pageId) {
            // Update URL hash
            window.location.hash = pageId;
            
            // Update active nav link
            navLinks.forEach(link => {
                const linkPage = link.getAttribute('data-page');
                if (linkPage === pageId) {
                    link.classList.add('bg-primary', 'text-white');
                    link.classList.remove('text-gray-700', 'dark:text-gray-300', 'hover:bg-gray-100', 'dark:hover:bg-gray-700');
                } else {
                    link.classList.remove('bg-primary', 'text-white');
                    link.classList.add('text-gray-700', 'dark:text-gray-300', 'hover:bg-gray-100', 'dark:hover:bg-gray-700');
                }
            });
            
            // Show selected page
            pages.forEach(page => {
                const pageName = page.id.split('-')[0];
                if (pageName === pageId) {
                    page.classList.remove('hidden');
                } else {
                    page.classList.add('hidden');
                }
            });
            
            // Close mobile menu if open
            if (window.innerWidth < 1024) {
                sideNav.classList.add('-translate-x-full');
                sideNavOverlay.classList.add('hidden');
            }
        }
        
        // Handle URL hash navigation
        window.addEventListener('hashchange', () => {
            const pageId = window.location.hash.replace('#', '') || 'dashboard';
            navigateToPage(pageId);
        });
        
        // Navigation Link Handlers
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const pageId = link.getAttribute('data-page');
                navigateToPage(pageId);
            });
        });
        
        // Dashboard page navigation links
        document.querySelectorAll('[data-page]').forEach(link => {
            if (!link.classList.contains('nav-link')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const pageId = link.getAttribute('data-page');
                    navigateToPage(pageId);
                });
            }
        });
        
        // Mobile Menu Toggle
        menuToggle.addEventListener('click', () => {
            sideNav.classList.toggle('-translate-x-full');
            sideNavOverlay.classList.toggle('hidden');
        });
        
        sideNavOverlay.addEventListener('click', () => {
            sideNav.classList.add('-translate-x-full');
            sideNavOverlay.classList.add('hidden');
        });
        
        // User Dropdown Toggle
        userDropdown.addEventListener('click', () => {
            userMenu.classList.toggle('hidden');
        });
        
        // Close user menu when clicking outside
        document.addEventListener('click', (e) => {
            if (userDropdown && !userDropdown.contains(e.target)) {
                userMenu.classList.add('hidden');
            }
        });
        
        // User Menu Links
        profileLink.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToPage('profile');
            userMenu.classList.add('hidden');
        });
        
        favoritesLink.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToPage('favorites');
            userMenu.classList.add('hidden');
        });
        
        // Logout Handler
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            showLoading();
            
            // Limpar cookies e dados de login armazenados
            eraseCookie('userEmail');
            clearLoginState();
            
            // Limpar dados do usuário
            currentUser = null;
            userData = null;
            products = [];
            images = [];
            favorites = { products: [], images: [] };
            
            // Mostrar seção de login
            appSection.classList.add('hidden');
            loginSection.classList.remove('hidden');
            
            // Limpar formulário de login
            loginForm.reset();
            loginError.classList.add('hidden');
            
            hideLoading();
        });
        
        // Verificar login salvo e tentar autenticar automaticamente
        checkSavedLogin();
        
    } catch (error) {
        console.error("Erro ao inicializar o Firebase:", error);
        alert(`Erro ao inicializar o aplicativo: ${error.message}`);
        document.getElementById('loadingOverlay').classList.add('hidden');
    }
});

