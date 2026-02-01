import { makeAutoObservable } from 'mobx';

class OrderStore {
  orders = [];

  constructor() {
    makeAutoObservable(this);
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('orders');
      if (saved) {
        try {
          this.orders = JSON.parse(saved);
        } catch {
          this.orders = [];
        }
      }
    }
  }

  persist() {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('orders', JSON.stringify(this.orders));
    }
  }

  addOrder(coctail) {
    const existingOrder = this.orders.find((order) => order.id === coctail.id);
    if (existingOrder) {
      existingOrder.quantity += 1;
    } else {
      this.orders.push({ ...coctail, quantity: 1 });
    }
    this.persist();
  }

  removeOrder(id) {
    this.orders = this.orders.filter((order) => order.id !== id);
    this.persist();
  }

  increaseQuantity(id) {
    const order = this.orders.find((order) => order.id === id);
    if (order) {
      order.quantity += 1;
      this.persist();
    }
  }

  decreaseQuantity(id) {
    const order = this.orders.find((order) => order.id === id);
    if (order && order.quantity > 1) {
      order.quantity -= 1;
      this.persist();
    } else {
      this.removeOrder(id);
    }
  }

  clearOrders() {
    this.orders = [];
    this.persist();
  }
}

const orderStore = new OrderStore();
export default orderStore;
