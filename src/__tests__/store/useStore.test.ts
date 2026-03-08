import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '@/store/useStore';
import type { CartItem, WishlistItem } from '@/store/useStore';

// Reset store state before each test
beforeEach(() => {
  useStore.setState({ cart: [], wishlist: [] });
});

describe('useStore - Cart operations', () => {
  const sampleItem: Omit<CartItem, 'cartId'> = {
    productId: 'prod-1',
    name: 'Test T-Shirt',
    price: 25000,
    thumbnail: '/images/test.jpg',
    quantity: 1,
    size: 'M',
    color: 'Black',
  };

  it('should add an item to the cart', () => {
    useStore.getState().addToCart(sampleItem);

    const cart = useStore.getState().cart;
    expect(cart).toHaveLength(1);
    expect(cart[0].productId).toBe('prod-1');
    expect(cart[0].name).toBe('Test T-Shirt');
    expect(cart[0].quantity).toBe(1);
  });

  it('should merge quantities when adding the same item twice', () => {
    useStore.getState().addToCart(sampleItem);
    useStore.getState().addToCart(sampleItem);

    const cart = useStore.getState().cart;
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(2);
  });

  it('should add separate cart entries for different options', () => {
    useStore.getState().addToCart(sampleItem);
    useStore.getState().addToCart({ ...sampleItem, size: 'L' });

    const cart = useStore.getState().cart;
    expect(cart).toHaveLength(2);
  });

  it('should remove an item from the cart', () => {
    useStore.getState().addToCart(sampleItem);
    const cartId = useStore.getState().cart[0].cartId;

    useStore.getState().removeFromCart(cartId);

    expect(useStore.getState().cart).toHaveLength(0);
  });

  it('should clear the entire cart', () => {
    useStore.getState().addToCart(sampleItem);
    useStore.getState().addToCart({ ...sampleItem, size: 'L' });
    expect(useStore.getState().cart).toHaveLength(2);

    useStore.getState().clearCart();

    expect(useStore.getState().cart).toHaveLength(0);
  });

  it('should update quantity with positive delta', () => {
    useStore.getState().addToCart(sampleItem);
    const cartId = useStore.getState().cart[0].cartId;

    useStore.getState().updateQuantity(cartId, 3);

    expect(useStore.getState().cart[0].quantity).toBe(4);
  });

  it('should update quantity with negative delta but not go below 1', () => {
    useStore.getState().addToCart(sampleItem);
    const cartId = useStore.getState().cart[0].cartId;

    // quantity is 1, delta -1 would make it 0, so it should stay at 1
    useStore.getState().updateQuantity(cartId, -1);

    expect(useStore.getState().cart[0].quantity).toBe(1);
  });

  it('should allow decreasing quantity when result stays above 0', () => {
    useStore.getState().addToCart({ ...sampleItem, quantity: 5 });
    const cartId = useStore.getState().cart[0].cartId;

    useStore.getState().updateQuantity(cartId, -2);

    expect(useStore.getState().cart[0].quantity).toBe(3);
  });
});

describe('useStore - Wishlist operations', () => {
  const sampleWishlistItem: WishlistItem = {
    productId: 'prod-1',
    name: 'Test T-Shirt',
    price: 25000,
    thumbnail: '/images/test.jpg',
    category: 'tshirts',
  };

  it('should add item to wishlist via toggle', () => {
    useStore.getState().toggleWishlist(sampleWishlistItem);

    const wishlist = useStore.getState().wishlist;
    expect(wishlist).toHaveLength(1);
    expect(wishlist[0].productId).toBe('prod-1');
  });

  it('should remove item from wishlist when toggled again', () => {
    useStore.getState().toggleWishlist(sampleWishlistItem);
    expect(useStore.getState().wishlist).toHaveLength(1);

    useStore.getState().toggleWishlist(sampleWishlistItem);
    expect(useStore.getState().wishlist).toHaveLength(0);
  });

  it('should correctly report isInWishlist', () => {
    expect(useStore.getState().isInWishlist('prod-1')).toBe(false);

    useStore.getState().toggleWishlist(sampleWishlistItem);
    expect(useStore.getState().isInWishlist('prod-1')).toBe(true);

    useStore.getState().toggleWishlist(sampleWishlistItem);
    expect(useStore.getState().isInWishlist('prod-1')).toBe(false);
  });
});
