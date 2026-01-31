import React, { useEffect, useState } from 'react';
import s from './Order.module.css';
import CoctailItem from './OrdersItems/CoctailItem.jsx';
import Dropdown from './Dropdown';
import orderStore from '../../store/OrderStore';
import { observer } from 'mobx-react-lite';
import { auth } from '../../firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

const Order = observer(() => {
  const [user, setUser] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate('/auth');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/auth');
    } catch (error) {
      alert(error.message);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleOrder = () => {
    if (selectedTable && orderStore.orders.length > 0) {
      alert('Заказ принят');
      orderStore.clearOrders();
    }
  };

  const coctailElements = orderStore.orders.map((d, index) => (
    <CoctailItem key={index} name={d.name} id={d.id} price={d.price} img={d.image} quantity={d.quantity} />
  ));

  return (
    <div className={s.page}>
      <div className={s.header}>
        <h1>Your order</h1>
        <p>Review your selection and choose a table before placing the order.</p>
        <div className={s.profileRow}>
          <div className={s.profileNote}>Profile: {user.email}</div>
          <button onClick={handleLogout} className={s.logoutButton}>Logout</button>
        </div>
      </div>
      {orderStore.orders.length > 0 ? (
        <div className={s.dialogsItems}>
          {coctailElements}
          <div className={s.actions}>
            <Dropdown setSelectedTable={setSelectedTable} />
            <button onClick={handleOrder} className={s.orderButton} disabled={!selectedTable}>Place order</button>
            <button onClick={() => orderStore.clearOrders()} className={s.orderButtonSecondary}>Clear order</button>
          </div>
        </div>
      ) : (
        <div className={s.emptyText}>Your cart is empty</div>
      )}
    </div>
  );
});

export default Order;
