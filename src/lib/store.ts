import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ==================== TYPES ====================

export interface User {
  id: string
  email: string
  name: string
  role: 'BUYER' | 'SELLER' | 'ADMIN'
  phone?: string
  avatar?: string
  storeName?: string
  storeDesc?: string
  storeBanner?: string
  storeLogo?: string
  storeSlug?: string
  isVerified: boolean
  balance: number
  loyaltyPoints: number
  totalSpent: number
  totalOrders: number
  bio?: string
  website?: string
  city?: string
  country?: string
  createdAt: string
}

export interface Product {
  id: string
  name: string
  slug?: string
  description: string
  shortDesc?: string
  price: number
  comparePrice?: number
  images: string[]
  videos?: string[]
  category: string
  subCategory?: string
  brand?: string
  tags?: string[]
  condition: string
  material?: string
  color?: string
  size?: string
  gender?: string
  stock: number
  lowStockThreshold: number
  views: number
  wishlistCount: number
  soldCount: number
  rating: number
  reviewCount: number
  status: string
  featured: boolean
  isNew: boolean
  isTrending: boolean
  isBestSeller: boolean
  freeShipping: boolean
  shippingPrice?: number
  shippingDays?: number
  sellerId: string
  seller?: User
  flashSale?: FlashSale
  priceHistory?: PriceHistory[]
  createdAt: string
}

export interface PriceHistory {
  id: string
  productId: string
  price: number
  comparePrice?: number
  recordedAt: string
}

export interface FlashSale {
  id: string
  productId: string
  salePrice: number
  quantity: number
  sold: number
  startTime: string
  endTime: string
  isActive: boolean
}

export interface CartItem {
  product: Product
  quantity: number
  variant?: { size?: string; color?: string }
  savedForLater?: boolean
}

export interface WishlistItem {
  id: string
  productId: string
  product?: Product
  notes?: string
  createdAt: string
}

export interface Order {
  id: string
  orderNumber: string
  invoiceNumber?: string
  buyerId: string
  buyer?: User
  items: OrderItem[]
  subtotal: number
  discount: number
  shipping: number
  tax: number
  totalAmount: number
  commission: number
  sellerEarnings: number
  status: string
  paymentMethod: string
  paymentStatus: string
  paymentId?: string
  paidAt?: string
  shippingAddress?: string
  shippingCity?: string
  shippingCountry?: string
  shippingPhone?: string
  trackingNumber?: string
  trackingUrl?: string
  carrier?: string
  estimatedDelivery?: string
  shippedAt?: string
  deliveredAt?: string
  notes?: string
  loyaltyEarned: number
  loyaltyUsed: number
  couponCode?: string
  couponDiscount: number
  giftCardCode?: string
  giftCardDiscount: number
  cancelledAt?: string
  cancelReason?: string
  createdAt: string
}

export interface OrderItem {
  id: string
  productId: string
  product?: Product
  quantity: number
  price: number
  variant?: string
  status: string
  shippedAt?: string
  deliveredAt?: string
}

export interface Review {
  id: string
  productId: string
  userId: string
  user?: User
  rating: number
  title?: string
  comment: string
  images?: string[]
  isVerified: boolean
  isFeatured: boolean
  helpful: number
  notHelpful: number
  reply?: string
  repliedAt?: string
  status: string
  createdAt: string
}

export interface Message {
  id: string
  senderId: string
  sender?: User
  receiverId: string
  receiver?: User
  productId?: string
  orderId?: string
  subject?: string
  message: string
  attachments?: string[]
  isRead: boolean
  readAt?: string
  createdAt: string
}

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  link?: string
  image?: string
  data?: Record<string, any>
  isRead: boolean
  readAt?: string
  createdAt: string
}

export interface Coupon {
  id: string
  code: string
  type: 'percentage' | 'fixed' | 'free_shipping'
  value: number
  minPurchase?: number
  maxDiscount?: number
  usageLimit?: number
  usedCount: number
  perUserLimit: number
  startDate: string
  endDate: string
  isActive: boolean
  description?: string
}

export interface GiftCard {
  id: string
  code: string
  amount: number
  balance: number
  currency: string
  ownerId?: string
  owner?: User
  createdById?: string
  createdBy?: User
  recipientEmail?: string
  message?: string
  isUsed: boolean
  usedAt?: string
  expiresAt?: string
  isActive: boolean
  createdAt: string
}

export interface Blog {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  coverImage?: string
  authorId: string
  author?: User
  category?: string
  tags?: string[]
  status: 'draft' | 'published'
  views: number
  likes: number
  isFeatured: boolean
  publishedAt?: string
  createdAt: string
}

export interface Brand {
  id: string
  name: string
  slug: string
  logo?: string
  banner?: string
  description?: string
  website?: string
  isVerified: boolean
  isFeatured: boolean
  productCount: number
  followerCount: number
}

export interface HelpArticle {
  id: string
  categoryId: string
  category?: HelpCategory
  title: string
  slug: string
  content: string
  views: number
  helpful: number
  notHelpful: number
  isFeatured: boolean
  createdAt: string
}

export interface HelpCategory {
  id: string
  name: string
  slug: string
  icon?: string
  order: number
  articles?: HelpArticle[]
}

export interface Banner {
  id: string
  title: string
  subtitle?: string
  image: string
  link?: string
  buttonText?: string
  position: 'hero' | 'sidebar' | 'footer'
  startDate?: string
  endDate?: string
  isActive: boolean
  order: number
}

export interface Collection {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  productIds: string[]
  isFeatured: boolean
}

export interface PriceAlert {
  id: string
  userId: string
  productId: string
  product?: Product
  targetPrice: number
  isNotified: boolean
  createdAt: string
}

export interface RecentlyViewedItem {
  id: string
  productId: string
  product?: Product
  viewCount: number
  lastViewed: string
}

export interface Bundle {
  id: string
  name: string
  description?: string
  discount: number
  price: number
  productIds: string[]
  products?: Product[]
  images?: string[]
  isActive: boolean
}

export interface SupportTicket {
  id: string
  userId: string
  user?: User
  orderId?: string
  subject: string
  category: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  replies: TicketReply[]
  resolvedAt?: string
  createdAt: string
}

export interface TicketReply {
  id: string
  ticketId: string
  userId: string
  user?: User
  message: string
  attachments?: string[]
  isStaff: boolean
  createdAt: string
}

export interface VendorPayout {
  id: string
  sellerId: string
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  method: string
  accountInfo?: string
  reference?: string
  processedAt?: string
  createdAt: string
}

// ==================== AUTH STORE ====================

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null
      }))
    }),
    { name: 'stylehub-auth' }
  )
)

// ==================== CART STORE ====================

interface CartState {
  items: CartItem[]
  appliedCoupon: Coupon | null
  giftCard: GiftCard | null
  loyaltyPointsUsed: number
  addItem: (product: Product, quantity?: number, variant?: { size?: string; color?: string }) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  moveToWishlist: (productId: string) => void
  saveForLater: (productId: string) => void
  moveToCart: (productId: string) => void
  clearCart: () => void
  applyCoupon: (coupon: Coupon | null) => void
  applyGiftCard: (giftCard: GiftCard | null) => void
  setLoyaltyPoints: (points: number) => void
  getSubtotal: () => number
  getDiscount: () => number
  getShipping: () => number
  getTax: () => number
  getTotal: () => number
  getItemCount: () => number
  getSavedItems: () => CartItem[]
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,
      giftCard: null,
      loyaltyPointsUsed: 0,
      addItem: (product, quantity = 1, variant) => set((state) => {
        const key = variant ? `${product.id}-${JSON.stringify(variant)}` : product.id
        const existingItem = state.items.find(item => 
          (variant ? JSON.stringify(item.variant) === JSON.stringify(variant) : !item.variant) &&
          item.product.id === product.id
        )
        if (existingItem) {
          return {
            items: state.items.map(item =>
              item.product.id === product.id && 
              (variant ? JSON.stringify(item.variant) === JSON.stringify(variant) : !item.variant)
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          }
        }
        return { items: [...state.items, { product, quantity, variant }] }
      }),
      removeItem: (productId) => set((state) => ({
        items: state.items.filter(item => item.product.id !== productId)
      })),
      updateQuantity: (productId, quantity) => set((state) => ({
        items: quantity > 0
          ? state.items.map(item =>
              item.product.id === productId ? { ...item, quantity } : item
            )
          : state.items.filter(item => item.product.id !== productId)
      })),
      moveToWishlist: (productId) => {
        set((state) => ({
          items: state.items.filter(item => item.product.id !== productId)
        }))
      },
      saveForLater: (productId) => set((state) => ({
        items: state.items.map(item =>
          item.product.id === productId ? { ...item, savedForLater: true } : item
        )
      })),
      moveToCart: (productId) => set((state) => ({
        items: state.items.map(item =>
          item.product.id === productId ? { ...item, savedForLater: false } : item
        )
      })),
      clearCart: () => set({ items: [], appliedCoupon: null, giftCard: null, loyaltyPointsUsed: 0 }),
      applyCoupon: (coupon) => set({ appliedCoupon: coupon }),
      applyGiftCard: (giftCard) => set({ giftCard }),
      setLoyaltyPoints: (points) => set({ loyaltyPointsUsed: points }),
      getSubtotal: () => get().items
        .filter(item => !item.savedForLater)
        .reduce((sum, item) => {
          const price = item.variant && item.product.flashSale?.isActive
            ? item.product.flashSale.salePrice
            : item.product.price
          return sum + price * item.quantity
        }, 0),
      getDiscount: () => {
        const { items, appliedCoupon, giftCard, loyaltyPointsUsed, getSubtotal } = get()
        const subtotal = getSubtotal()
        let discount = 0
        
        if (appliedCoupon) {
          if (appliedCoupon.minPurchase && subtotal < appliedCoupon.minPurchase) return 0
          discount = appliedCoupon.type === 'percentage' 
            ? subtotal * (appliedCoupon.value / 100)
            : appliedCoupon.value
          if (appliedCoupon.maxDiscount) discount = Math.min(discount, appliedCoupon.maxDiscount)
        }
        
        if (giftCard) {
          discount += Math.min(giftCard.balance, subtotal - discount)
        }
        
        // Loyalty points: 1 point = $0.01
        discount += loyaltyPointsUsed * 0.01
        
        return Math.min(discount, subtotal)
      },
      getShipping: () => {
        const { items, getSubtotal } = get()
        const subtotal = getSubtotal()
        const freeShippingThreshold = 50 // $50 free shipping
        if (subtotal >= freeShippingThreshold) return 0
        return items.filter(item => !item.savedForLater).reduce((sum, item) => {
          if (item.product.freeShipping) return sum
          return sum + (item.product.shippingPrice || 5.99)
        }, 0)
      },
      getTax: () => {
        const { getSubtotal, getDiscount } = get()
        return (getSubtotal() - getDiscount()) * 0.08 // 8% tax
      },
      getTotal: () => {
        const { getSubtotal, getDiscount, getShipping, getTax } = get()
        return getSubtotal() - getDiscount() + getShipping() + getTax()
      },
      getItemCount: () => get().items.filter(item => !item.savedForLater).reduce((sum, item) => sum + item.quantity, 0),
      getSavedItems: () => get().items.filter(item => item.savedForLater)
    }),
    { name: 'stylehub-cart' }
  )
)

// ==================== WISHLIST STORE ====================

interface WishlistState {
  items: WishlistItem[]
  setItems: (items: WishlistItem[]) => void
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  getItemCount: () => number
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      setItems: (items) => set({ items }),
      addItem: (product) => set((state) => {
        if (state.items.find(item => item.productId === product.id)) return state
        return { 
          items: [...state.items, { 
            id: Date.now().toString(), 
            productId: product.id, 
            product,
            createdAt: new Date().toISOString() 
          }] 
        }
      }),
      removeItem: (productId) => set((state) => ({
        items: state.items.filter(item => item.productId !== productId)
      })),
      isInWishlist: (productId) => !!get().items.find(item => item.productId === productId),
      getItemCount: () => get().items.length
    }),
    { name: 'stylehub-wishlist' }
  )
)

// ==================== COMPARISON STORE ====================

interface ComparisonState {
  items: Product[]
  maxItems: number
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  clearComparison: () => void
  isInComparison: (productId: string) => boolean
}

export const useComparisonStore = create<ComparisonState>()(
  persist(
    (set, get) => ({
      items: [],
      maxItems: 4,
      addItem: (product) => set((state) => {
        if (state.items.find(item => item.id === product.id)) return state
        if (state.items.length >= state.maxItems) {
          return { items: [...state.items.slice(1), product] }
        }
        return { items: [...state.items, product] }
      }),
      removeItem: (productId) => set((state) => ({
        items: state.items.filter(item => item.id !== productId)
      })),
      clearComparison: () => set({ items: [] }),
      isInComparison: (productId) => !!get().items.find(item => item.id === productId)
    }),
    { name: 'stylehub-comparison' }
  )
)

// ==================== RECENTLY VIEWED STORE ====================

interface RecentlyViewedState {
  items: RecentlyViewedItem[]
  maxItems: number
  addProduct: (product: Product) => void
  getItems: () => RecentlyViewedItem[]
  clearHistory: () => void
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],
      maxItems: 20,
      addProduct: (product) => set((state) => {
        const existing = state.items.find(item => item.productId === product.id)
        if (existing) {
          return {
            items: [
              { ...existing, viewCount: existing.viewCount + 1, lastViewed: new Date().toISOString() },
              ...state.items.filter(item => item.productId !== product.id)
            ]
          }
        }
        return {
          items: [
            { id: Date.now().toString(), productId: product.id, product, viewCount: 1, lastViewed: new Date().toISOString() },
            ...state.items.slice(0, state.maxItems - 1)
          ]
        }
      }),
      getItems: () => get().items,
      clearHistory: () => set({ items: [] })
    }),
    { name: 'stylehub-recently-viewed' }
  )
)

// Aliases for consistency
export const useRecentlyViewedStoreAlias = () => {
  const store = useRecentlyViewedStore()
  return {
    items: store.items,
    addItem: store.addProduct,
    clearAll: store.clearHistory,
    getItems: store.getItems,
    maxItems: store.maxItems
  }
}

// ==================== UI STORE ====================

interface UIState {
  currentView: string
  previousView: string | null
  selectedProduct: Product | null
  selectedSeller: User | null
  selectedBrand: Brand | null
  selectedCategory: string
  selectedSubCategory: string
  searchQuery: string
  sortBy: 'newest' | 'price-low' | 'price-high' | 'popular' | 'rating'
  viewMode: 'grid' | 'list'
  priceRange: [number, number]
  selectedBrands: string[]
  selectedConditions: string[]
  selectedGenders: string[]
  showLoginModal: boolean
  showRegisterModal: boolean
  showCart: boolean
  showWishlist: boolean
  showComparison: boolean
  showProductModal: boolean
  showFilters: boolean
  showSearch: boolean
  darkMode: boolean
  sidebarOpen: boolean
  
  // Setters
  setCurrentView: (view: string) => void
  setPreviousView: (view: string | null) => void
  setSelectedProduct: (product: Product | null) => void
  setSelectedSeller: (seller: User | null) => void
  setSelectedBrand: (brand: Brand | null) => void
  setSelectedCategory: (category: string) => void
  setSelectedSubCategory: (subCategory: string) => void
  setSearchQuery: (query: string) => void
  setSortBy: (sort: UIState['sortBy']) => void
  setViewMode: (mode: 'grid' | 'list') => void
  setPriceRange: (range: [number, number]) => void
  setSelectedBrands: (brands: string[]) => void
  setSelectedConditions: (conditions: string[]) => void
  setSelectedGenders: (genders: string[]) => void
  setShowLoginModal: (show: boolean) => void
  setShowRegisterModal: (show: boolean) => void
  setShowCart: (show: boolean) => void
  setShowWishlist: (show: boolean) => void
  setShowComparison: (show: boolean) => void
  setShowProductModal: (show: boolean) => void
  setShowFilters: (show: boolean) => void
  setShowSearch: (show: boolean) => void
  toggleDarkMode: () => void
  setSidebarOpen: (open: boolean) => void
  clearFilters: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      currentView: 'home',
      previousView: null,
      selectedProduct: null,
      selectedSeller: null,
      selectedBrand: null,
      selectedCategory: 'all',
      selectedSubCategory: 'all',
      searchQuery: '',
      sortBy: 'newest',
      viewMode: 'grid',
      priceRange: [0, 10000],
      selectedBrands: [],
      selectedConditions: [],
      selectedGenders: [],
      showLoginModal: false,
      showRegisterModal: false,
      showCart: false,
      showWishlist: false,
      showComparison: false,
      showProductModal: false,
      showFilters: false,
      showSearch: false,
      darkMode: false,
      sidebarOpen: false,
      
      setCurrentView: (view) => set({ currentView: view }),
      setPreviousView: (view) => set({ previousView: view }),
      setSelectedProduct: (product) => set({ selectedProduct: product }),
      setSelectedSeller: (seller) => set({ selectedSeller: seller }),
      setSelectedBrand: (brand) => set({ selectedBrand: brand }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setSelectedSubCategory: (subCategory) => set({ selectedSubCategory: subCategory }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSortBy: (sort) => set({ sortBy: sort }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setPriceRange: (range) => set({ priceRange: range }),
      setSelectedBrands: (brands) => set({ selectedBrands: brands }),
      setSelectedConditions: (conditions) => set({ selectedConditions: conditions }),
      setSelectedGenders: (genders) => set({ selectedGenders: genders }),
      setShowLoginModal: (show) => set({ showLoginModal: show }),
      setShowRegisterModal: (show) => set({ showRegisterModal: show }),
      setShowCart: (show) => set({ showCart: show }),
      setShowWishlist: (show) => set({ showWishlist: show }),
      setShowComparison: (show) => set({ showComparison: show }),
      setShowProductModal: (show) => set({ showProductModal: show }),
      setShowFilters: (show) => set({ showFilters: show }),
      setShowSearch: (show) => set({ showSearch: show }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      clearFilters: () => set({
        selectedCategory: 'all',
        selectedSubCategory: 'all',
        priceRange: [0, 10000],
        selectedBrands: [],
        selectedConditions: [],
        selectedGenders: [],
        searchQuery: ''
      })
    }),
    { name: 'stylehub-ui', partialize: (state) => ({ darkMode: state.darkMode, viewMode: state.viewMode }) }
  )
)

// ==================== PRICE ALERTS STORE ====================

interface PriceAlertState {
  alerts: PriceAlert[]
  setAlerts: (alerts: PriceAlert[]) => void
  addAlert: (productId: string, targetPrice: number) => void
  removeAlert: (alertId: string) => void
  updateAlert: (alertId: string, updates: Partial<PriceAlert>) => void
  toggleActive: (alertId: string) => void
}

export const usePriceAlertStore = create<PriceAlertState>()(
  persist(
    (set) => ({
      alerts: [],
      setAlerts: (alerts) => set({ alerts }),
      addAlert: (productId, targetPrice) => set((state) => ({
        alerts: [...state.alerts, {
          id: Date.now().toString(),
          userId: '',
          productId,
          targetPrice,
          isNotified: false,
          createdAt: new Date().toISOString()
        }]
      })),
      removeAlert: (alertId) => set((state) => ({
        alerts: state.alerts.filter(alert => alert.id !== alertId)
      })),
      updateAlert: (alertId, updates) => set((state) => ({
        alerts: state.alerts.map(alert => 
          alert.id === alertId ? { ...alert, ...updates } : alert
        )
      })),
      toggleActive: (alertId) => set((state) => ({
        alerts: state.alerts.map(alert => 
          alert.id === alertId ? { ...alert, isNotified: !alert.isNotified } : alert
        )
      }))
    }),
    { name: 'stylehub-price-alerts' }
  )
)

// ==================== COMPARE STORE (Alias for Comparison with renamed methods) ====================

export const useCompareStore = () => {
  const store = useComparisonStore()
  return {
    items: store.items,
    addItem: store.addItem,
    removeItem: store.removeItem,
    clearAll: store.clearComparison,
    hasItem: store.isInComparison,
    getItemCount: () => store.items.length
  }
}

// ==================== ADDRESS STORE ====================

interface Address {
  id: string
  label: string
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state?: string
  country: string
  zipCode: string
  isDefault: boolean
}

interface AddressState {
  addresses: Address[]
  selectedAddress: Address | null
  addAddress: (address: Omit<Address, 'id'>) => void
  updateAddress: (id: string, address: Partial<Address>) => void
  removeAddress: (id: string) => void
  setDefault: (id: string) => void
  setSelectedAddress: (address: Address | null) => void
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set) => ({
      addresses: [],
      selectedAddress: null,
      addAddress: (address) => set((state) => ({
        addresses: [...state.addresses, { ...address, id: Date.now().toString() }]
      })),
      updateAddress: (id, updates) => set((state) => ({
        addresses: state.addresses.map(addr => 
          addr.id === id ? { ...addr, ...updates } : addr
        )
      })),
      removeAddress: (id) => set((state) => ({
        addresses: state.addresses.filter(addr => addr.id !== id)
      })),
      setDefault: (id) => set((state) => ({
        addresses: state.addresses.map(addr => ({
          ...addr,
          isDefault: addr.id === id
        }))
      })),
      setSelectedAddress: (address) => set({ selectedAddress: address })
    }),
    { name: 'stylehub-addresses' }
  )
)

// ==================== GIFT CARD STORE ====================

interface GiftCardState {
  appliedGiftCard: GiftCard | null
  applyGiftCard: (giftCard: GiftCard | null) => void
  getGiftCardBalance: () => number
}

export const useGiftCardStore = create<GiftCardState>()(
  persist(
    (set, get) => ({
      appliedGiftCard: null,
      applyGiftCard: (giftCard) => set({ appliedGiftCard: giftCard }),
      getGiftCardBalance: () => get().appliedGiftCard?.balance || 0
    }),
    { name: 'stylehub-giftcard' }
  )
)

// ==================== REFERRAL STORE ====================

interface ReferralStats {
  referredCount: number
  totalRewards: number
}

interface ReferralState {
  referralCode: string | null
  referralStats: ReferralStats
  setReferralCode: (code: string | null) => void
  setReferralStats: (stats: ReferralStats) => void
}

export const useReferralStore = create<ReferralState>()(
  persist(
    (set) => ({
      referralCode: null,
      referralStats: { referredCount: 0, totalRewards: 0 },
      setReferralCode: (code) => set({ referralCode: code }),
      setReferralStats: (stats) => set({ referralStats: stats })
    }),
    { name: 'stylehub-referral' }
  )
)
